import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { CandidatesState } from "../slices/candidatesSlice";

// Base selectors
export const selectCandidates = (state: RootState) => (state.candidates as CandidatesState).candidates;
export const selectCurrentCandidate = (state: RootState) => (state.candidates as CandidatesState).currentCandidate;
export const selectCandidatesLoading = (state: RootState) => (state.candidates as CandidatesState).isLoading;

// Memoized selectors
export const selectCandidatesByJob = (jobId: string) =>
  createSelector([selectCandidates], (candidates) =>
    candidates.filter((candidate) => candidate.jobIds.includes(jobId))
  );

export const selectCandidateById = (candidateId: string) =>
  createSelector([selectCandidates], (candidates) =>
    candidates.find((c) => c.id === candidateId)
  );

export const selectCandidateStatistics = createSelector([selectCandidates], (candidates) => ({
  total: candidates.length,
  active: candidates.filter((c) => c.isActive).length,
  inactive: candidates.filter((c) => !c.isActive).length,
}));

export const selectActiveCandidates = createSelector([selectCandidates], (candidates) =>
  candidates.filter((candidate) => candidate.isActive)
);
