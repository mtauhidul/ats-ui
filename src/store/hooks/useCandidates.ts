import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCandidates,
  fetchCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  setCurrentCandidate,
} from "../slices/candidatesSlice";
import type { CandidatesState } from "../slices/candidatesSlice";

export const useCandidates = () => {
  const dispatch = useAppDispatch();
  const { candidates, currentCandidate, isLoading, error } = useAppSelector(
    (state) => state.candidates as CandidatesState
  );

  const fetchCandidatesCallback = useCallback(() => dispatch(fetchCandidates()), [dispatch]);
  const fetchCandidateByIdCallback = useCallback((id: string) => dispatch(fetchCandidateById(id)), [dispatch]);
  const createCandidateCallback = useCallback((data: Parameters<typeof createCandidate>[0]) => 
    dispatch(createCandidate(data)), [dispatch]);
  const updateCandidateCallback = useCallback((id: string, data: Parameters<typeof updateCandidate>[0]["data"]) => 
    dispatch(updateCandidate({ id, data })), [dispatch]);
  const deleteCandidateCallback = useCallback((id: string) => dispatch(deleteCandidate(id)), [dispatch]);
  const setCurrentCandidateCallback = useCallback((candidate: Parameters<typeof setCurrentCandidate>[0]) => 
    dispatch(setCurrentCandidate(candidate)), [dispatch]);

  return {
    candidates,
    currentCandidate,
    isLoading,
    error,
    fetchCandidates: fetchCandidatesCallback,
    fetchCandidateById: fetchCandidateByIdCallback,
    createCandidate: createCandidateCallback,
    updateCandidate: updateCandidateCallback,
    deleteCandidate: deleteCandidateCallback,
    setCurrentCandidate: setCurrentCandidateCallback,
  };
};
