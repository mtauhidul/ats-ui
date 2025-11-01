import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchApplications,
  fetchApplicationsIfNeeded,
  fetchApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  setCurrentApplication,
  invalidateApplicationsCache,
} from "../slices/applicationsSlice";
import type { ApplicationsState } from "../slices/applicationsSlice";

export const useApplications = () => {
  const dispatch = useAppDispatch();
  const { applications, currentApplication, isLoading, error } = useAppSelector(
    (state) => state.applications as ApplicationsState
  );

  const fetchApplicationsCallback = useCallback(() => dispatch(fetchApplications()), [dispatch]);
  const fetchApplicationsIfNeededCallback = useCallback(() => dispatch(fetchApplicationsIfNeeded()), [dispatch]);
  const fetchApplicationByIdCallback = useCallback((id: string) => dispatch(fetchApplicationById(id)), [dispatch]);
  const createApplicationCallback = useCallback((data: Parameters<typeof createApplication>[0]) => 
    dispatch(createApplication(data)), [dispatch]);
  const updateApplicationCallback = useCallback((id: string, data: Parameters<typeof updateApplication>[0]["data"]) => 
    dispatch(updateApplication({ id, data })), [dispatch]);
  const deleteApplicationCallback = useCallback((id: string) => dispatch(deleteApplication(id)), [dispatch]);
  const setCurrentApplicationCallback = useCallback((application: Parameters<typeof setCurrentApplication>[0]) => 
    dispatch(setCurrentApplication(application)), [dispatch]);
  const invalidateCacheCallback = useCallback(() => dispatch(invalidateApplicationsCache()), [dispatch]);

  return {
    applications,
    currentApplication,
    isLoading,
    error,
    fetchApplications: fetchApplicationsCallback,
    fetchApplicationsIfNeeded: fetchApplicationsIfNeededCallback, // New: smart fetch with caching
    fetchApplicationById: fetchApplicationByIdCallback,
    createApplication: createApplicationCallback,
    updateApplication: updateApplicationCallback,
    deleteApplication: deleteApplicationCallback,
    setCurrentApplication: setCurrentApplicationCallback,
    invalidateCache: invalidateCacheCallback, // New: manual cache invalidation
  };
};
