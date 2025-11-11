import { useMemo } from 'react';
import {
  useFirestoreCollection,
  where,
  orderBy,
  limit,
  type UseFirestoreCollectionResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

export interface Activity {
  id: string;
  userId: string;
  action: string; // e.g., 'reviewed_candidate', 'sent_email', 'updated_job', 'login'
  resourceType?: string; // e.g., 'candidate', 'job', 'client', 'application'
  resourceId?: string;
  resourceName?: string; // For display: candidate name, job title, etc.
  metadata?: Record<string, unknown>; // Additional context
  createdAt: Date;
}

/**
 * Transform Firestore document to Activity type
 * Converts Firestore Timestamps to JavaScript Date objects
 */
function transformActivityDocument(doc: DocumentData): Activity {
  // Helper to convert Firestore Timestamp to Date
  const toDate = (value: unknown): Date => {
    if (!value) return new Date();
    // Firestore Timestamp has toDate() method
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
      return ((value as { toDate: () => Date }).toDate());
    }
    // Already a Date
    if (value instanceof Date) {
      return value;
    }
    // Try to parse as date
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  return {
    id: doc.id,
    userId: doc.userId || '',
    action: doc.action || '',
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    resourceName: doc.resourceName,
    metadata: doc.metadata,
    createdAt: toDate(doc.createdAt),
  };
}

/**
 * Hook to subscribe to activities for a specific user with realtime updates
 */
export function useActivitiesByUser(
  userId: string | null | undefined,
  options?: {
    enabled?: boolean;
    limitCount?: number;
  }
): UseFirestoreCollectionResult<Activity> {
  const { enabled = true, limitCount = 50 } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    // Order by createdAt descending (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Limit results
    constraints.push(limit(limitCount));

    return constraints;
  }, [userId, limitCount]);

  return useFirestoreCollection<Activity>({
    collectionPath: 'activityLogs', // Root level collection
    queryConstraints,
    enabled: enabled && !!userId,
    transform: transformActivityDocument,
  });
}

/**
 * Hook to subscribe to all activities with realtime updates
 */
export function useActivities(options?: {
  enabled?: boolean;
  limitCount?: number;
}): UseFirestoreCollectionResult<Activity> {
  const { enabled = true, limitCount = 100 } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    // Order by createdAt descending (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Limit results
    constraints.push(limit(limitCount));

    return constraints;
  }, [limitCount]);

  return useFirestoreCollection<Activity>({
    collectionPath: 'activityLogs', // Root level collection
    queryConstraints,
    enabled,
    transform: transformActivityDocument,
  });
}

/**
 * Hook to subscribe to activities by action with realtime updates
 */
export function useActivitiesByAction(
  action: string,
  options?: {
    enabled?: boolean;
    limitCount?: number;
  }
): UseFirestoreCollectionResult<Activity> {
  const { enabled = true, limitCount = 50 } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    constraints.push(where('action', '==', action));

    // Order by createdAt descending (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Limit results
    constraints.push(limit(limitCount));

    return constraints;
  }, [action, limitCount]);

  return useFirestoreCollection<Activity>({
    collectionPath: 'activityLogs', // Root level collection
    queryConstraints,
    enabled,
    transform: transformActivityDocument,
  });
}

/**
 * Hook to subscribe to activities by resource with realtime updates
 */
export function useActivitiesByResource(
  resourceType: string,
  resourceId: string,
  options?: {
    enabled?: boolean;
    limitCount?: number;
  }
): UseFirestoreCollectionResult<Activity> {
  const { enabled = true, limitCount = 50 } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    constraints.push(where('resourceType', '==', resourceType));
    constraints.push(where('resourceId', '==', resourceId));

    // Order by createdAt descending (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Limit results
    constraints.push(limit(limitCount));

    return constraints;
  }, [resourceType, resourceId, limitCount]);

  return useFirestoreCollection<Activity>({
    collectionPath: 'activityLogs', // Root level collection
    queryConstraints,
    enabled,
    transform: transformActivityDocument,
  });
}
