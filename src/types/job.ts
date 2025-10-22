import type { BaseEntity, Priority, Address } from "./common";

// Job types
export const JobType = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
  FREELANCE: "freelance",
  INTERNSHIP: "internship",
  TEMPORARY: "temporary",
} as const;

export type JobType = (typeof JobType)[keyof typeof JobType];

// Job status
export const JobStatus = {
  DRAFT: "draft",
  OPEN: "open",
  ON_HOLD: "on_hold",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

// Experience level
export const ExperienceLevel = {
  ENTRY: "entry",
  JUNIOR: "junior",
  MID: "mid",
  SENIOR: "senior",
  LEAD: "lead",
  EXECUTIVE: "executive",
} as const;

export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

// Work mode
export const WorkMode = {
  REMOTE: "remote",
  ONSITE: "onsite",
  HYBRID: "hybrid",
} as const;

export type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

// Salary range
export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "hourly" | "daily" | "monthly" | "yearly";
  isNegotiable?: boolean;
}

// Job requirements
export interface JobRequirements {
  education?: string;
  experience: string;
  skills: {
    required: string[];
    preferred: string[];
  };
  languages?: string[];
  certifications?: string[];
}

// Job benefits
export interface JobBenefits {
  healthInsurance?: boolean;
  dentalInsurance?: boolean;
  visionInsurance?: boolean;
  retirementPlan?: boolean;
  paidTimeOff?: string;
  flexibleSchedule?: boolean;
  remoteWork?: boolean;
  professionalDevelopment?: boolean;
  other?: string[];
}

// Main Job interface
export interface Job extends BaseEntity {
  title: string;
  description: string;
  clientId: string;
  status: JobStatus;
  type: JobType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  
  // Location and salary
  location?: Address;
  salaryRange?: SalaryRange;
  
  // Job details
  requirements: JobRequirements;
  benefits?: JobBenefits;
  responsibilities: string[];
  
  // Metadata
  department?: string;
  priority: Priority;
  openings: number; // Number of positions to fill
  filledPositions: number;
  
  // Dates
  applicationDeadline?: Date;
  startDate?: Date;
  
  // Team assignment
  hiringTeamId?: string;
  recruiterIds: string[];
  hiringManagerIds: string[];
  
  // Categorization
  categoryIds: string[];
  tagIds: string[];
  
  // Statistics
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  candidatesInPipeline: number;
  averageTimeToHire?: number; // in days
}

// Job with related data for display
export interface JobWithRelations extends Job {
  client: {
    id: string;
    companyName: string;
    logo?: string;
  };
  hiringTeam?: {
    id: string;
    name: string;
    memberCount: number;
  };
  recruiters: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  hiringManagers: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  categories: {
    id: string;
    name: string;
    color?: string;
  }[];
  tags: {
    id: string;
    name: string;
    color?: string;
  }[];
}

// Job summary for lists
export interface JobSummary {
  id: string;
  title: string;
  clientName: string;
  clientLogo?: string;
  status: JobStatus;
  type: JobType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  location?: {
    city: string;
    country: string;
  };
  salaryRange?: SalaryRange;
  openings: number;
  filledPositions: number;
  totalApplications: number;
  candidatesInPipeline: number;
  priority: Priority;
  applicationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create job request
export interface CreateJobRequest {
  title: string;
  description: string;
  clientId: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  location?: Address;
  salaryRange?: SalaryRange;
  requirements: JobRequirements;
  benefits?: JobBenefits;
  responsibilities: string[];
  department?: string;
  priority: Priority;
  openings: number;
  applicationDeadline?: Date;
  startDate?: Date;
  hiringTeamId?: string;
  recruiterIds: string[];
  hiringManagerIds: string[];
  categoryIds: string[];
  tagIds: string[];
}

// Update job request
export interface UpdateJobRequest {
  title?: string;
  description?: string;
  status?: JobStatus;
  type?: JobType;
  experienceLevel?: ExperienceLevel;
  workMode?: WorkMode;
  location?: Address;
  salaryRange?: SalaryRange;
  requirements?: JobRequirements;
  benefits?: JobBenefits;
  responsibilities?: string[];
  department?: string;
  priority?: Priority;
  openings?: number;
  filledPositions?: number;
  applicationDeadline?: Date;
  startDate?: Date;
  hiringTeamId?: string;
  recruiterIds?: string[];
  hiringManagerIds?: string[];
  categoryIds?: string[];
  tagIds?: string[];
}

// Job filters
export interface JobFilters {
  search?: string;
  clientId?: string;
  status?: JobStatus[];
  type?: JobType[];
  experienceLevel?: ExperienceLevel[];
  workMode?: WorkMode[];
  priority?: Priority[];
  hiringTeamId?: string;
  recruiterId?: string;
  hiringManagerId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  salaryMin?: number;
  salaryMax?: number;
  location?: {
    city?: string;
    country?: string;
  };
  hasOpenings?: boolean;
  applicationDeadlineBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
}

export type JobSortField = 
  | "title" 
  | "clientName" 
  | "status" 
  | "priority" 
  | "createdAt" 
  | "updatedAt" 
  | "applicationDeadline"
  | "totalApplications"
  | "candidatesInPipeline";