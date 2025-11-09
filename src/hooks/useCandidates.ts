import { useMemo } from 'react';
import type { Candidate } from '@/types';
import {
  useFirestoreCollection,
  getCompanyCollectionPath,
  where,
  orderBy,
  type UseFirestoreCollectionResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Transform Firestore document to Candidate type
 */
function transformCandidateDocument(doc: DocumentData): Candidate {
  return {
    ...doc,
    id: doc.id,
    // Ensure arrays
    jobIds: Array.isArray(doc.jobIds) ? doc.jobIds : [],
    applicationIds: Array.isArray(doc.applicationIds) ? doc.applicationIds : [],
    jobApplications: Array.isArray(doc.jobApplications) ? doc.jobApplications : [],
    skills: Array.isArray(doc.skills) ? doc.skills : [],
    experience: Array.isArray(doc.experience) ? doc.experience : [],
    education: Array.isArray(doc.education) ? doc.education : [],
  } as unknown as Candidate;
}

/**
 * Hook to subscribe to all candidates with realtime updates
 */
export function useCandidates(options?: {
  enabled?: boolean;
  status?: string;
  jobId?: string;
}): UseFirestoreCollectionResult<Candidate> {
  const { enabled = true, status, jobId } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (jobId) {
      constraints.push(where('jobIds', 'array-contains', jobId));
    }

    // Default ordering
    constraints.push(orderBy('createdAt', 'desc'));

    return constraints;
  }, [status, jobId]);

  return useFirestoreCollection<Candidate>({
    collectionPath: getCompanyCollectionPath('candidates'),
    queryConstraints,
    enabled,
    transform: transformCandidateDocument,
  });
}

/**
 * Hook to subscribe to a single candidate with realtime updates
 */
export function useCandidate(candidateId: string | null | undefined): {
  candidate: Candidate | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!candidateId;

  const { data: candidates, loading, error } = useCandidates({ enabled });

  const candidate = useMemo(() => {
    if (!candidateId || !candidates.length) return null;
    return candidates.find(c => c.id === candidateId) || null;
  }, [candidateId, candidates]);

  return {
    candidate,
    loading,
    error: error as Error | null,
    exists: !!candidate,
  };
}

/**
 * Hook to get candidates by job with realtime updates
 */
export function useCandidatesByJob(jobId: string | null, enabled = true): UseFirestoreCollectionResult<Candidate> {
  const shouldEnable = enabled && !!jobId;
  return useCandidates({ enabled: shouldEnable, jobId: jobId || undefined });
}

/**
 * Hook to get candidates by status with realtime updates
 */
export function useCandidatesByStatus(status: string, enabled = true): UseFirestoreCollectionResult<Candidate> {
  return useCandidates({ enabled, status });
}
