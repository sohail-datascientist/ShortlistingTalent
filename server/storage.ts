import { 
  users, 
  jobDescriptions, 
  resumes, 
  results,
  type User, 
  type InsertUser,
  type JobDescription,
  type InsertJobDescription,
  type Resume,
  type InsertResume,
  type Result,
  type InsertResult
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Job Description operations
  createJobDescription(jd: InsertJobDescription & { userId: number }): Promise<JobDescription>;
  getJobDescriptionsByUser(userId: number): Promise<JobDescription[]>;
  getJobDescription(id: number): Promise<JobDescription | undefined>;

  // Resume operations
  createResume(resume: InsertResume & { userId: number }): Promise<Resume>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;

  // Results operations
  createResult(result: InsertResult): Promise<Result>;
  getResultsByUser(userId: number): Promise<Result[]>;
  getResultsByJd(jdId: number): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createJobDescription(jdData: InsertJobDescription & { userId: number }): Promise<JobDescription> {
    const [jd] = await db
      .insert(jobDescriptions)
      .values(jdData)
      .returning();
    return jd;
  }

  async getJobDescriptionsByUser(userId: number): Promise<JobDescription[]> {
    return await db.select().from(jobDescriptions).where(eq(jobDescriptions.userId, userId));
  }

  async getJobDescription(id: number): Promise<JobDescription | undefined> {
    const [jd] = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id));
    return jd || undefined;
  }

  async createResume(resumeData: InsertResume & { userId: number }): Promise<Resume> {
    const [resume] = await db
      .insert(resumes)
      .values(resumeData)
      .returning();
    return resume;
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async createResult(resultData: InsertResult): Promise<Result> {
    const [result] = await db
      .insert(results)
      .values(resultData)
      .returning();
    return result;
  }

  async getResultsByUser(userId: number): Promise<Result[]> {
    const userResumes = await this.getResumesByUser(userId);
    const resumeIds = userResumes.map(r => r.id);
    if (resumeIds.length === 0) return [];
    
    return await db.select().from(results).where(
      inArray(results.resumeId, resumeIds)
    );
  }

  async getResultsByJd(jdId: number): Promise<Result[]> {
    return await db.select().from(results).where(eq(results.jdId, jdId));
  }

  async getResult(id: number): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(eq(results.id, id));
    return result || undefined;
  }
}

export const storage = new DatabaseStorage();