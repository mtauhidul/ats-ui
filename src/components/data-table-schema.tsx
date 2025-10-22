import { z } from "zod";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.number(),
  limit: z.number(),
  reviewer: z.string(),
  dateApplied: z.string().optional(),
  jobIdDisplay: z.string().optional(),
  // Additional applicant fields
  photo: z.string().nullable().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  coverLetter: z.string().optional(),
  resumeText: z.string().optional(),
  resumeFilename: z.string().optional(),
  resumeFileSize: z.string().optional(),
  // Personal details
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  educationLevel: z.string().optional(),
  expectedSalary: z.string().optional(),
  languages: z.array(z.string()).optional(),
  notes: z.string().optional(),
  // Video introduction
  videoIntroUrl: z.string().optional(),
  videoIntroFilename: z.string().optional(),
  videoIntroFileSize: z.string().optional(),
  videoIntroDuration: z.string().optional(),
});
