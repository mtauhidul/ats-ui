import type { BaseEntity, Attachment } from "./common";
import type { CandidateSource } from "./candidate";

// Application status - initial stage before moving to candidate pipeline
export const ApplicationStatus = {
  PENDING: "pending", // Newly submitted, awaiting review
  UNDER_REVIEW: "under_review", // Being reviewed by recruiter/hiring manager
  APPROVED: "approved", // Approved to move to candidate pipeline
  REJECTED: "rejected", // Rejected, will not proceed
  WITHDRAWN: "withdrawn", // Candidate withdrew their application
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

// Application priority (set by reviewers)
export const ApplicationPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type ApplicationPriority = (typeof ApplicationPriority)[keyof typeof ApplicationPriority];

// Initial job application before approval
export interface Application extends BaseEntity {
  // Job and candidate basic info
  jobId: string;
  jobTitle: string; // Cached for display
  clientId: string;
  clientName: string; // Cached for display
  
  // Applicant information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Application details
  status: ApplicationStatus;
  priority?: ApplicationPriority;
  source: CandidateSource;
  referredBy?: string;
  
  // Application content
  coverLetter?: string;
  resume?: Attachment;
  additionalDocuments?: Attachment[];
  
  // Candidate background (basic info from application)
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
    period: "hourly" | "monthly" | "yearly";
  };
  
  // Skills mentioned in application
  skills?: string[];
  
  // Availability
  availableStartDate?: Date;
  preferredWorkMode?: "remote" | "onsite" | "hybrid";
  willingToRelocate?: boolean;
  
  // Social profiles
  linkedInUrl?: string;
  portfolioUrl?: string;
  
  // Review information
  reviewedBy?: string; // User ID who reviewed
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  
  // If approved, stores the created candidate ID
  candidateId?: string;
  
  // Metadata
  submittedAt: Date;
  lastUpdated: Date;
}

// Application with related data for display
export interface ApplicationWithRelations extends Application {
  job: {
    id: string;
    title: string;
    status: string;
    type: string;
    location?: {
      city: string;
      country: string;
    };
  };
  client: {
    id: string;
    companyName: string;
    logo?: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Application summary for lists
export interface ApplicationSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  clientLogo?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: ApplicationStatus;
  priority?: ApplicationPriority;
  source: CandidateSource;
  yearsOfExperience?: number;
  submittedAt: Date;
  reviewedAt?: Date;
  hasResume: boolean;
  hasCoverLetter: boolean;
}

// Create application request (from job application form)
export interface CreateApplicationRequest {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
    period: "hourly" | "monthly" | "yearly";
  };
  skills?: string[];
  availableStartDate?: Date;
  preferredWorkMode?: "remote" | "onsite" | "hybrid";
  willingToRelocate?: boolean;
  linkedInUrl?: string;
  portfolioUrl?: string;
  source: CandidateSource;
  referredBy?: string;
}

// Review application request
export interface ReviewApplicationRequest {
  status: ApplicationStatus;
  priority?: ApplicationPriority;
  reviewNotes?: string;
  rejectionReason?: string;
}

// Bulk application actions
export interface BulkApplicationAction {
  applicationIds: string[];
  action: "approve" | "reject" | "set_priority";
  priority?: ApplicationPriority;
  rejectionReason?: string;
  notes?: string;
}

// Application filters
export interface ApplicationFilters {
  search?: string;
  jobId?: string;
  clientId?: string;
  status?: ApplicationStatus[];
  priority?: ApplicationPriority[];
  source?: CandidateSource[];
  yearsOfExperienceMin?: number;
  yearsOfExperienceMax?: number;
  submittedAfter?: Date;
  submittedBefore?: Date;
  reviewedBy?: string;
  hasResume?: boolean;
  hasCoverLetter?: boolean;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  availableAfter?: Date;
}

export type ApplicationSortField = 
  | "submittedAt"
  | "firstName" 
  | "lastName" 
  | "jobTitle"
  | "clientName"
  | "status" 
  | "priority"
  | "reviewedAt"
  | "yearsOfExperience";

// Application statistics
export interface ApplicationStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  avgReviewTime?: number; // in hours
  approvalRate?: number; // percentage
  topSources: {
    source: CandidateSource;
    count: number;
  }[];
  applicationsByDay: {
    date: string;
    count: number;
  }[];
}