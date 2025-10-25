import type { BaseEntity } from "./common";

// Interview type
export const InterviewType = {
  PHONE: "phone",
  VIDEO: "video",
  IN_PERSON: "in_person",
  TECHNICAL: "technical",
  FINAL: "final",
} as const;

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

// Interview status
export const InterviewStatus = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

// Interview outcome
export const InterviewOutcome = {
  PENDING: "pending",
  PASSED: "passed",
  FAILED: "failed",
} as const;

export type InterviewOutcome = (typeof InterviewOutcome)[keyof typeof InterviewOutcome];

// Interview interface
export interface Interview extends BaseEntity {
  candidateId: string;
  candidateName: string;
  clientId: string;
  clientName: string;
  jobId: string;
  jobTitle: string;
  interviewDate: Date;
  interviewType: InterviewType;
  interviewerName?: string;
  interviewerEmail?: string;
  meetingLink?: string; // For video/phone interviews (Zoom, Google Meet, etc.)
  location?: string; // For in-person interviews (address or room number)
  timeZone?: string; // Important for scheduling across time zones
  status: InterviewStatus;
  outcome?: InterviewOutcome;
  rating?: number; // 1-5
  feedback?: string;
  notes?: string;
  duration?: number; // in minutes
}

// Create interview request
export interface CreateInterviewRequest {
  candidateId: string;
  clientId: string;
  jobId: string;
  interviewDate: Date;
  interviewType: InterviewType;
  interviewerName?: string;
  interviewerEmail?: string;
  meetingLink?: string;
  location?: string;
  timeZone?: string;
  notes?: string;
  duration?: number;
}

// Update interview request
export interface UpdateInterviewRequest {
  interviewDate?: Date;
  interviewType?: InterviewType;
  interviewerName?: string;
  interviewerEmail?: string;
  meetingLink?: string;
  location?: string;
  timeZone?: string;
  status?: InterviewStatus;
  outcome?: InterviewOutcome;
  rating?: number;
  feedback?: string;
  notes?: string;
  duration?: number;
}

// Interview filters
export interface InterviewFilters {
  candidateId?: string;
  clientId?: string;
  jobId?: string;
  interviewType?: InterviewType[];
  status?: InterviewStatus[];
  outcome?: InterviewOutcome[];
  dateFrom?: Date;
  dateTo?: Date;
}

export type InterviewSortField = "interviewDate" | "candidateName" | "clientName" | "status" | "rating";
