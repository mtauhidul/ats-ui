import type { Pipeline } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
    const response = await fetch(`${API_BASE_URL}/pipelines`);
    if (!response.ok) throw new Error("Failed to fetch pipelines");
    return response.json();
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
