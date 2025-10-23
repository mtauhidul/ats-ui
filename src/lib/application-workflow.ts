import type { Application } from "@/types/application";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";

export interface ResumeScore {
  overall: number;
  skills: number;
  experience: number;
  education: number;
  relevance: number;
  details: {
    matchedSkills: string[];
    missingSkills: string[];
    experienceYears: number;
    recommendations: string[];
  };
}

// Mock AI scoring - replace with real API later
export function calculateResumeScore(
  application: Application,
  job: Job
): ResumeScore {
  const requiredSkills = job.requirements.skills.required;
  const applicantSkills = application.skills || [];
  
  const matchedSkills = applicantSkills.filter(skill => 
    requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()))
  );
  
  const missingSkills = requiredSkills.filter(req =>
    !applicantSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
  );
  
  const skillsScore = (matchedSkills.length / requiredSkills.length) * 100;
  const experienceScore = Math.min((application.yearsOfExperience || 0) / 5, 1) * 100;
  const educationScore = application.coverLetter ? 80 : 60;
  const relevanceScore = application.resume ? 90 : 50;
  
  const overall = (skillsScore * 0.4 + experienceScore * 0.3 + educationScore * 0.15 + relevanceScore * 0.15);
  
  return {
    overall: Math.round(overall),
    skills: Math.round(skillsScore),
    experience: Math.round(experienceScore),
    education: educationScore,
    relevance: relevanceScore,
    details: {
      matchedSkills,
      missingSkills,
      experienceYears: application.yearsOfExperience || 0,
      recommendations: missingSkills.length > 0 
        ? [`Consider candidates with: ${missingSkills.join(", ")}`]
        : ["Strong match for the position"]
    }
  };
}

export function approveApplicationAndCreateCandidate(
  application: Application,
  assignedJobId: string,
  approvedBy: string,
  approvedByName: string
): { application: Application; candidate: Partial<Candidate> } {
  
  const updatedApplication: Application = {
    ...application,
    status: "approved",
    assignedJobId,
    assignedClientId: application.targetClientId,
    approvedBy,
    approvedByName,
    approvedAt: new Date(),
  };
  
  const newCandidate: Partial<Candidate> = {
    id: `cand-${Date.now()}`,
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: application.phone,
    currentTitle: application.currentTitle,
    currentCompany: application.currentCompany,
    yearsOfExperience: application.yearsOfExperience || 0,
    source: application.source,
    jobIds: [assignedJobId],
    applicationIds: [application.id],
    clientIds: application.targetClientId ? [application.targetClientId] : [],
    jobApplications: [{
      jobId: assignedJobId,
      applicationId: application.id,
      status: "new",
      appliedAt: application.submittedAt,
      lastStatusChange: new Date(),
      emailIds: [],
      emailsSent: 0,
      emailsReceived: 0,
    }],
    skills: (application.skills || []).map(s => ({ name: s, level: "intermediate" as const })),
    education: [],
    workExperience: [],
    languages: [],
    totalEmailsSent: 0,
    totalEmailsReceived: 0,
    isActive: true,
    categoryIds: [],
    tagIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  updatedApplication.candidateId = newCandidate.id;
  
  return { application: updatedApplication, candidate: newCandidate };
}
