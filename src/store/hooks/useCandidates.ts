import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCandidates,
  fetchCandidatesIfNeeded,
  fetchCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  setCurrentCandidate,
  invalidateCandidatesCache,
  updateCandidateStageOptimistic,
} from "../slices/candidatesSlice";
import type { CandidatesState } from "../slices/candidatesSlice";

export const useCandidates = () => {
  const dispatch = useAppDispatch();
  const { candidates, currentCandidate, isLoading, error } = useAppSelector(
    (state) => state.candidates as CandidatesState
  );

  const fetchCandidatesCallback = useCallback(() => dispatch(fetchCandidates()), [dispatch]);
  const fetchCandidatesIfNeededCallback = useCallback(() => dispatch(fetchCandidatesIfNeeded()), [dispatch]);
  const fetchCandidateByIdCallback = useCallback((id: string) => dispatch(fetchCandidateById(id)), [dispatch]);
  const createCandidateCallback = useCallback((data: Parameters<typeof createCandidate>[0]) => 
    dispatch(createCandidate(data)), [dispatch]);
  const updateCandidateCallback = useCallback((id: string, data: Parameters<typeof updateCandidate>[0]["data"]) => 
    dispatch(updateCandidate({ id, data })), [dispatch]);
  const deleteCandidateCallback = useCallback((id: string) => dispatch(deleteCandidate(id)), [dispatch]);
  const setCurrentCandidateCallback = useCallback((candidate: Parameters<typeof setCurrentCandidate>[0]) => 
    dispatch(setCurrentCandidate(candidate)), [dispatch]);
  const invalidateCacheCallback = useCallback(() => dispatch(invalidateCandidatesCache()), [dispatch]);
  const updateCandidateStageOptimisticCallback = useCallback((payload: Parameters<typeof updateCandidateStageOptimistic>[0]) => 
    dispatch(updateCandidateStageOptimistic(payload)), [dispatch]);

  return {
    candidates,
    currentCandidate,
    isLoading,
    error,
    fetchCandidates: fetchCandidatesCallback,
    fetchCandidatesIfNeeded: fetchCandidatesIfNeededCallback, // New: smart fetch with caching
    fetchCandidateById: fetchCandidateByIdCallback,
    createCandidate: createCandidateCallback,
    updateCandidate: updateCandidateCallback,
    deleteCandidate: deleteCandidateCallback,
    setCurrentCandidate: setCurrentCandidateCallback,
    invalidateCache: invalidateCacheCallback, // New: manual cache invalidation
    updateCandidateStageOptimistic: updateCandidateStageOptimisticCallback,
  };
};
