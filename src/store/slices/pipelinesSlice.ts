import type { Pipeline } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface PipelinesState {
  pipelines: Pipeline[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PipelinesState = {
  pipelines: [],
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

const pipelinesSlice = createSlice({
  name: "pipelines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelines.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pipelines = action.payload;
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch pipelines";
      });
  },
});

export default pipelinesSlice.reducer;
