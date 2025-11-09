import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { 
  createJob, 
  updateJob, 
  deleteJob, 
  setCurrentJob,
} from "../slices/jobsSlice";
import type { JobsState } from "../slices/jobsSlice";
// 🔥 REALTIME: Import Firestore hook
import { useJobs as useFirestoreJobs } from "@/hooks/firestore";

export const useJobs = () => {
  const dispatch = useAppDispatch();
  
  // 🔥 REALTIME: Get jobs from Firestore instead of Redux
  const { data: jobs, loading: isLoading, error: firestoreError } = useFirestoreJobs();
  
  // Keep currentJob in Redux for backward compatibility
  const { currentJob } = useAppSelector(
    (state) => state.jobs as JobsState
  );

  // Convert Firestore error to string for backward compatibility
  const error = firestoreError?.message || null;

  // Write operations still go through Redux/API
  const createJobCallback = useCallback((data: Parameters<typeof createJob>[0]) => 
    dispatch(createJob(data)), [dispatch]);
  const updateJobCallback = useCallback((id: string, data: Parameters<typeof updateJob>[0]["data"]) => 
    dispatch(updateJob({ id, data })), [dispatch]);
  const deleteJobCallback = useCallback((id: string) => dispatch(deleteJob(id)), [dispatch]);
  const setCurrentJobCallback = useCallback((job: Parameters<typeof setCurrentJob>[0]) => 
    dispatch(setCurrentJob(job)), [dispatch]);

  // No-op functions for backward compatibility (data comes from Firestore now)
  const fetchJobsCallback = useCallback(() => Promise.resolve(), []);
  const fetchJobsIfNeededCallback = useCallback(() => Promise.resolve(), []);
  const fetchJobByIdCallback = useCallback(() => Promise.resolve(), []);
  const invalidateCacheCallback = useCallback(() => {}, []);

  return {
    jobs,
    currentJob,
    isLoading,
    error,
    fetchJobs: fetchJobsCallback, // No-op: Firestore provides realtime data
    fetchJobsIfNeeded: fetchJobsIfNeededCallback, // No-op: Firestore provides realtime data
    fetchJobById: fetchJobByIdCallback, // No-op: Firestore provides realtime data
    createJob: createJobCallback,
    updateJob: updateJobCallback,
    deleteJob: deleteJobCallback,
    setCurrentJob: setCurrentJobCallback,
    invalidateCache: invalidateCacheCallback, // No-op: Firestore always fresh
  };
};
