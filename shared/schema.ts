import { pgTable, text, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  jdText: text("jd_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  resumeText: text("resume_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id).notNull(),
  jdId: integer("jd_id").references(() => jobDescriptions.id).notNull(),
  fullName: text("full_name"),
  university: text("university"),
  universityType: text("university_type"),
  email: text("email"),
  github: text("github"),
  experience: text("experience"),
  location: text("location"),
  summary: text("summary"),
  similarity: real("similarity"),
  technicalSkills: jsonb("technical_skills"),
  softSkills: jsonb("soft_skills"),
  employmentDetails: jsonb("employment_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).pick({
  fileName: true,
  jdText: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  fileName: true,
  resumeText: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
