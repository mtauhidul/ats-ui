/**
 * Firestore realtime hook for Pipelines collection
 * Subscribes to /pipelines collection for realtime updates
 */
import { useFirestoreCollection } from './useFirestore';
import type { Pipeline } from '@/types/pipeline';

interface UsePipelinesFirestoreOptions {
  enabled?: boolean;
  jobId?: string; // Filter pipelines by jobId
}

export function usePipelinesFirestore(options: UsePipelinesFirestoreOptions = {}) {
  const { enabled = true, jobId } = options;

  const { data, loading, error } = useFirestoreCollection<Pipeline>({
    collectionPath: 'pipelines',
    enabled,
  });

  // Filter by jobId on client side if needed
  const filteredData = jobId 
    ? data.filter(p => p.jobId === jobId)
    : data;

  return {
    pipelines: filteredData,
    pipelinesCount: filteredData.length,
    loading,
    error,
    enabled,
  };
}

/**
 * Hook to get a specific pipeline by jobId
 * Since each job should have one pipeline, this returns the first match
 */
export function usePipelineByJobId(jobId: string | undefined) {
  const { pipelines, loading, error } = usePipelinesFirestore({
    enabled: !!jobId,
    jobId,
  });

  return {
    pipeline: pipelines[0] || null,
    loading,
    error,
  };
}

/**
 * Hook to get a specific pipeline by pipeline ID
 */
export function usePipelineById(pipelineId: string | undefined) {
  const { data, loading, error } = useFirestoreCollection<Pipeline>({
    collectionPath: 'pipelines',
    enabled: !!pipelineId,
  });

  // Filter by ID on client side
  const pipeline = data.find(p => p.id === pipelineId) || null;

  return {
    pipeline,
    loading,
    error,
  };
}
