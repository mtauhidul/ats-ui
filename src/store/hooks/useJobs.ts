import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { 
  fetchJobs, 
  fetchJobsIfNeeded,
  fetchJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  setCurrentJob,
  invalidateJobsCache
} from "../slices/jobsSlice";
import type { JobsState } from "../slices/jobsSlice";

export const useJobs = () => {
  const dispatch = useAppDispatch();
  const { jobs, currentJob, isLoading, error } = useAppSelector(
    (state) => state.jobs as JobsState
  );

  const fetchJobsCallback = useCallback(() => dispatch(fetchJobs()), [dispatch]);
  const fetchJobsIfNeededCallback = useCallback(() => dispatch(fetchJobsIfNeeded()), [dispatch]);
  const fetchJobByIdCallback = useCallback((id: string) => dispatch(fetchJobById(id)), [dispatch]);
  const createJobCallback = useCallback((data: Parameters<typeof createJob>[0]) => 
    dispatch(createJob(data)), [dispatch]);
  const updateJobCallback = useCallback((id: string, data: Parameters<typeof updateJob>[0]["data"]) => 
    dispatch(updateJob({ id, data })), [dispatch]);
  const deleteJobCallback = useCallback((id: string) => dispatch(deleteJob(id)), [dispatch]);
  const setCurrentJobCallback = useCallback((job: Parameters<typeof setCurrentJob>[0]) => 
    dispatch(setCurrentJob(job)), [dispatch]);
  const invalidateCacheCallback = useCallback(() => dispatch(invalidateJobsCache()), [dispatch]);

  return {
    jobs,
    currentJob,
    isLoading,
    error,
    fetchJobs: fetchJobsCallback,
    fetchJobsIfNeeded: fetchJobsIfNeededCallback, // New: smart fetch with caching
    fetchJobById: fetchJobByIdCallback,
    createJob: createJobCallback,
    updateJob: updateJobCallback,
    deleteJob: deleteJobCallback,
    setCurrentJob: setCurrentJobCallback,
    invalidateCache: invalidateCacheCallback, // New: manual cache invalidation
  };
};
