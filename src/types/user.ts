import type { BaseEntity } from "./common";
import type { TeamRole } from "./team";

// User status
export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending", // Email verification pending
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// User preferences
export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

// Main User interface
export interface User extends BaseEntity {
  // Basic information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  
  // Authentication
  passwordHash?: string; // Should only exist on backend, never sent to frontend
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Role and status
  role: TeamRole;
  status: UserStatus;
  
  // Organization
  department?: string;
  position?: string;
  startDate?: Date;
  
  // Activity tracking
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  loginCount: number;
  
  // Preferences
  preferences?: UserPreferences;
  
  // Metadata
  invitedBy?: string; // User ID who invited this user
  invitedAt?: Date;
}

// User without sensitive information (for frontend)
export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: TeamRole;
  status: UserStatus;
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User profile (for current logged-in user)
export interface UserProfile extends UserPublic {
  emailVerified: boolean;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

// Create user request (for registration/invitation)
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  department?: string;
  position?: string;
  startDate?: Date;
  sendInvitationEmail?: boolean;
}

// Update user request
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: TeamRole;
  status?: UserStatus;
  department?: string;
  position?: string;
  preferences?: Partial<UserPreferences>;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Reset password request
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Login response
export interface LoginResponse {
  user: UserProfile;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// User filters
export interface UserFilters {
  search?: string;
  role?: TeamRole[];
  status?: UserStatus[];
  department?: string;
  emailVerified?: boolean;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export type UserSortField = 
  | "firstName" 
  | "lastName" 
  | "email" 
  | "role" 
  | "status"
  | "department"
  | "createdAt" 
  | "lastLoginAt";

// User statistics
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  byRole: Record<TeamRole, number>;
  recentLogins: number; // Last 7 days
  newThisMonth: number;
}
