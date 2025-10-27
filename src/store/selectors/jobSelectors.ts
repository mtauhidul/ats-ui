import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { JobsState } from "../slices/jobsSlice";

// Base selectors
export const selectJobs = (state: RootState) => (state.jobs as JobsState).jobs;
export const selectCurrentJob = (state: RootState) => (state.jobs as JobsState).currentJob;
export const selectJobsLoading = (state: RootState) => (state.jobs as JobsState).isLoading;

// Memoized selectors
export const selectJobsByStatus = (status: string) =>
  createSelector([selectJobs], (jobs) => jobs.filter((job) => job.status === status));

export const selectJobsByClient = (clientId: string) =>
  createSelector([selectJobs], (jobs) => jobs.filter((job) => job.clientId === clientId));

// Simple selector factory for finding job by ID
export const selectJobById = (jobId: string) => (state: RootState) =>
  (state.jobs as JobsState).jobs.find((j) => j.id === jobId);

export const selectJobStatistics = createSelector([selectJobs], (jobs) => ({
  total: jobs.length,
  open: jobs.filter((j) => j.status === "open").length,
  closed: jobs.filter((j) => j.status === "closed").length,
  draft: jobs.filter((j) => j.status === "draft").length,
  onHold: jobs.filter((j) => j.status === "on_hold").length,
  totalCandidates: jobs.reduce((sum, j) => sum + (j.candidateIds?.length || 0), 0),
  totalOpenings: jobs.reduce((sum, j) => sum + (j.openings || 0), 0),
  filled: jobs.reduce((sum, j) => sum + (j.filledPositions || 0), 0),
}));

export const selectOpenJobs = createSelector([selectJobs], (jobs) =>
  jobs.filter((job) => job.status === "open")
);

// Filtered and sorted jobs selector
export const selectFilteredAndSortedJobs = createSelector(
  [
    selectJobs,
    (_state: RootState, filters: {
      search?: string;
      status?: string;
      type?: string;
      clientId?: string;
      sortBy?: string;
    }) => filters,
  ],
  (jobs, filters) => {
    // Filter
    const filtered = jobs.filter((job) => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || filters.status === "all" || job.status === filters.status;
      const matchesType = !filters.type || filters.type === "all" || job.type === filters.type;
      const matchesClient = !filters.clientId || filters.clientId === "all" || job.clientId === filters.clientId;

      return matchesSearch && matchesStatus && matchesType && matchesClient;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "priority": {
          const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        case "candidates":
          return (b.candidateIds?.length || 0) - (a.candidateIds?.length || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }
);

