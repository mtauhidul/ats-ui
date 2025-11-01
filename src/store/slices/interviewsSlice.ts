import type { Interview } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

export interface InterviewsState {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InterviewsState = {
  interviews: [],
  isLoading: false,
  error: null,
};

export const fetchInterviews = createAsyncThunk(
  "interviews/fetchAll",
  async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/interviews`);
    if (!response.ok) throw new Error("Failed to fetch interviews");
    const result = await response.json();
    return result.data?.interviews || result.data || result;
  }
);

export const createInterview = createAsyncThunk(
  "interviews/create",
  async (interviewData: Partial<Interview>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/interviews`, {
      method: "POST",
      body: JSON.stringify(interviewData),
    });
    if (!response.ok) throw new Error("Failed to create interview");
    const result = await response.json();
    toast.success("Interview scheduled successfully");
    return result.data || result;
  }
);

const interviewsSlice = createSlice({
  name: "interviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interviews = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch interviews";
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.interviews.push(action.payload);
      });
  },
});

export default interviewsSlice.reducer;
