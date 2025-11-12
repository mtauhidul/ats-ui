import type { BaseEntity, Attachment } from "./common";

// Email status
export const EmailStatus = {
  DRAFT: "draft",
  SENT: "sent",
  DELIVERED: "delivered",
  OPENED: "opened",
  BOUNCED: "bounced",
  FAILED: "failed",
  RECEIVED: "received", // For inbound emails from email automation
  PROCESSED: "processed", // For processed application emails
} as const;

export type EmailStatus = (typeof EmailStatus)[keyof typeof EmailStatus];

// Email type/category
export const EmailType = {
  INTERVIEW_INVITATION: "interview_invitation",
  APPLICATION_ACKNOWLEDGMENT: "application_acknowledgment",
  FOLLOW_UP: "follow_up",
  OFFER_LETTER: "offer_letter",
  REJECTION: "rejection",
  SCREENING_REQUEST: "screening_request",
  REFERENCE_CHECK: "reference_check",
  GENERAL: "general",
  AUTOMATED: "automated",
} as const;

export type EmailType = (typeof EmailType)[keyof typeof EmailType];

// Email priority
export const EmailPriority = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type EmailPriority = (typeof EmailPriority)[keyof typeof EmailPriority];

// Email direction (inbound/outbound)
export const EmailDirection = {
  INBOUND: "inbound", // Received from candidate
  OUTBOUND: "outbound", // Sent to candidate
} as const;

export type EmailDirection = (typeof EmailDirection)[keyof typeof EmailDirection];

// Email recipient
export interface EmailRecipient {
  email: string;
  name?: string;
  type: "to" | "cc" | "bcc";
}

// Main Email interface
export interface Email extends BaseEntity {
  // Relations (Database references)
  candidateId: string; // Reference to candidate
  jobId: string; // Reference to job
  clientId?: string; // Reference to client (optional, can be derived from job)
  
  // Thread information
  threadId?: string; // For grouping related emails
  parentEmailId?: string; // For replies
  
  // Email details
  direction: EmailDirection;
  type: EmailType;
  status: EmailStatus;
  priority: EmailPriority;
  
  // Content
  subject: string;
  body: string; // HTML content
  plainTextBody?: string; // Plain text version
  
  // Sender/Recipients
  from: {
    email: string;
    name?: string;
  };
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: string;
  
  // Attachments
  attachments?: Attachment[];
  
  // Tracking
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  openCount: number;
  clickCount: number;
  
  // Metadata
  sentBy?: string; // User ID who sent the email
  sentByName?: string;
  templateId?: string; // If sent using a template
  
  // Flags
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  labels?: string[]; // For categorization/tagging (e.g., "important", "follow-up", "offer")
  
  // Automation
  isAutomated: boolean;
  automationTrigger?: string;
  
  // Notes
  internalNotes?: string;
  
  // Bounce/Error information
  bounceReason?: string;
  errorMessage?: string;
}

// Email thread summary (grouped emails)
export interface EmailThread {
  threadId: string;
  candidateId: string;
  jobId: string;
  subject: string;
  lastEmailDate: Date;
  emailCount: number;
  unreadCount: number;
  hasAttachments: boolean;
  participants: Array<{
    email: string;
    name?: string;
  }>;
  emails: Email[];
}

// Email with related data
export interface EmailWithRelations extends Email {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  job: {
    id: string;
    title: string;
    clientId: string;
  };
  client?: {
    id: string;
    companyName: string;
    logo?: string;
  };
  sentByUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Email summary for lists
export interface EmailSummary {
  id: string;
  candidateId: string;
  jobId: string;
  direction: EmailDirection;
  type: EmailType;
  status: EmailStatus;
  subject: string;
  snippet: string; // First 100 chars of body
  from: {
    email: string;
    name?: string;
  };
  sentAt?: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  candidateName: string;
  jobTitle: string;
}

// Create email request
export interface CreateEmailRequest {
  candidateId: string;
  jobId: string;
  direction: EmailDirection;
  type: EmailType;
  priority?: EmailPriority;
  subject: string;
  body: string;
  plainTextBody?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: string;
  attachments?: Attachment[];
  templateId?: string;
  parentEmailId?: string; // If this is a reply
  scheduledSendAt?: Date;
  internalNotes?: string;
}

// Send email request (simplified)
export interface SendEmailRequest {
  candidateId: string;
  jobId: string;
  subject: string;
  body: string;
  templateId?: string;
  attachments?: File[];
}

// Reply to email request
export interface ReplyToEmailRequest {
  parentEmailId: string;
  body: string;
  attachments?: File[];
  replyToAll?: boolean;
}

// Forward email request
export interface ForwardEmailRequest {
  originalEmailId: string;
  to: EmailRecipient[];
  body: string;
  attachments?: File[];
}

// Update email request
export interface UpdateEmailRequest {
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  internalNotes?: string;
}

// Email filters
export interface EmailFilters {
  candidateId?: string;
  jobId?: string;
  clientId?: string;
  direction?: EmailDirection[];
  type?: EmailType[];
  status?: EmailStatus[];
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  hasAttachments?: boolean;
  sentAfter?: Date;
  sentBefore?: Date;
  search?: string; // Search in subject and body
  sentBy?: string;
}

// Email sort options
export type EmailSortField = 
  | "sentAt" 
  | "createdAt" 
  | "subject"
  | "status"
  | "priority";

export interface EmailSortOptions {
  field: EmailSortField;
  direction: "asc" | "desc";
}

// Email statistics
export interface EmailStatistics {
  totalSent: number;
  totalReceived: number;
  totalOpened: number;
  totalBounced: number;
  totalFailed: number;
  openRate: number; // Percentage
  responseRate: number; // Percentage
  averageResponseTime?: number; // In hours
}

// Email template variable
export interface EmailTemplateVariable {
  key: string; // e.g., "{{candidate_name}}"
  name: string; // e.g., "Candidate Name"
  description: string;
  isCustom: boolean;
}

// Email template
export interface EmailTemplate extends BaseEntity {
  name: string;
  subject: string;
  body: string;
  type: EmailType;
  category: string;
  variables: EmailTemplateVariable[];
  isActive: boolean;
  usageCount: number;
}

// Bulk email request (for sending to multiple candidates)
export interface BulkEmailRequest {
  candidateIds: string[];
  jobId: string;
  subject: string;
  body: string;
  templateId?: string;
  attachments?: File[];
  scheduledSendAt?: Date;
}
