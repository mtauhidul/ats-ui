import type { Interview } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
    const response = await fetch(`${API_BASE_URL}/interviews`);
    if (!response.ok) throw new Error("Failed to fetch interviews");
    return response.json();
  }
);

export const createInterview = createAsyncThunk(
  "interviews/create",
  async (interviewData: Partial<Interview>) => {
    const response = await fetch(`${API_BASE_URL}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interviewData),
    });
    if (!response.ok) throw new Error("Failed to create interview");
    const data = await response.json();
    toast.success("Interview scheduled successfully");
    return data;
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
