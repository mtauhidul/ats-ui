import { useUser } from "@clerk/clerk-react";

/**
 * User Roles in the ATS System
 */
export type UserRole = "admin" | "recruiter" | "hiring_manager" | "viewer";

/**
 * Permission types for granular access control
 */
export type Permission =
  // Client Permissions
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  // Job Permissions
  | "jobs.view"
  | "jobs.create"
  | "jobs.edit"
  | "jobs.delete"
  | "jobs.publish"
  // Candidate Permissions
  | "candidates.view"
  | "candidates.create"
  | "candidates.edit"
  | "candidates.delete"
  | "candidates.import"
  | "candidates.export"
  // Application Permissions
  | "applications.view"
  | "applications.review"
  | "applications.approve"
  | "applications.reject"
  // Interview Permissions
  | "interviews.view"
  | "interviews.schedule"
  | "interviews.edit"
  | "interviews.cancel"
  // Team Permissions
  | "team.view"
  | "team.invite"
  | "team.edit"
  | "team.remove"
  // Settings Permissions
  | "settings.view"
  | "settings.edit"
  // Analytics Permissions
  | "analytics.view"
  | "analytics.export";

/**
 * Role-based permission matrix
 * Defines what each role can do in the system
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    "clients.view",
    "clients.create",
    "clients.edit",
    "clients.delete",
    "jobs.view",
    "jobs.create",
    "jobs.edit",
    "jobs.delete",
    "jobs.publish",
    "candidates.view",
    "candidates.create",
    "candidates.edit",
    "candidates.delete",
    "candidates.import",
    "candidates.export",
    "applications.view",
    "applications.review",
    "applications.approve",
    "applications.reject",
    "interviews.view",
    "interviews.schedule",
    "interviews.edit",
    "interviews.cancel",
    "team.view",
    "team.invite",
    "team.edit",
    "team.remove",
    "settings.view",
    "settings.edit",
    "analytics.view",
    "analytics.export",
  ],
  recruiter: [
    // Can manage clients, jobs, and candidates
    "clients.view",
    "clients.create",
    "clients.edit",
    "jobs.view",
    "jobs.create",
    "jobs.edit",
    "jobs.publish",
    "candidates.view",
    "candidates.create",
    "candidates.edit",
    "candidates.import",
    "candidates.export",
    "applications.view",
    "applications.review",
    "applications.approve",
    "applications.reject",
    "interviews.view",
    "interviews.schedule",
    "interviews.edit",
    "team.view",
    "settings.view",
    "analytics.view",
  ],
  hiring_manager: [
    // Can view and review candidates/applications
    "clients.view",
    "jobs.view",
    "candidates.view",
    "candidates.export",
    "applications.view",
    "applications.review",
    "applications.approve",
    "applications.reject",
    "interviews.view",
    "interviews.schedule",
    "team.view",
    "analytics.view",
  ],
  viewer: [
    // Read-only access
    "clients.view",
    "jobs.view",
    "candidates.view",
    "applications.view",
    "interviews.view",
    "team.view",
    "analytics.view",
  ],
};

/**
 * Hook to get the current user's role from Clerk metadata
 */
export function useUserRole(): UserRole {
  const { user } = useUser();
  
  // Get role from Clerk's public metadata
  // Default to 'viewer' if no role is set
  const role = user?.publicMetadata?.role as UserRole;
  
  return role || "viewer";
}

/**
 * Hook to get the current user's permissions
 */
export function useUserPermissions(): Permission[] {
  const role = useUserRole();
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(permission: Permission): boolean {
  const permissions = useUserPermissions();
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function useHasAnyPermission(requiredPermissions: Permission[]): boolean {
  const permissions = useUserPermissions();
  return requiredPermissions.some((p) => permissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function useHasAllPermissions(requiredPermissions: Permission[]): boolean {
  const permissions = useUserPermissions();
  return requiredPermissions.every((p) => permissions.includes(p));
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role: UserRole): boolean {
  const userRole = useUserRole();
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const userRole = useUserRole();
  return roles.includes(userRole);
}

/**
 * Utility function to check permission without hook (for non-component use)
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get user display information
 */
export function useUserInfo() {
  const { user } = useUser();
  const role = useUserRole();
  
  return {
    id: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
    role,
    isAdmin: role === "admin",
    isRecruiter: role === "recruiter",
    isHiringManager: role === "hiring_manager",
    isViewer: role === "viewer",
  };
}

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  viewer: "Viewer",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access with ability to manage users and settings",
  recruiter: "Can manage clients, jobs, candidates, and applications",
  hiring_manager: "Can review candidates and approve applications",
  viewer: "Read-only access to view data across the system",
};
