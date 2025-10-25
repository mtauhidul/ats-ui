import type { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { toast } from "sonner";

/**
 * Toast middleware to show user feedback on all CRUD operations
 * Automatically shows success/error toasts for API calls
 */
export const toastMiddleware: Middleware = () => (next) => (action) => {
  // Check if action is rejected (error)
  if (isRejectedWithValue(action)) {
    const error = action.payload as { data?: { message?: string }; error?: string };
    const errorMessage = error?.data?.message || error?.error || "An error occurred";
    
    toast.error(errorMessage, {
      description: "Please try again or contact support if the issue persists.",
    });
  }

  // Check for successful CRUD operations
  if (typeof action === 'object' && action !== null && 'type' in action && 
      typeof action.type === 'string' && action.type.endsWith("/fulfilled")) {
    // Extract operation type from action type
    const actionParts = action.type.split("/");
    const operation = actionParts[actionParts.length - 2];
    const entity = actionParts[0];

    // Map operation names to user-friendly messages
    const operationMessages: Record<string, string> = {
      create: "created",
      add: "added",
      update: "updated",
      edit: "updated",
      delete: "deleted",
      remove: "removed",
      fetch: "", // Don't show toast for fetch operations
      get: "", // Don't show toast for get operations
      load: "", // Don't show toast for load operations
    };

    const operationType = Object.keys(operationMessages).find((key) =>
      operation?.toLowerCase().includes(key)
    );

    if (operationType && operationMessages[operationType]) {
      const message = operationMessages[operationType];
      const entityName = entity.replace(/([A-Z])/g, " $1").trim();
      
      toast.success(`${entityName} ${message} successfully`, {
        description: `Your changes have been saved.`,
      });
    }
  }

  return next(action);
};
