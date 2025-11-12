import type { Application } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { API_BASE_URL } from "@/config/api";

export interface ApplicationsState {
  applications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp when data was last fetched
  cacheValid: boolean; // Whether cache is still valid
}

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  cacheValid: false,
};

// Cache configuration - applications change frequently like candidates
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Helper to check if cache is still valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  "applications/fetchAll",
  async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/applications`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    const result = await response.json();
    return result.data?.applications || result.data || result;
  }
);

// Smart fetch - only fetches if cache is stale
export const fetchApplicationsIfNeeded = createAsyncThunk(
  "applications/fetchIfNeeded",
  async (_, { getState, dispatch }) => {
    const state = getState() as { applications: ApplicationsState };
    const { lastFetched, cacheValid, applications } = state.applications;
    
    // If cache is valid and we have data, skip fetch
    if (cacheValid && isCacheValid(lastFetched) && applications.length > 0) {
      return null;
    }
    
    // Cache is stale or invalid, fetch fresh data
    return dispatch(fetchApplications()).then((result) => result.payload);
  }
);

export const fetchApplicationById = createAsyncThunk(
  "applications/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) throw new Error("Failed to fetch application");
    const result = await response.json();
    return result.data || result;
  }
);

export const createApplication = createAsyncThunk(
  "applications/create",
  async (applicationData: Partial<Application>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      body: JSON.stringify(applicationData),
    });
    if (!response.ok) throw new Error("Failed to create application");
    const result = await response.json();
    toast.success("Application submitted successfully");
    return result.data || result;
  }
);

export const updateApplication = createAsyncThunk(
  "applications/update",
  async ({ id, data }: { id: string; data: Partial<Application> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update application");
    const result = await response.json();
    toast.success("Application updated successfully");
    return result.data || result;
  }
);

export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/applications/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete application");
    await response.json();
    toast.success("Application deleted successfully");
    return id;
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setCurrentApplication: (
      state,
      action: PayloadAction<Application | null>
    ) => {
      state.currentApplication = action.payload;
    },
    // Invalidate cache - force refetch on next access
    invalidateApplicationsCache: (state) => {
      state.cacheValid = false;
      state.lastFetched = null;
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
        state.lastFetched = Date.now(); // Update cache timestamp
        state.cacheValid = true; // Mark cache as valid
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch applications";
        state.cacheValid = false; // Invalidate on error
      })
      .addCase(fetchApplicationsIfNeeded.pending, (state) => {
        // Only show loading if we're actually fetching (not using cache)
        if (!state.cacheValid || !isCacheValid(state.lastFetched)) {
          state.isLoading = true;
        }
      })
      .addCase(fetchApplicationsIfNeeded.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only update if we got fresh data (not null from cache)
        if (action.payload && Array.isArray(action.payload)) {
          state.applications = action.payload;
          state.lastFetched = Date.now();
          state.cacheValid = true;
        }
      })
      .addCase(fetchApplicationsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch applications";
        state.cacheValid = false;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.currentApplication = action.payload;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        const index = state.applications.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.applications[index] = action.payload;
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter(
          (a) => a.id !== action.payload
        );
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      });
  },
});

export const { setCurrentApplication, invalidateApplicationsCache } = applicationsSlice.actions;
export default applicationsSlice.reducer;
