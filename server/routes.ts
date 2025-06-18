import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertJobDescriptionSchema, insertResumeSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { extractTextFromBuffer, validateFileType, validateFileSize } from "./services/fileProcessor";
import { parseResumeWithGroq, generateSummary } from "./services/groq";
import { calculateEnhancedSimilarity } from "./services/similarity";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  // File upload route
  app.post("/api/upload", authenticateToken, upload.any(), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.userId;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Separate job description and resumes
      const jobDescriptionFiles = files.filter(file => file.fieldname === 'jobDescription');
      const resumeFiles = files.filter(file => file.fieldname === 'resumes');

      if (jobDescriptionFiles.length === 0) {
        return res.status(400).json({ message: "Job description file is required" });
      }

      if (resumeFiles.length === 0) {
        return res.status(400).json({ message: "At least one resume file is required" });
      }

      // Process job description
      const jdFile = jobDescriptionFiles[0];
      if (!validateFileType(jdFile.originalname) || !validateFileSize(jdFile.size)) {
        return res.status(400).json({ message: "Invalid job description file" });
      }

      const jdText = await extractTextFromBuffer(jdFile.buffer, jdFile.originalname);
      const jobDescription = await storage.createJobDescription({
        userId,
        fileName: jdFile.originalname,
        jdText
      });

      // Process resumes
      const resumeIds: number[] = [];
      for (const resumeFile of resumeFiles) {
        if (!validateFileType(resumeFile.originalname) || !validateFileSize(resumeFile.size)) {
          continue; // Skip invalid files
        }

        const resumeText = await extractTextFromBuffer(resumeFile.buffer, resumeFile.originalname);
        const resume = await storage.createResume({
          userId,
          fileName: resumeFile.originalname,
          resumeText
        });
        resumeIds.push(resume.id);
      }

      res.json({
        message: "Files uploaded successfully",
        jobDescriptionId: jobDescription.id,
        resumeIds,
        totalResumes: resumeIds.length
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Process resumes route
  app.post("/api/process", authenticateToken, async (req: any, res) => {
    try {
      const { jobDescriptionId, resumeIds } = req.body;
      const userId = req.userId;

      if (!jobDescriptionId || !resumeIds || !Array.isArray(resumeIds)) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      // Get job description
      const jobDescription = await storage.getJobDescription(jobDescriptionId);
      if (!jobDescription || jobDescription.userId !== userId) {
        return res.status(404).json({ message: "Job description not found" });
      }

      const results = [];

      // Process each resume
      for (const resumeId of resumeIds) {
        try {
          const resume = await storage.getResume(resumeId);
          if (!resume || resume.userId !== userId) {
            continue; // Skip invalid resumes
          }

          // Parse resume with Groq
          const parsedData = await parseResumeWithGroq(resume.resumeText, jobDescription.jdText);
          
          // Generate summary
          const summary = await generateSummary(resume.resumeText, jobDescription.jdText);
          
          // Calculate similarity score
          const similarity = calculateEnhancedSimilarity(
            resume.resumeText, 
            jobDescription.jdText, 
            parsedData.technical_skills
          );

          // Store result
          const result = await storage.createResult({
            resumeId: resume.id,
            jdId: jobDescription.id,
            fullName: parsedData.full_name,
            university: parsedData.university_name,
            universityType: parsedData.university_type,
            email: parsedData.email_id,
            github: parsedData.github_link,
            experience: parsedData.total_professional_experience,
            location: parsedData.location,
            summary,
            similarity,
            technicalSkills: parsedData.technical_skills,
            softSkills: parsedData.soft_skills,
            employmentDetails: parsedData.employment_details
          });

          results.push(result);
        } catch (error) {
          console.error(`Error processing resume ${resumeId}:`, error);
          // Continue with other resumes
        }
      }

      res.json({
        message: "Processing completed",
        processedCount: results.length,
        results
      });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({ message: "Processing failed" });
    }
  });

  // Get results route
  app.get("/api/results", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.userId;
      const results = await storage.getResultsByUser(userId);
      res.json(results);
    } catch (error) {
      console.error("Results fetch error:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Get analytics route
  app.get("/api/analytics", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.userId;
      const results = await storage.getResultsByUser(userId);

      if (results.length === 0) {
        return res.json({
          totalResumes: 0,
          totalFreshGrads: 0,
          topCandidates: [],
          uniqueUniversities: 0,
          averageSimilarity: 0,
          experienceDistribution: {},
          universityTypeDistribution: {},
          similarityDistribution: {}
        });
      }

      // Calculate analytics
      const totalResumes = results.length;
      const totalFreshGrads = results.filter(r => 
        r.experience?.toLowerCase().includes('fresh') || 
        r.experience?.toLowerCase().includes('graduate')
      ).length;

      const topCandidates = results
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, 2)
        .map(r => ({
          name: r.fullName,
          similarity: r.similarity,
          university: r.university
        }));

      const uniqueUniversities = new Set(results.map(r => r.university)).size;
      
      const averageSimilarity = results.reduce((sum, r) => sum + (r.similarity || 0), 0) / totalResumes;

      // Experience distribution
      const experienceDistribution = results.reduce((acc: any, r) => {
        const exp = r.experience || 'Unknown';
        acc[exp] = (acc[exp] || 0) + 1;
        return acc;
      }, {});

      // University type distribution
      const universityTypeDistribution = results.reduce((acc: any, r) => {
        const type = r.universityType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Similarity score distribution
      const similarityDistribution = results.reduce((acc: any, r) => {
        const score = r.similarity || 0;
        const bucket = Math.floor(score * 10) / 10; // Group by 0.1 intervals
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalResumes,
        totalFreshGrads,
        topCandidates,
        uniqueUniversities,
        averageSimilarity: Math.round(averageSimilarity * 100) / 100,
        experienceDistribution,
        universityTypeDistribution,
        similarityDistribution
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get specific result route
  app.get("/api/result/:id", authenticateToken, async (req: any, res) => {
    try {
      const resultId = parseInt(req.params.id);
      const result = await storage.getResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Result fetch error:", error);
      res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
