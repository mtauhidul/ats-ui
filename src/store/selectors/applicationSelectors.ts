import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { ApplicationsState } from "../slices/applicationsSlice";

// Base selectors
export const selectApplications = (state: RootState) => (state.applications as ApplicationsState).applications;
export const selectCurrentApplication = (state: RootState) => (state.applications as ApplicationsState).currentApplication;
export const selectApplicationsLoading = (state: RootState) => (state.applications as ApplicationsState).isLoading;

// Memoized selectors
export const selectApplicationsByStatus = (status: string) =>
  createSelector([selectApplications], (applications) =>
    applications.filter((app) => app.status === status)
  );

export const selectApplicationsByJob = (jobId: string) =>
  createSelector([selectApplications], (applications) =>
    applications.filter((app) => app.targetJobId === jobId || app.assignedJobId === jobId)
  );

export const selectApplicationById = (applicationId: string) =>
  createSelector([selectApplications], (applications) =>
    applications.find((a) => a.id === applicationId)
  );

export const selectApplicationStatistics = createSelector([selectApplications], (applications) => ({
  total: applications.length,
  pending: applications.filter((a) => a.status === "pending").length,
  reviewing: applications.filter((a) => a.status === "reviewing").length,
  shortlisted: applications.filter((a) => a.status === "shortlisted").length,
  approved: applications.filter((a) => a.status === "approved").length,
  rejected: applications.filter((a) => a.status === "rejected").length,
  withdrawn: applications.filter((a) => a.status === "withdrawn").length,
}));

export const selectPendingApplications = createSelector([selectApplications], (applications) =>
  applications.filter((app) => app.status === "pending")
);
