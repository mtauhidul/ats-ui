import { useMemo } from 'react';
import type { Application } from '@/types';
import {
  useFirestoreCollection,
  getCompanyCollectionPath,
  where,
  orderBy,
  type UseFirestoreCollectionResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Transform Firestore document to Application type
 */
function transformApplicationDocument(doc: DocumentData): Application {
  return {
    ...doc,
    id: doc.id,
    // Ensure required fields
    status: doc.status || 'pending',
    appliedAt: doc.appliedAt || doc.createdAt,
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

    // Default ordering
    constraints.push(orderBy('createdAt', 'desc'));

    return constraints;
  }, [status, jobId, candidateId]);

  return useFirestoreCollection<Application>({
    collectionPath: getCompanyCollectionPath('applications'),
    queryConstraints,
    enabled,
    transform: transformApplicationDocument,
  });
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
