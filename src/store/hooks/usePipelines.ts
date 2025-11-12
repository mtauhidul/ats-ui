import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { 
  fetchPipelines,
  fetchPipelinesIfNeeded, 
  fetchPipelineById, 
  createPipeline, 
  updatePipeline, 
  deletePipeline,
  setCurrentPipeline,
  invalidatePipelinesCache
} from "../slices/pipelinesSlice";
import type { PipelinesState } from "../slices/pipelinesSlice";
import type { Pipeline, PipelineStage } from "@/types";
import { usePipelinesFirestore } from "@/hooks/usePipelinesFirestore";

export const usePipelines = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { 
    pipelines: firestorePipelines, 
    loading: firestoreLoading 
  } = usePipelinesFirestore({ enabled: true });

  // Get current pipeline from Redux state (for UI management)
  const { currentPipeline, isLoading: reduxLoading, error } = useAppSelector(
    (state) => state.pipelines as PipelinesState
  );

  // Use Firestore data as the source of truth, fallback to Redux for backward compatibility
  const pipelines = firestorePipelines.length > 0 ? firestorePipelines : [];
  const isLoading = firestoreLoading || reduxLoading;

  const fetchPipelinesCallback = useCallback(() => dispatch(fetchPipelines()), [dispatch]);
  const fetchPipelinesIfNeededCallback = useCallback(() => dispatch(fetchPipelinesIfNeeded()), [dispatch]);
  
  const fetchPipelineByIdCallback = useCallback(
    (id: string) => dispatch(fetchPipelineById(id)), 
    [dispatch]
  );
  
  const createPipelineCallback = useCallback(
    (data: {
      name: string;
      description?: string;
      type?: 'candidate' | 'interview' | 'custom';
      stages: Omit<PipelineStage, 'id'>[];
      jobId?: string; // Add jobId to link pipeline to job
    }) => dispatch(createPipeline(data)), 
    [dispatch]
  );
  
  const updatePipelineCallback = useCallback(
    (id: string, data: {
      name?: string;
      description?: string;
      stages?: Omit<PipelineStage, 'id'>[];
      isActive?: boolean;
      jobId?: string; // Allow updating jobId
    }) => dispatch(updatePipeline({ id, data })), 
    [dispatch]
  );
  
  const deletePipelineCallback = useCallback(
    (id: string) => dispatch(deletePipeline(id)), 
    [dispatch]
  );
  
  const setCurrentPipelineCallback = useCallback(
    (pipeline: Pipeline | null) => dispatch(setCurrentPipeline(pipeline)), 
    [dispatch]
  );
  
  const invalidateCacheCallback = useCallback(() => dispatch(invalidatePipelinesCache()), [dispatch]);

  return {
    pipelines, // Return Firestore data
    currentPipeline,
    isLoading,
    error,
    fetchPipelines: fetchPipelinesCallback,
    fetchPipelinesIfNeeded: fetchPipelinesIfNeededCallback,
    fetchPipelineById: fetchPipelineByIdCallback,
    createPipeline: createPipelineCallback,
    updatePipeline: updatePipelineCallback,
    deletePipeline: deletePipelineCallback,
    setCurrentPipeline: setCurrentPipelineCallback,
    invalidateCache: invalidateCacheCallback,
  };
};
