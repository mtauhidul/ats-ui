import type { Candidate } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to normalize candidate data (ensure id field exists)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeCandidate = (candidate: any): Candidate => {
  // Ensure id field exists (backend returns _id, we need id)
  if (!candidate.id && candidate._id) {
    candidate.id = candidate._id;
  }
  
  // If assignedTo is populated (object), extract the ID
  if (candidate.assignedTo && typeof candidate.assignedTo === 'object' && candidate.assignedTo._id) {
    candidate.assignedTo = candidate.assignedTo._id || candidate.assignedTo.id;
  }
  
  return candidate;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeCandidates = (candidates: any[]): Candidate[] => {
  return candidates.map(normalizeCandidate);
};

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
    const response = await authenticatedFetch(`${API_BASE_URL}/candidates`);
    if (!response.ok) throw new Error("Failed to fetch candidates");
    const result = await response.json();
    // Extract data from wrapped response and normalize
    const candidates = result.data?.candidates || result.data || result;
    console.log('📥 Fetched candidates, sample assignedTo:', candidates.slice(0, 3).map((c: Candidate) => ({ id: c.id || (c as unknown as { _id: string })._id, assignedTo: c.assignedTo })));
    const normalized = normalizeCandidates(candidates);
    console.log('📥 Normalized candidates, sample assignedTo:', normalized.slice(0, 3).map((c: Candidate) => ({ id: c.id, assignedTo: c.assignedTo })));
    return normalized;
  }
);

export const fetchCandidateById = createAsyncThunk(
  "candidates/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/candidates/${id}`);
    if (!response.ok) throw new Error("Failed to fetch candidate");
    const result = await response.json();
    return normalizeCandidate(result.data || result);
  }
);

export const createCandidate = createAsyncThunk(
  "candidates/create",
  async (candidateData: Partial<Candidate>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/candidates`, {
      method: "POST",
      body: JSON.stringify(candidateData),
    });
    if (!response.ok) throw new Error("Failed to create candidate");
    const result = await response.json();
    toast.success("Candidate created successfully");
    return normalizeCandidate(result.data || result);
  }
);

export const updateCandidate = createAsyncThunk(
  "candidates/update",
  async ({ id, data }: { id: string; data: Partial<Candidate> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update candidate");
    const result = await response.json();
    toast.success("Candidate updated successfully");
    return normalizeCandidate(result.data || result);
  }
);

export const deleteCandidate = createAsyncThunk(
  "candidates/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/candidates/${id}`, {
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
    // Optimistic update for candidate stage change
    updateCandidateStageOptimistic: (state, action: PayloadAction<{ candidateId: string; newStageId: string; newStageData?: { id: string; name: string; color: string; order: number } }>) => {
      const { candidateId, newStageId, newStageData } = action.payload;
      const index = state.candidates.findIndex((c) => c.id === candidateId);
      if (index !== -1) {
        state.candidates[index].currentPipelineStageId = newStageId;
        if (newStageData) {
          state.candidates[index].currentStage = newStageData;
        }
      }
      if (state.currentCandidate?.id === candidateId) {
        state.currentCandidate.currentPipelineStageId = newStageId;
        if (newStageData) {
          state.currentCandidate.currentStage = newStageData;
        }
      }
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

export const { setCurrentCandidate, updateCandidateStageOptimistic } = candidatesSlice.actions;
export default candidatesSlice.reducer;
