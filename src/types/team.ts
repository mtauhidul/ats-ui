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
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  isActive: boolean;
  avatar?: string;
  department?: string;
  position?: string;
  startDate?: Date;
  permissions: TeamPermissions;
}

// Team permissions
export interface TeamPermissions {
  canCreateJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canViewAllJobs: boolean;
  canManageCandidates: boolean;
  canScheduleInterviews: boolean;
  canViewReports: boolean;
  canManageTeam: boolean;
  canManageClients: boolean;
}

// Hiring team - Dynamic teams for specific hiring processes
export interface HiringTeam extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  members: HiringTeamMember[];
  jobIds: string[]; // Jobs this team is responsible for
  clientIds?: string[]; // Clients this team handles
}

// Hiring team member with specific role in the team
export interface HiringTeamMember {
  userId: string;
  role: TeamRole;
  isLead?: boolean;
  joinedAt: Date;
}

// Full team member info (for display)
export interface TeamMemberInfo extends TeamMember {
  fullName: string;
  hiringTeams: {
    teamId: string;
    teamName: string;
    role: TeamRole;
    isLead: boolean;
  }[];
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
  isActive?: boolean;
  avatar?: string;
  department?: string;
  position?: string;
  permissions?: TeamPermissions;
}

// Create hiring team request
export interface CreateHiringTeamRequest {
  name: string;
  description?: string;
  members: {
    userId: string;
    role: TeamRole;
    isLead?: boolean;
  }[];
}

// Update hiring team request
export interface UpdateHiringTeamRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  members?: {
    userId: string;
    role: TeamRole;
    isLead?: boolean;
  }[];
}

// Team filters
export interface TeamMemberFilters {
  search?: string;
  role?: TeamRole[];
  isActive?: boolean;
  department?: string;
  hiringTeamId?: string;
}

export interface HiringTeamFilters {
  search?: string;
  isActive?: boolean;
  memberId?: string;
  clientId?: string;
}

export type TeamMemberSortField = "firstName" | "lastName" | "email" | "role" | "startDate" | "createdAt";
export type HiringTeamSortField = "name" | "createdAt" | "updatedAt";