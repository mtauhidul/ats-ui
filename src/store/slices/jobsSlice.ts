import type { Job } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchJobs = createAsyncThunk("jobs/fetchAll", async () => {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
});

export const fetchJobById = createAsyncThunk(
  "jobs/fetchById",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error("Failed to fetch job");
    return response.json();
  }
);

export const createJob = createAsyncThunk(
  "jobs/create",
  async (jobData: Partial<Job>) => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error("Failed to create job");
    const data = await response.json();
    toast.success("Job created successfully");
    return data;
  }
);

export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, data }: { id: string; data: Partial<Job> }) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update job");
    const result = await response.json();
    toast.success("Job updated successfully");
    return result;
  }
);

export const deleteJob = createAsyncThunk("jobs/delete", async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete job");
  toast.success("Job deleted successfully");
  return id;
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
      });
  },
});

export const { setCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
