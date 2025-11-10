import { useMemo } from 'react';
import type { Application } from '@/types';
import {
  useFirestoreCollection,
  where,
  type UseFirestoreCollectionResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Transform Firestore document to Application type
 * Converts Firestore Timestamps to JavaScript Date objects
 */
function transformApplicationDocument(doc: DocumentData): Application {
  // Helper to convert Firestore Timestamp to Date
  const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
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
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return undefined;
  };

  return {
    ...doc,
    id: doc.id,
    // Ensure required fields
    status: doc.status || 'pending',
    // Convert date fields from Firestore Timestamps
    submittedAt: toDate(doc.submittedAt),
    appliedAt: toDate(doc.appliedAt),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
    reviewedAt: toDate(doc.reviewedAt),
    approvedAt: toDate(doc.approvedAt),
    rejectedAt: toDate(doc.rejectedAt),
    availableStartDate: toDate(doc.availableStartDate),
    lastUpdated: toDate(doc.lastUpdated),
    // Ensure arrays
    documents: Array.isArray(doc.documents) ? doc.documents : [],
  } as unknown as Application;
}

/**
 * Hook to subscribe to all applications with realtime updates
 */
export function useApplications(options?: {
  enabled?: boolean;
  status?: string;
  jobId?: string;
  candidateId?: string;
}): UseFirestoreCollectionResult<Application> {
  const { enabled = true, status, jobId, candidateId } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (jobId) {
      constraints.push(where('jobId', '==', jobId));
    }

    if (candidateId) {
      constraints.push(where('candidateId', '==', candidateId));
    }

    // Note: orderBy removed to avoid Firestore index requirement
    // Applications will be sorted client-side if needed

    return constraints;
  }, [status, jobId, candidateId]);

  const result = useFirestoreCollection<Application>({
    collectionPath: 'applications', // Root level collection
    queryConstraints,
    enabled,
    transform: transformApplicationDocument,
  });

  // Debug logging for first application
  if (result.data.length > 0) {
    const firstApp = result.data[0];
    console.log('🔥 useApplications - First application dates:', {
      id: firstApp.id,
      submittedAt: firstApp.submittedAt,
      createdAt: firstApp.createdAt,
      submittedAtType: typeof firstApp.submittedAt,
      createdAtType: typeof firstApp.createdAt,
    });
  }

  return result;
}

/**
 * Hook to subscribe to a single application with realtime updates
 */
export function useApplication(applicationId: string | null | undefined): {
  application: Application | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!applicationId;

  const { data: applications, loading, error } = useApplications({ enabled });

  const application = useMemo(() => {
    if (!applicationId || !applications.length) return null;
    return applications.find(a => a.id === applicationId) || null;
  }, [applicationId, applications]);

  return {
    application,
    loading,
    error: error as Error | null,
    exists: !!application,
  };
}

/**
 * Hook to get applications by job with realtime updates
 */
export function useApplicationsByJob(jobId: string | null, enabled = true): UseFirestoreCollectionResult<Application> {
  const shouldEnable = enabled && !!jobId;
  return useApplications({ enabled: shouldEnable, jobId: jobId || undefined });
}

/**
 * Hook to get applications by status with realtime updates
 */
export function useApplicationsByStatus(status: string, enabled = true): UseFirestoreCollectionResult<Application> {
  return useApplications({ enabled, status });
}

/**
 * Hook to get applications by candidate with realtime updates
 */
export function useApplicationsByCandidate(candidateId: string | null, enabled = true): UseFirestoreCollectionResult<Application> {
  const shouldEnable = enabled && !!candidateId;
  return useApplications({ enabled: shouldEnable, candidateId: candidateId || undefined });
}
