import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { ClientsState } from "../slices/clientsSlice";

// Base selectors
export const selectClients = (state: RootState) => (state.clients as ClientsState).clients;
export const selectCurrentClient = (state: RootState) => (state.clients as ClientsState).currentClient;
export const selectClientFilters = (state: RootState) => (state.clients as ClientsState).filters;
export const selectClientsLoading = (state: RootState) => (state.clients as ClientsState).isLoading;

// Memoized selectors
export const selectFilteredClients = createSelector(
  [selectClients, selectClientFilters],
  (clients, filters) => {
    return clients.filter((client) => {
      // Search filter
      const matchesSearch = filters.search
        ? client.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
          client.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          client.industry.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      // Status filter
      const matchesStatus =
        filters.status === "all" || !filters.status ? true : client.status === filters.status;

      // Industry filter
      const matchesIndustry =
        filters.industry === "all" || !filters.industry ? true : client.industry === filters.industry;

      return matchesSearch && matchesStatus && matchesIndustry;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.companyName.localeCompare(b.companyName);
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "jobs":
          return b.statistics.totalJobs - a.statistics.totalJobs;
        case "candidates":
          return b.statistics.totalCandidates - a.statistics.totalCandidates;
        default:
          return 0;
      }
    });
  }
);

// Memoized selector factory for finding client by ID
export const selectClientById = (clientId: string) => (state: RootState) => 
  (state.clients as ClientsState).clients.find((c) => c.id === clientId);

export const selectClientStatistics = createSelector([selectClients], (clients) => ({
  total: clients.length,
  active: clients.filter((c) => c.status === "active").length,
  inactive: clients.filter((c) => c.status === "inactive").length,
  pending: clients.filter((c) => c.status === "pending").length,
}));
