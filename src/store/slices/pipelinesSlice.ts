import type { Pipeline, PipelineStage } from "@/types";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface PipelinesState {
  pipelines: Pipeline[];
  currentPipeline: Pipeline | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PipelinesState = {
  pipelines: [],
  currentPipeline: null,
  isLoading: false,
  error: null,
};

export const fetchPipelines = createAsyncThunk(
  "pipelines/fetchAll",
  async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/pipelines`);
    if (!response.ok) throw new Error("Failed to fetch pipelines");
    const result = await response.json();
    return result.data?.pipelines || result.data || result;
  }
);

export const fetchPipelineById = createAsyncThunk(
  "pipelines/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/pipelines/${id}`);
    if (!response.ok) throw new Error("Failed to fetch pipeline");
    const result = await response.json();
    return result.data || result;
  }
);

export const createPipeline = createAsyncThunk(
  "pipelines/create",
  async (data: {
    name: string;
    description?: string;
    type?: 'candidate' | 'interview' | 'custom';
    stages: Omit<PipelineStage, 'id'>[];
  }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/pipelines`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create pipeline:", response.status, errorText);
      throw new Error(`Failed to create pipeline: ${response.status}`);
    }
    const result = await response.json();
    const pipeline = result.data || result;
    toast.success("Pipeline created successfully");
    return pipeline;
  }
);

export const updatePipeline = createAsyncThunk(
  "pipelines/update",
  async ({ id, data }: { 
    id: string; 
    data: {
      name?: string;
      description?: string;
      stages?: Omit<PipelineStage, 'id'>[];
      isActive?: boolean;
    }
  }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/pipelines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update pipeline");
    const result = await response.json();
    const pipeline = result.data || result;
    toast.success("Pipeline updated successfully");
    return pipeline;
  }
);

export const deletePipeline = createAsyncThunk(
  "pipelines/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/pipelines/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete pipeline");
    toast.success("Pipeline deleted successfully");
    return id;
  }
);

const pipelinesSlice = createSlice({
  name: "pipelines",
  initialState,
  reducers: {
    setCurrentPipeline: (state, action: PayloadAction<Pipeline | null>) => {
      state.currentPipeline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines = action.payload;
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch pipelines";
      })
      .addCase(fetchPipelineById.fulfilled, (state, action) => {
        state.currentPipeline = action.payload;
        // Also add or update in pipelines array
        const index = state.pipelines.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pipelines[index] = action.payload;
        } else {
          state.pipelines.push(action.payload);
        }
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.pipelines.unshift(action.payload);
        state.currentPipeline = action.payload;
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        const index = state.pipelines.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pipelines[index] = action.payload;
        }
        if (state.currentPipeline?.id === action.payload.id) {
          state.currentPipeline = action.payload;
        }
      })
      .addCase(deletePipeline.fulfilled, (state, action) => {
        state.pipelines = state.pipelines.filter((p) => p.id !== action.payload);
        if (state.currentPipeline?.id === action.payload) {
          state.currentPipeline = null;
        }
      });
  },
});

export const { setCurrentPipeline } = pipelinesSlice.actions;
export default pipelinesSlice.reducer;
