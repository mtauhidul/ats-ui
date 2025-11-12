import type { Job, CreateJobRequest } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

// Helper function to normalize job data from backend
const normalizeJob = (job: Job | Record<string, unknown>): Job => {
  const jobAny = job as Record<string, unknown>;
  
  // Keep clientId as-is (could be string or populated object)
  // The job selection modal expects populated objects with {id, _id, companyName}
  const clientId = jobAny.clientId;
  
  // If pipelineId is populated (object), extract the ID
  const pipelineIdValue = jobAny.pipelineId;
  let pipelineId: string | undefined;
  
  if (pipelineIdValue) {
    if (typeof pipelineIdValue === 'object' && pipelineIdValue !== null) {
      // Backend might return populated pipeline
      const pipelineObj = pipelineIdValue as Record<string, unknown>;
      pipelineId = (pipelineObj.id || pipelineObj._id) as string;
    } else {
      // Already a string ID
      pipelineId = pipelineIdValue as string;
    }
  }
  
  // Transform backend data structure to frontend format
  // Backend: requirements: string[], skills: string[], location: string, locationType
  // Frontend: requirements: object, location: Address, workMode
  
  // Parse location string to Address object
  let locationObj: { city?: string; country?: string } | undefined;
  if (typeof jobAny.location === 'string') {
    const parts = jobAny.location.split(',').map((p: string) => p.trim());
    locationObj = {
      city: parts[0] || "",
      country: parts[1] || "",
    };
  } else if (jobAny.location && typeof jobAny.location === 'object') {
    locationObj = jobAny.location as { city?: string; country?: string };
  }
  
  // Transform requirements and skills
  const backendRequirements = Array.isArray(jobAny.requirements) ? jobAny.requirements as string[] : [];
  const backendSkills = Array.isArray(jobAny.skills) ? jobAny.skills as string[] : [];
  
  // Try to find experience requirement (first item or one containing "year"/"experience")
  const experienceReq = backendRequirements.find(req => 
    req.toLowerCase().includes('year') || 
    req.toLowerCase().includes('experience') ||
    /\d+/.test(req)
  ) || backendRequirements[0] || "";
  
  const requirementsObj = {
    experience: experienceReq,
    skills: {
      required: backendSkills,
      preferred: [],
    },
  };
  
  return {
    ...job,
    clientId: clientId,
    pipelineId: pipelineId,
    id: (jobAny._id || jobAny.id) as string,
    location: locationObj,
    workMode: (jobAny.locationType as 'remote' | 'onsite' | 'hybrid') || 'hybrid',
    requirements: requirementsObj,
    // Map backend field names to frontend expectations
    type: jobAny.jobType || jobAny.type,
  } as Job;
};

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp when data was last fetched
  cacheValid: boolean; // Whether cache is still valid
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  cacheValid: false,
};

// Cache configuration - jobs change less frequently than candidates
const CACHE_DURATION = 60 * 1000; // 60 seconds (1 minute)

// Helper to check if cache is still valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
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

// Smart fetch - only fetches if cache is stale
export const fetchJobsIfNeeded = createAsyncThunk(
  "jobs/fetchIfNeeded",
  async (_, { getState, dispatch }) => {
    const state = getState() as { jobs: JobsState };
    const { lastFetched, cacheValid, jobs } = state.jobs;
    
    // If cache is valid and we have data, skip fetch
    if (cacheValid && isCacheValid(lastFetched) && jobs.length > 0) {
      return null;
    }
    
    // Cache is stale or invalid, fetch fresh data
    return dispatch(fetchJobs()).then((result) => result.payload);
  }
);

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
  async (jobData: CreateJobRequest | Record<string, unknown>) => {
    const toastId = toast.loading("Creating job...");
    
    try {
      // The add-job-modal already transforms the data to backend format
      // So we can pass it through directly, just ensure field mappings
      const dataAny = jobData as Record<string, unknown>;
      const backendData: Record<string, unknown> = {
        ...dataAny,
        // Ensure these field mappings are correct
        jobType: dataAny.type || dataAny.jobType,
        locationType: dataAny.locationType || dataAny.workMode,
        // Remove frontend-only fields if any
        type: undefined,
        workMode: undefined,
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        body: JSON.stringify(backendData),
      });
      if (!response.ok) {
        await response.text(); // Consume the response body
        toast.error("Failed to create job", { id: toastId });
        throw new Error(`Failed to create job: ${response.status}`);
      }
      const result = await response.json();
      const job = result.data || result;
      toast.success("Job created successfully", { id: toastId });
      return normalizeJob(job);
    } catch (error) {
      toast.error("Failed to create job", { id: toastId });
      throw error;
    }
  }
);

export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, data }: { id: string; data: Partial<Job> }) => {
    // Transform frontend data structure to match backend expectations (same as createJob)
    const backendData: Record<string, unknown> = {};
    
    // Only include fields that are being updated
    if (data.title !== undefined) backendData.title = data.title;
    if (data.clientId !== undefined) backendData.clientId = data.clientId;
    if (data.pipelineId !== undefined) backendData.pipelineId = data.pipelineId;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.responsibilities !== undefined) backendData.responsibilities = data.responsibilities;
    if (data.salaryRange !== undefined) backendData.salaryRange = data.salaryRange;
    if (data.openings !== undefined) backendData.openings = data.openings;
    if (data.applicationDeadline !== undefined) backendData.applicationDeadline = data.applicationDeadline;
    if (data.startDate !== undefined) backendData.startDate = data.startDate;
    if (data.priority !== undefined) backendData.priority = data.priority;
    if (data.status !== undefined) backendData.status = data.status;
    if (data.categoryIds !== undefined) backendData.categoryIds = data.categoryIds;
    if (data.tagIds !== undefined) backendData.tagIds = data.tagIds;
    if (data.recruiterIds !== undefined) backendData.recruiterIds = data.recruiterIds;
    if (data.hiringManagerIds?.[0]) backendData.hiringManagerId = data.hiringManagerIds[0];
    
    // Transform location object to string
    if (data.location !== undefined) {
      backendData.location = typeof data.location === 'string'
        ? data.location
        : `${data.location.city || ''}${data.location.city && data.location.country ? ', ' : ''}${data.location.country || ''}`.trim() || (data.workMode === 'remote' ? 'Remote' : 'To Be Determined');
    }
    
    // Transform workMode to locationType
    if (data.workMode !== undefined) {
      backendData.locationType = data.workMode;
    }
    
    // Transform type to jobType
    if (data.type !== undefined) {
      backendData.jobType = data.type;
    }
    
    // Transform experienceLevel
    if (data.experienceLevel !== undefined) {
      backendData.experienceLevel = data.experienceLevel;
    }
    
    // Transform requirements object to requirements array (experience goes to requirements[0])
    if (data.requirements !== undefined && typeof data.requirements === 'object') {
      const req = data.requirements as { experience?: string; skills?: { required?: string[]; preferred?: string[] } };
      if (req.experience) {
        backendData.requirements = [req.experience];
      }
      // Transform skills object to skills array
      if (req.skills) {
        backendData.skills = [
          ...(req.skills.required || []),
          ...(req.skills.preferred || []),
        ];
      }
    }
    
    // Transform benefits
    if (data.benefits !== undefined) {
      backendData.benefits = Object.entries(data.benefits)
        .filter(([, value]) => value === true || (typeof value === 'string' && value))
        .map(([key]) => key);
    }

    const toastId = toast.loading("Updating job...");
    
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(backendData),
      });
      if (!response.ok) {
        toast.error("Failed to update job", { id: toastId });
        throw new Error("Failed to update job");
      }
      const result = await response.json();
      const job = result.data || result;
      toast.success("Job updated successfully", { id: toastId });
      return normalizeJob(job);
    } catch (error) {
      toast.error("Failed to update job", { id: toastId });
      throw error;
    }
  }
);

export const deleteJob = createAsyncThunk("jobs/delete", async (id: string) => {
  const toastId = toast.loading("Deleting job...");
  
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Failed to delete job", { id: toastId });
      throw new Error("Failed to delete job");
    }
    toast.success("Job deleted successfully", { id: toastId });
    return id;
  } catch (error) {
    toast.error("Failed to delete job", { id: toastId });
    throw error;
  }
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    // Invalidate cache - force refetch on next access
    invalidateJobsCache: (state) => {
      state.cacheValid = false;
      state.lastFetched = null;
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
        // Ensure payload is an array
        const jobs = Array.isArray(action.payload)
          ? action.payload
          : action.payload && typeof action.payload === 'object'
          ? Object.values(action.payload)
          : [];
        state.jobs = jobs as Job[];
        state.lastFetched = Date.now(); // Update cache timestamp
        state.cacheValid = true; // Mark cache as valid
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
        state.cacheValid = false; // Invalidate on error
      })
      .addCase(fetchJobsIfNeeded.pending, (state) => {
        // Only show loading if we're actually fetching (not using cache)
        if (!state.cacheValid || !isCacheValid(state.lastFetched)) {
          state.isLoading = true;
        }
      })
      .addCase(fetchJobsIfNeeded.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only update if we got fresh data (not null from cache)
        if (action.payload && Array.isArray(action.payload)) {
          state.jobs = action.payload;
          state.lastFetched = Date.now();
          state.cacheValid = true;
        }
      })
      .addCase(fetchJobsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch jobs";
        state.cacheValid = false;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload;
        // Also add or update the job in the jobs array
        const index = state.jobs.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        } else {
          state.jobs.push(action.payload);
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex((j) => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      });
  },
});

export const { setCurrentJob, invalidateJobsCache } = jobsSlice.actions;
export default jobsSlice.reducer;
