/**
 * Role Guard Component
 * Blocks access to routes/components based on user role
 */

import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoaderFullPage } from "@/components/ui/loader";

type UserRole = "admin" | "recruiter" | "hiring_manager" | "viewer";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  showMessage?: boolean;
}

/**
 * Role Guard
 * Wraps components/routes that require specific roles
 * 
 * @example
 * <RoleGuard allowedRoles={["admin"]}>
 *   <SettingsPage />
 * </RoleGuard>
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard",
  showMessage = true
}: RoleGuardProps) {
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

  // Check if user has one of the allowed roles
  const hasAccess = allowedRoles.includes(user.role as UserRole);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. This feature is only available to: <strong>{allowedRoles.join(", ")}</strong>.
              <br /><br />
              Your current role is: <strong>{user.role}</strong>
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

  // Has required role - render children
  return <>{children}</>;
}
