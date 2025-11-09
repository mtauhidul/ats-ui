import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  setCurrentApplication,
} from "../slices/applicationsSlice";
import type { ApplicationsState } from "../slices/applicationsSlice";
import { useApplications as useFirestoreApplications } from "@/hooks/firestore";

export const useApplications = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { data: applications, loading: isLoading, error: firestoreError } = useFirestoreApplications();
  
  // Keep currentApplication from Redux for backward compatibility
  const { currentApplication } = useAppSelector(
    (state) => state.applications as ApplicationsState
  );

  // Fetch functions are now no-ops since Firestore provides realtime data
  const fetchApplicationsCallback = useCallback(() => Promise.resolve(), []);
  const fetchApplicationsIfNeededCallback = useCallback(() => Promise.resolve(), []);
  const fetchApplicationByIdCallback = useCallback((_id: string) => dispatch(fetchApplicationById(_id)), [dispatch]);
  
  // Write operations still go through Redux/API for validation
  const createApplicationCallback = useCallback((data: Parameters<typeof createApplication>[0]) => 
    dispatch(createApplication(data)), [dispatch]);
  const updateApplicationCallback = useCallback((id: string, data: Parameters<typeof updateApplication>[0]["data"]) => 
    dispatch(updateApplication({ id, data })), [dispatch]);
  const deleteApplicationCallback = useCallback((id: string) => dispatch(deleteApplication(id)), [dispatch]);
  const setCurrentApplicationCallback = useCallback((application: Parameters<typeof setCurrentApplication>[0]) => 
    dispatch(setCurrentApplication(application)), [dispatch]);
  
  // Cache invalidation is automatic with Firestore realtime
  const invalidateCacheCallback = useCallback(() => Promise.resolve(), []);

  return {
    applications, // Now from Firestore with realtime updates!
    currentApplication,
    isLoading,
    error: firestoreError,
    fetchApplications: fetchApplicationsCallback,
    fetchApplicationsIfNeeded: fetchApplicationsIfNeededCallback,
    fetchApplicationById: fetchApplicationByIdCallback,
    createApplication: createApplicationCallback,
    updateApplication: updateApplicationCallback,
    deleteApplication: deleteApplicationCallback,
    setCurrentApplication: setCurrentApplicationCallback,
    invalidateCache: invalidateCacheCallback,
  };
};
