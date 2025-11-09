import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  setCurrentCandidate,
  updateCandidateStageOptimistic,
} from "../slices/candidatesSlice";
import type { CandidatesState } from "../slices/candidatesSlice";
import { useCandidates as useFirestoreCandidates } from "@/hooks/firestore";

export const useCandidates = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { data: candidates, loading: isLoading, error: firestoreError } = useFirestoreCandidates();
  
  // Keep currentCandidate from Redux for backward compatibility
  const { currentCandidate } = useAppSelector(
    (state) => state.candidates as CandidatesState
  );

  // Fetch functions are now no-ops since Firestore provides realtime data
  const fetchCandidatesCallback = useCallback(() => Promise.resolve(), []);
  const fetchCandidatesIfNeededCallback = useCallback(() => Promise.resolve(), []);
  const fetchCandidateByIdCallback = useCallback((_id: string) => dispatch(fetchCandidateById(_id)), [dispatch]);
  
  // Write operations still go through Redux/API for validation
  const createCandidateCallback = useCallback((data: Parameters<typeof createCandidate>[0]) => 
    dispatch(createCandidate(data)), [dispatch]);
  const updateCandidateCallback = useCallback((id: string, data: Parameters<typeof updateCandidate>[0]["data"]) => 
    dispatch(updateCandidate({ id, data })), [dispatch]);
  const deleteCandidateCallback = useCallback((id: string) => dispatch(deleteCandidate(id)), [dispatch]);
  const setCurrentCandidateCallback = useCallback((candidate: Parameters<typeof setCurrentCandidate>[0]) => 
    dispatch(setCurrentCandidate(candidate)), [dispatch]);
  
  // Cache invalidation is automatic with Firestore realtime
  const invalidateCacheCallback = useCallback(() => Promise.resolve(), []);
  
  const updateCandidateStageOptimisticCallback = useCallback((payload: Parameters<typeof updateCandidateStageOptimistic>[0]) => 
    dispatch(updateCandidateStageOptimistic(payload)), [dispatch]);

  return {
    candidates, // Now from Firestore with realtime updates!
    currentCandidate,
    isLoading,
    error: firestoreError,
    fetchCandidates: fetchCandidatesCallback,
    fetchCandidatesIfNeeded: fetchCandidatesIfNeededCallback,
    fetchCandidateById: fetchCandidateByIdCallback,
    createCandidate: createCandidateCallback,
    updateCandidate: updateCandidateCallback,
    deleteCandidate: deleteCandidateCallback,
    setCurrentCandidate: setCurrentCandidateCallback,
    invalidateCache: invalidateCacheCallback,
    updateCandidateStageOptimistic: updateCandidateStageOptimisticCallback,
  };
};
