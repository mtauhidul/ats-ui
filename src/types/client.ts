import type { BaseEntity } from "./common";

// Client Status
export const ClientStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  ON_HOLD: "on_hold",
} as const;

export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

// Industry Categories
export const Industry = {
  TECHNOLOGY: "technology",
  HEALTHCARE: "healthcare",
  FINANCE: "finance",
  EDUCATION: "education",
  RETAIL: "retail",
  MANUFACTURING: "manufacturing",
  CONSULTING: "consulting",
  REAL_ESTATE: "real_estate",
  HOSPITALITY: "hospitality",
  OTHER: "other",
} as const;

export type Industry = (typeof Industry)[keyof typeof Industry];

// Company Size
export const CompanySize = {
  SMALL: "1-50",
  MEDIUM: "51-200",
  LARGE: "201-500",
  ENTERPRISE: "500+",
} as const;

export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];

// Communication Note Type
export const CommunicationNoteType = {
  EMAIL: "email",
  PHONE: "phone",
  MEETING: "meeting",
  VIDEO_CALL: "video_call",
  GENERAL: "general",
} as const;

export type CommunicationNoteType =
  (typeof CommunicationNoteType)[keyof typeof CommunicationNoteType];

// Contact Person
export interface ContactPerson {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  isPrimary: boolean;
}

// Communication Note
export interface CommunicationNote {
  id?: string;
  clientId: string;
  type: CommunicationNoteType;
  subject: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Client Statistics
export interface ClientStatistics {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalCandidates: number;
  activeCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  averageTimeToHire?: number;
  successRate?: number;
}

// Activity History Item
export interface ClientActivityHistory {
  id?: string;
  clientId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Main Client Interface
export interface Client extends BaseEntity {
  // Basic Information (Required)
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;

  // Classification (Required)
  industry: Industry;
  companySize: CompanySize;
  status: ClientStatus;

  // Location (Required)
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };

  // Description
  description?: string;

  // Contacts
  contacts: ContactPerson[];

  // Statistics (Auto-calculated)
  statistics: ClientStatistics;

  // Relations (Database references - stored as IDs)
  jobIds: string[]; // References to Job collection
  
  // Communication
  communicationNotes?: CommunicationNote[];

  // Activity History
  activityHistory?: ClientActivityHistory[];

  // Tags
  tags?: string[];

  // Metadata
  assignedTo?: string;
  assignedToName?: string;
}

// Client Summary
export interface ClientSummary {
  id: string;
  companyName: string;
  logo?: string;
  status: ClientStatus;
  industry: Industry;
  companySize: CompanySize;
  statistics: ClientStatistics;
  primaryContact?: ContactPerson;
  createdAt: Date;
  address: {
    city: string;
    country: string;
  };
}

// Create Client Request
export interface CreateClientRequest {
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  industry: Industry;
  companySize: CompanySize;
  description?: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  contacts: Array<{
    name: string;
    email: string;
    phone?: string;
    position: string;
    isPrimary: boolean;
  }>;
  tags?: string[];
}

// Update Client Request
export interface UpdateClientRequest {
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  industry?: Industry;
  companySize?: CompanySize;
  status?: ClientStatus;
  description?: string;
  address?: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  tags?: string[];
  assignedTo?: string;
}

// Client Filters
export interface ClientFilters {
  status?: ClientStatus[];
  industry?: Industry[];
  companySize?: CompanySize[];
  hasActiveJobs?: boolean;
  assignedTo?: string;
  search?: string;
}

// Client Sort
export type ClientSortField =
  | "companyName"
  | "createdAt"
  | "updatedAt"
  | "totalJobs"
  | "activeJobs"
  | "totalCandidates"
  | "hiredCandidates";

export interface ClientSortOptions {
  field: ClientSortField;
  direction: "asc" | "desc";
}

// Contact CRUD
export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  position: string;
  isPrimary: boolean;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary?: boolean;
}

// Communication Note CRUD
export interface CreateCommunicationNoteRequest {
  type: CommunicationNoteType;
  subject: string;
  content: string;
}

export interface UpdateCommunicationNoteRequest {
  type?: CommunicationNoteType;
  subject?: string;
  content?: string;
}
