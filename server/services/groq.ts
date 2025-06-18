import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

const PARSING_PROMPT = `You are an AI bot designed to parse resumes and extract the following details in JSON:
- full_name
- university_name (short form preferred)
- national_university/international_university
- email_id (or "N/A")
- github_link (or "N/A")
- employment_details: [company, position, years, location, tag]
- total_professional_experience (or "Fresh Graduate")
- technical_skills (top 5 based on JD)
- soft_skills (top 5 based on JD)
- location
Return the result in proper JSON and sentence case.`;

const SUMMARY_PROMPT = `Based on the job description and the candidate's resume, write a summary of 3 sentences about the relevance and suitability of the candidate for the job.`;

export interface ParsedResume {
  full_name: string;
  university_name: string;
  university_type: "National" | "International";
  email_id: string;
  github_link: string;
  employment_details: Array<{
    company: string;
    position: string;
    years: string;
    location: string;
    tag: string;
  }>;
  total_professional_experience: string;
  technical_skills: string[];
  soft_skills: string[];
  location: string;
}

export async function parseResumeWithGroq(resumeText: string, jdText: string): Promise<ParsedResume> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: PARSING_PROMPT
        },
        {
          role: "user",
          content: `Job Description:\n${jdText}\n\nResume:\n${resumeText}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq API");
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Groq response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Normalize the response to match our expected format
    return {
      full_name: parsed.full_name || "N/A",
      university_name: parsed.university_name || "N/A",
      university_type: parsed.national_university ? "National" : "International",
      email_id: parsed.email_id || "N/A",
      github_link: parsed.github_link || "N/A",
      employment_details: parsed.employment_details || [],
      total_professional_experience: parsed.total_professional_experience || "Fresh Graduate",
      technical_skills: parsed.technical_skills || [],
      soft_skills: parsed.soft_skills || [],
      location: parsed.location || "N/A"
    };
  } catch (error) {
    console.error("Error parsing resume with Groq:", error);
    throw new Error("Failed to parse resume with AI");
  }
}

export async function generateSummary(resumeText: string, jdText: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SUMMARY_PROMPT
        },
        {
          role: "user",
          content: `Job Description:\n${jdText}\n\nResume:\n${resumeText}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "Unable to generate summary";
  } catch (error) {
    console.error("Error generating summary with Groq:", error);
    throw new Error("Failed to generate summary");
  }
}
