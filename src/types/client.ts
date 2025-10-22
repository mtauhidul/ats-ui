// Client Status Const
export const ClientStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

// Client Type/Industry Categories
export const ClientType = {
  STARTUP: "startup",
  SME: "sme",
  ENTERPRISE: "enterprise",
  TECHNOLOGY: "technology",
  HEALTHCARE: "healthcare",
  FINANCE: "finance",
  EDUCATION: "education",
  OTHER: "other",
} as const;

export type ClientType = (typeof ClientType)[keyof typeof ClientType];

// Company Size Options
export const CompanySize = {
  SMALL: "1-50",
  MEDIUM: "51-200",
  LARGE: "201-500",
  ENTERPRISE: "500+",
} as const;

export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];

// Contact Person Interface (Simplified)
export interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
}

// Enhanced Client Statistics Interface
export interface ClientStatistics {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalCandidates: number;
  hiredCandidates: number;
  pendingCandidates: number;
  rejectedCandidates: number;
  averageTimeToHire?: number; // in days
  successRate?: number; // percentage of successful hires
}

// Main Client Interface
export interface Client {
  id: string;

  // Essential Information
  companyName: string;
  description?: string;
  website?: string;
  logo?: string;

  // Classification
  type: ClientType;
  status: ClientStatus;
  companySize: CompanySize;

  // Primary Contact (Only one required)
  primaryContact: ContactPerson;

  // Location (Single address)
  address?: {
    city: string;
    country: string;
  };

  // Enhanced Statistics (Auto-calculated from jobs/candidates)
  statistics: ClientStatistics;

  // Communication & Notes
  notes?: string; // Important for client communication tracking

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Optional
  tags?: string[];
}

// For API responses and client cards
export interface ClientSummary {
  id: string;
  companyName: string;
  logo?: string;
  status: ClientStatus;
  type: ClientType;
  companySize: CompanySize;
  statistics: ClientStatistics;
  primaryContact: ContactPerson;
  createdAt: Date;
  address?: {
    city: string;
    country: string;
  };
  hasNotes: boolean; // Indicator if client has communication notes
}

// For creating new clients (Minimal required fields)
export interface CreateClientRequest {
  companyName: string;
  description?: string;
  website?: string;
  type: ClientType;
  companySize: CompanySize;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
    position: string;
  };
  address?: {
    city: string;
    country: string;
  };
  notes?: string; // For initial client communication notes
}

// For updating existing clients
export interface UpdateClientRequest {
  companyName?: string;
  description?: string;
  website?: string;
  logo?: string;
  type?: ClientType;
  status?: ClientStatus;
  companySize?: CompanySize;
  primaryContact?: {
    name: string;
    email: string;
    phone?: string;
    position: string;
  };
  address?: {
    city: string;
    country: string;
  };
  notes?: string; // Update communication notes
  tags?: string[];
}

// For filtering (Simplified)
export interface ClientFilters {
  status?: ClientStatus[];
  type?: ClientType[];
  companySize?: CompanySize[];
  hasActiveJobs?: boolean;
  hasNotes?: boolean; // Filter clients with communication notes
  search?: string; // Search in company name, contact name, or notes
}

// For sorting
export type ClientSortField =
  | "companyName"
  | "createdAt"
  | "updatedAt"
  | "totalJobs"
  | "activeJobs"
  | "totalCandidates"
  | "hiredCandidates"
  | "successRate";

export interface ClientSortOptions {
  field: ClientSortField;
  direction: "asc" | "desc";
}

// For client communication tracking
export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  type: "email" | "phone" | "in-person" | "meeting" | "general";
  createdAt: Date;
  createdBy: string; // User who added the note
}
