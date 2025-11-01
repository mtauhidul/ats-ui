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

export const usePipelines = () => {
  const dispatch = useAppDispatch();
  const { pipelines, currentPipeline, isLoading, error } = useAppSelector(
    (state) => state.pipelines as PipelinesState
  );

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
    }) => dispatch(createPipeline(data)), 
    [dispatch]
  );
  
  const updatePipelineCallback = useCallback(
    (id: string, data: {
      name?: string;
      description?: string;
      stages?: Omit<PipelineStage, 'id'>[];
      isActive?: boolean;
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
    pipelines,
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
