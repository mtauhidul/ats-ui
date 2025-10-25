import type { BaseEntity } from "./common";

// Team member roles
export const TeamRole = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  HIRING_MANAGER: "hiring_manager",
  INTERVIEWER: "interviewer",
  COORDINATOR: "coordinator",
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

// Team member interface
export interface TeamMember extends BaseEntity {
  userId?: string; // Reference to User collection (optional for now)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  status: "active" | "inactive"; // Using status instead of isActive for UI compatibility
  avatar?: string;
  department?: string;
  title?: string; // Job title/position
  startDate?: Date;
  permissions: TeamPermissions;
  statistics?: {
    activeJobs: number;
    placedCandidates: number;
    pendingReviews: number;
    emailsSent: number;
  };
  lastLoginAt?: string;
}

// Team permissions - aligned with actual implementation
export interface TeamPermissions {
  canManageClients: boolean;
  canManageJobs: boolean;
  canReviewApplications: boolean;
  canManageCandidates: boolean;
  canSendEmails: boolean;
  canManageTeam: boolean;
  canAccessAnalytics: boolean;
}

// Full team member info (for display)
export interface TeamMemberInfo extends TeamMember {
  fullName: string;
  assignedJobs: number;
  activeCandidates: number;
}

// Create team member request
export interface CreateTeamMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  department?: string;
  position?: string;
  startDate?: Date;
  permissions: TeamPermissions;
}

// Update team member request
export interface UpdateTeamMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: TeamRole;
  status?: "active" | "inactive";
  avatar?: string;
  department?: string;
  title?: string;
  permissions?: TeamPermissions;
}

// Team filters
export interface TeamMemberFilters {
  search?: string;
  role?: TeamRole[];
  status?: "active" | "inactive";
  department?: string;
}

export type TeamMemberSortField = "firstName" | "lastName" | "email" | "role" | "startDate" | "createdAt";