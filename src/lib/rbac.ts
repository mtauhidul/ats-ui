// Role-Based Access Control utilities

interface UserPermissions {
  canManageClients: boolean;
  canManageJobs: boolean;
  canReviewApplications: boolean;
  canManageCandidates: boolean;
  canSendEmails: boolean;
  canManageTeam: boolean;
  canAccessAnalytics: boolean;
}

interface User {
  id: string;
  role: string;
  permissions: UserPermissions;
}

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: keyof UserPermissions): boolean => {
  if (!user) return false;
  return user.permissions[permission] === true;
};

/**
 * Check if user has admin role
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "admin";
};

/**
 * Check if user has any of the specified roles
 */
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Check if user can access a specific feature
 */
export const canAccessFeature = (user: User | null, feature: string): boolean => {
  if (!user) return false;
  
  switch (feature) {
    case "clients":
      return hasPermission(user, "canManageClients");
    case "jobs":
      return hasPermission(user, "canManageJobs");
    case "applications":
      return hasPermission(user, "canReviewApplications");
    case "candidates":
      return hasPermission(user, "canManageCandidates");
    case "team":
      return hasPermission(user, "canManageTeam");
    case "analytics":
      return hasPermission(user, "canAccessAnalytics");
    case "messages":
      return hasPermission(user, "canSendEmails"); // Messages require email permission
    default:
      return false;
  }
};

/**
 * Get restricted message for a feature
 */
export const getRestrictedMessage = (feature: string): string => {
  return `You don't have permission to access ${feature}. Please contact your administrator.`;
};

/**
 * Role-based default permissions
 */
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    canManageClients: true,
    canManageJobs: true,
    canReviewApplications: true,
    canManageCandidates: true,
    canSendEmails: true,
    canManageTeam: true,
    canAccessAnalytics: true,
  },
  recruiter: {
    canManageClients: true,
    canManageJobs: true,
    canReviewApplications: true,
    canManageCandidates: true,
    canSendEmails: true,
    canManageTeam: false,
    canAccessAnalytics: true,
  },
  hiring_manager: {
    canManageClients: false,
    canManageJobs: true,
    canReviewApplications: true,
    canManageCandidates: true,
    canSendEmails: true,
    canManageTeam: false,
    canAccessAnalytics: true,
  },
  interviewer: {
    canManageClients: false,
    canManageJobs: false,
    canReviewApplications: true,
    canManageCandidates: false,
    canSendEmails: true,
    canManageTeam: false,
    canAccessAnalytics: false,
  },
  coordinator: {
    canManageClients: false,
    canManageJobs: false,
    canReviewApplications: false,
    canManageCandidates: false,
    canSendEmails: true,
    canManageTeam: false,
    canAccessAnalytics: true,
  },
};

/**
 * Get user display name with role badge
 */
export const getUserDisplayInfo = (user: User | null) => {
  if (!user) return { name: "Guest", roleBadge: "guest" };
  
  return {
    name: user.id,
    roleBadge: user.role,
  };
};
