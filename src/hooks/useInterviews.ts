import { useMemo } from 'react';
import type { Interview } from '@/types';
import {
  useFirestoreCollection,
  useFirestoreDocument,
  where,
  orderBy,
  type UseFirestoreCollectionResult,
  type UseFirestoreDocumentResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Transform Firestore document to Interview type
 * Converts Firestore Timestamps to JavaScript Date objects
 */
function transformInterviewDocument(doc: DocumentData): Interview {
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
    // Backend stores as 'scheduledAt', frontend expects 'interviewDate'
    interviewDate: toDate(doc.scheduledAt || doc.interviewDate),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt),
  } as Interview;
}

/**
 * Hook to subscribe to all interviews with realtime updates
 */
export function useInterviews(options?: {
  enabled?: boolean;
  status?: string;
}): UseFirestoreCollectionResult<Interview> {
  const { enabled = true, status } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints: ReturnType<typeof where | typeof orderBy>[] = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    // Backend stores interviews with 'scheduledAt' field
    constraints.push(orderBy('scheduledAt', 'desc'));

    return constraints;
  }, [status]);

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled ? queryConstraints : undefined,
    enabled,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to a single interview by ID with realtime updates
 */
export function useInterview(
  interviewId: string | undefined,
  options?: { enabled?: boolean }
): UseFirestoreDocumentResult<Interview> {
  const { enabled = true } = options || {};

  const documentPath = interviewId ? `interviews/${interviewId}` : '';

  return useFirestoreDocument<Interview>({
    documentPath,
    enabled: enabled && !!interviewId,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to interviews for a specific candidate
 */
export function useInterviewsByCandidate(
  candidateId: string | undefined,
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<Interview> {
  const { enabled = true } = options || {};

  const queryConstraints = useMemo(
    () => [
      where('candidateId', '==', candidateId || ''),
      orderBy('scheduledAt', 'desc'),
    ],
    [candidateId]
  );

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled && candidateId ? queryConstraints : undefined,
    enabled: enabled && !!candidateId,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to interviews for a specific job
 */
export function useInterviewsByJob(
  jobId: string | undefined,
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<Interview> {
  const { enabled = true } = options || {};

  const queryConstraints = useMemo(
    () => [
      where('jobId', '==', jobId || ''),
      orderBy('scheduledAt', 'desc'),
    ],
    [jobId]
  );

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled && jobId ? queryConstraints : undefined,
    enabled: enabled && !!jobId,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to interviews for a specific candidate and job
 */
export function useInterviewsByCandidateAndJob(
  candidateId: string | undefined,
  jobId: string | undefined,
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<Interview> {
  const { enabled = true } = options || {};

  const queryConstraints = useMemo(
    () => [
      where('candidateId', '==', candidateId || ''),
      where('jobId', '==', jobId || ''),
      orderBy('scheduledAt', 'desc'),
    ],
    [candidateId, jobId]
  );

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled && candidateId && jobId ? queryConstraints : undefined,
    enabled: enabled && !!candidateId && !!jobId,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to interviews by status
 */
export function useInterviewsByStatus(
  status: string | undefined,
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<Interview> {
  const { enabled = true } = options || {};

  const queryConstraints = useMemo(
    () => [
      where('status', '==', status || ''),
      orderBy('scheduledAt', 'desc'),
    ],
    [status]
  );

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled && status ? queryConstraints : undefined,
    enabled: enabled && !!status,
    transform: transformInterviewDocument,
  });
}

/**
 * Hook to subscribe to upcoming interviews (scheduled, not completed/cancelled)
 */
export function useUpcomingInterviews(
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<Interview> {
  const { enabled = true } = options || {};

  const queryConstraints = useMemo(
    () => [
      where('status', '==', 'scheduled'),
      orderBy('scheduledAt', 'asc'),
    ],
    []
  );

  return useFirestoreCollection<Interview>({
    collectionPath: 'interviews',
    queryConstraints: enabled ? queryConstraints : undefined,
    enabled,
    transform: transformInterviewDocument,
  });
}
