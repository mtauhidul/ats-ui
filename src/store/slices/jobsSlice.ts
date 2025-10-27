import type { Job, CreateJobRequest } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to normalize job data from backend
const normalizeJob = (job: Job | Record<string, unknown>): Job => {
  const jobAny = job as Record<string, unknown>;
  
  // If clientId is populated (object), extract the ID
  const clientIdValue = jobAny.clientId;
  let clientId: string;
  
  if (typeof clientIdValue === 'object' && clientIdValue !== null) {
    // Backend might return populated client as {id: "...", companyName: "...", logo: "..."}
    // or {_id: "...", companyName: "...", logo: "..."}
    const clientObj = clientIdValue as Record<string, unknown>;
    clientId = (clientObj.id || clientObj._id) as string;
  } else {
    // Already a string ID
    clientId = clientIdValue as string;
  }
  
  console.log("Normalizing job:", {
    originalClientId: jobAny.clientId,
    extractedClientId: clientId,
    jobTitle: jobAny.title
  });
  
  return {
    ...job,
    clientId: clientId,
    id: (jobAny._id || jobAny.id) as string,
  } as Job;
};

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
  const response = await authenticatedFetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  const result = await response.json();
  const jobs = result.data?.jobs || result.data || result;
  // Normalize jobs to ensure clientId is always a string
  return Array.isArray(jobs) ? jobs.map(normalizeJob) : [];
});

export const fetchJobById = createAsyncThunk(
  "jobs/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error("Failed to fetch job");
    const result = await response.json();
    const job = result.data || result;
    return normalizeJob(job);
  }
);

export const createJob = createAsyncThunk(
  "jobs/create",
  async (jobData: CreateJobRequest) => {
    // Transform frontend data structure to match backend expectations
    const backendData = {
      title: jobData.title,
      clientId: jobData.clientId,
      description: jobData.description,
      requirements: jobData.requirements?.skills?.required || [],
      responsibilities: jobData.responsibilities,
      location: jobData.location
        ? typeof jobData.location === 'string'
          ? jobData.location
          : `${jobData.location.city || ''}${jobData.location.city && jobData.location.country ? ', ' : ''}${jobData.location.country || ''}`.trim() || (jobData.workMode === 'remote' ? 'Remote' : 'To Be Determined')
        : jobData.workMode === 'remote' ? 'Remote' : 'To Be Determined',
      locationType: jobData.workMode,
      jobType: jobData.type,
      experienceLevel: jobData.experienceLevel,
      salaryRange: jobData.salaryRange,
      skills: [
        ...(jobData.requirements?.skills?.required || []),
        ...(jobData.requirements?.skills?.preferred || []),
      ],
      benefits: jobData.benefits ? Object.entries(jobData.benefits)
        .filter(([_, value]) => value === true || (typeof value === 'string' && value))
        .map(([key]) => key) : undefined,
      pipelineId: undefined,
      categoryIds: jobData.categoryIds,
      tagIds: jobData.tagIds,
      status: 'draft' as const,
      openings: jobData.openings,
      applicationDeadline: jobData.applicationDeadline,
      startDate: jobData.startDate,
      priority: jobData.priority,
      hiringManagerId: jobData.hiringManagerIds?.[0],
      recruiterIds: jobData.recruiterIds,
    };

    console.log("Redux: Sending to API with clientId:", backendData.clientId);
    console.log("Redux: Full payload:", JSON.stringify(backendData, null, 2));

    const response = await authenticatedFetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      body: JSON.stringify(backendData),
    });
    if (!response.ok) throw new Error("Failed to create job");
    const result = await response.json();
    const job = result.data || result;
    toast.success("Job created successfully");
    return normalizeJob(job);
  }
);

export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, data }: { id: string; data: Partial<Job> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update job");
    const result = await response.json();
    const job = result.data || result;
    toast.success("Job updated successfully");
    return normalizeJob(job);
  }
);

export const deleteJob = createAsyncThunk("jobs/delete", async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${id}`, {
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
