import type { Application } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface ApplicationsState {
  applications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  "applications/fetchAll",
  async () => {
    const response = await fetch(`${API_BASE_URL}/applications`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
  }
);

export const fetchApplicationById = createAsyncThunk(
  "applications/fetchById",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`);
    if (!response.ok) throw new Error("Failed to fetch application");
    return response.json();
  }
);

export const createApplication = createAsyncThunk(
  "applications/create",
  async (applicationData: Partial<Application>) => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applicationData),
    });
    if (!response.ok) throw new Error("Failed to create application");
    const data = await response.json();
    toast.success("Application submitted successfully");
    return data;
  }
);

export const updateApplication = createAsyncThunk(
  "applications/update",
  async ({ id, data }: { id: string; data: Partial<Application> }) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update application");
    const result = await response.json();
    toast.success("Application updated successfully");
    return result;
  }
);

export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete application");
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
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch applications";
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.currentApplication = action.payload;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
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
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter(
          (a) => a.id !== action.payload
        );
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null;
        }
      });
  },
});

export const { setCurrentApplication } = applicationsSlice.actions;
export default applicationsSlice.reducer;
