import type { Candidate } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface CandidatesState {
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  currentCandidate: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCandidates = createAsyncThunk(
  "candidates/fetchAll",
  async () => {
    const response = await fetch(`${API_BASE_URL}/candidates`);
    if (!response.ok) throw new Error("Failed to fetch candidates");
    return response.json();
  }
);

export const fetchCandidateById = createAsyncThunk(
  "candidates/fetchById",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
    if (!response.ok) throw new Error("Failed to fetch candidate");
    return response.json();
  }
);

export const createCandidate = createAsyncThunk(
  "candidates/create",
  async (candidateData: Partial<Candidate>) => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidateData),
    });
    if (!response.ok) throw new Error("Failed to create candidate");
    const data = await response.json();
    toast.success("Candidate created successfully");
    return data;
  }
);

export const updateCandidate = createAsyncThunk(
  "candidates/update",
  async ({ id, data }: { id: string; data: Partial<Candidate> }) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update candidate");
    const result = await response.json();
    toast.success("Candidate updated successfully");
    return result;
  }
);

export const deleteCandidate = createAsyncThunk(
  "candidates/delete",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete candidate");
    toast.success("Candidate deleted successfully");
    return id;
  }
);

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<Candidate | null>) => {
      state.currentCandidate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch candidates";
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.currentCandidate = action.payload;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.candidates.unshift(action.payload);
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.candidates[index] = action.payload;
        }
        if (state.currentCandidate?.id === action.payload.id) {
          state.currentCandidate = action.payload;
        }
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.candidates = state.candidates.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentCandidate?.id === action.payload) {
          state.currentCandidate = null;
        }
      });
  },
});

export const { setCurrentCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
