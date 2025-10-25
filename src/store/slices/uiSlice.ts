import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  // Modal states
  modals: {
    addClient: boolean;
    addJob: boolean;
    addCandidate: boolean;
    addApplication: boolean;
    addTeamMember: boolean;
    addCategory: boolean;
    addTag: boolean;
    addInterview: boolean;
    editClient: boolean;
    editJob: boolean;
    editCandidate: boolean;
    viewCandidate: boolean;
    sendEmail: boolean;
  };

  // Loading states
  isLoading: {
    global: boolean;
    clients: boolean;
    jobs: boolean;
    candidates: boolean;
    applications: boolean;
    emails: boolean;
  };

  // Filter states
  filters: {
    clients: Record<string, unknown>;
    jobs: Record<string, unknown>;
    candidates: Record<string, unknown>;
    applications: Record<string, unknown>;
  };

  // Pagination
  pagination: {
    clients: { page: number; limit: number };
    jobs: { page: number; limit: number };
    candidates: { page: number; limit: number };
    applications: { page: number; limit: number };
  };

  // Selected items
  selectedItems: {
    clientId: string | null;
    jobId: string | null;
    candidateId: string | null;
    applicationId: string | null;
  };

  // Sidebar
  sidebarCollapsed: boolean;
}

const initialState: UIState = {
  modals: {
    addClient: false,
    addJob: false,
    addCandidate: false,
    addApplication: false,
    addTeamMember: false,
    addCategory: false,
    addTag: false,
    addInterview: false,
    editClient: false,
    editJob: false,
    editCandidate: false,
    viewCandidate: false,
    sendEmail: false,
  },
  isLoading: {
    global: false,
    clients: false,
    jobs: false,
    candidates: false,
    applications: false,
    emails: false,
  },
  filters: {
    clients: {},
    jobs: {},
    candidates: {},
    applications: {},
  },
  pagination: {
    clients: { page: 1, limit: 20 },
    jobs: { page: 1, limit: 20 },
    candidates: { page: 1, limit: 20 },
    applications: { page: 1, limit: 20 },
  },
  selectedItems: {
    clientId: null,
    jobId: null,
    candidateId: null,
    applicationId: null,
  },
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },

    // Loading actions
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof UIState["isLoading"]; value: boolean }>
    ) => {
      state.isLoading[action.payload.key] = action.payload.value;
    },

    // Filter actions
    setFilter: (
      state,
      action: PayloadAction<{
        entity: keyof UIState["filters"];
        filters: Record<string, unknown>;
      }>
    ) => {
      state.filters[action.payload.entity] = action.payload.filters;
    },
    clearFilter: (state, action: PayloadAction<keyof UIState["filters"]>) => {
      state.filters[action.payload] = {};
    },

    // Pagination actions
    setPagination: (
      state,
      action: PayloadAction<{
        entity: keyof UIState["pagination"];
        page?: number;
        limit?: number;
      }>
    ) => {
      if (action.payload.page !== undefined) {
        state.pagination[action.payload.entity].page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.pagination[action.payload.entity].limit = action.payload.limit;
      }
    },

    // Selected items actions
    setSelectedItem: (
      state,
      action: PayloadAction<{
        key: keyof UIState["selectedItems"];
        value: string | null;
      }>
    ) => {
      state.selectedItems[action.payload.key] = action.payload.value;
    },
    clearSelectedItems: (state) => {
      state.selectedItems = {
        clientId: null,
        jobId: null,
        candidateId: null,
        applicationId: null,
      };
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setFilter,
  clearFilter,
  setPagination,
  setSelectedItem,
  clearSelectedItems,
  toggleSidebar,
  setSidebarCollapsed,
} = uiSlice.actions;

export default uiSlice.reducer;
