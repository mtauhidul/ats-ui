/**
 * Permission Guard Component
 * Blocks access to routes/components based on user permissions
 */

import { useAuth } from "@/hooks/useAuth";
import { hasPermission, isAdmin } from "@/lib/rbac";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoaderFullPage } from "@/components/ui/loader";

type Permission = 
  | "canManageClients"
  | "canManageJobs"
  | "canReviewApplications"
  | "canManageCandidates"
  | "canSendEmails"
  | "canManageTeam"
  | "canAccessAnalytics";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallbackPath?: string;
  showMessage?: boolean;
}

/**
 * Permission Guard
 * Wraps components/routes that require specific permissions
 * 
 * @example
 * <PermissionGuard permission="canManageClients">
 *   <ClientsPage />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  children, 
  permission, 
  fallbackPath = "/dashboard",
  showMessage = true
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Still loading
  if (isLoading) {
    return <LoaderFullPage text="Loading..." />;
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin bypass - admins have access to everything
  if (isAdmin(user)) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(user, permission);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. This feature requires the <strong>{permission}</strong> permission.
              <br /><br />
              Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    // Silent redirect
    return <Navigate to={fallbackPath} replace />;
  }

  // Has permission - render children
  return <>{children}</>;
}
