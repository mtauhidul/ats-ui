import React from "react";
import { useHasRole, useHasAnyRole, useHasPermission, useHasAnyPermission, useHasAllPermissions, type UserRole, type Permission } from "@/lib/auth";

/**
 * RequireRole Component
 * Conditionally renders children based on user role(s)
 * 
 * @example
 * <RequireRole role="admin">
 *   <Button>Delete Client</Button>
 * </RequireRole>
 * 
 * <RequireRole roles={["admin", "recruiter"]}>
 *   <CreateJobButton />
 * </RequireRole>
 */
interface RequireRoleProps {
  role?: UserRole;
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ role, roles, children, fallback = null }: RequireRoleProps) {
  const hasRole = useHasRole(role!);
  const hasAnyRole = useHasAnyRole(roles || []);
  
  const hasAccess = role ? hasRole : hasAnyRole;
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * RequirePermission Component
 * Conditionally renders children based on user permission(s)
 * 
 * @example
 * <RequirePermission permission="clients.delete">
 *   <DeleteButton />
 * </RequirePermission>
 * 
 * <RequirePermission permissions={["jobs.create", "jobs.edit"]} requireAll={true}>
 *   <JobForm />
 * </RequirePermission>
 */
interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const hasSinglePermission = useHasPermission(permission!);
  const hasAnyPermission = useHasAnyPermission(permissions || []);
  const hasAllPermissions = useHasAllPermissions(permissions || []);
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions : hasAnyPermission;
  }
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * ShowForRole Component (Alias for RequireRole)
 * More semantic naming for showing/hiding UI elements
 */
export const ShowForRole = RequireRole;

/**
 * ShowForPermission Component (Alias for RequirePermission)
 * More semantic naming for showing/hiding UI elements
 */
export const ShowForPermission = RequirePermission;

/**
 * HideForRole Component
 * Hides children for specified role(s)
 * 
 * @example
 * <HideForRole role="viewer">
 *   <EditButton />
 * </HideForRole>
 */
interface HideForRoleProps {
  role?: UserRole;
  roles?: UserRole[];
  children: React.ReactNode;
}

export function HideForRole({ role, roles, children }: HideForRoleProps) {
  const hasRole = useHasRole(role!);
  const hasAnyRole = useHasAnyRole(roles || []);
  
  const shouldHide = role ? hasRole : hasAnyRole;
  
  if (shouldHide) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * HideForPermission Component
 * Hides children for users with specified permission(s)
 */
interface HideForPermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  children: React.ReactNode;
}

export function HideForPermission({ permission, permissions, children }: HideForPermissionProps) {
  const hasSinglePermission = useHasPermission(permission!);
  const hasAnyPermission = useHasAnyPermission(permissions || []);
  
  const shouldHide = permission ? hasSinglePermission : hasAnyPermission;
  
  if (shouldHide) {
    return null;
  }
  
  return <>{children}</>;
}
