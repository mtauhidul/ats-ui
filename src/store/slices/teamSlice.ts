import type { TeamMember } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface TeamState {
  teamMembers: TeamMember[];
  currentMember: TeamMember | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teamMembers: [],
  currentMember: null,
  isLoading: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk("team/fetchAll", async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/team`);
  if (!response.ok) throw new Error("Failed to fetch team members");
  const result = await response.json();
  return result.data?.teamMembers || result.data || result;
});

export const fetchTeamMemberById = createAsyncThunk(
  "team/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/team/${id}`);
    if (!response.ok) throw new Error("Failed to fetch team member");
    const result = await response.json();
    return result.data || result;
  }
);

export const createTeamMember = createAsyncThunk(
  "team/create",
  async (data: Partial<TeamMember>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/team`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create team member");
    const result = await response.json();
    toast.success("Team member created successfully");
    return result.data || result;
  }
);

export const updateTeamMember = createAsyncThunk(
  "team/update",
  async ({ id, data }: { id: string; data: Partial<TeamMember> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/team/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update team member");
    const result = await response.json();
    toast.success("Team member updated successfully");
    return result.data || result;
  }
);

export const deleteTeamMember = createAsyncThunk(
  "team/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/team/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete team member");
    await response.json();
    toast.success("Team member deleted successfully");
    return id;
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setCurrentMember: (state, action: PayloadAction<TeamMember | null>) => {
      state.currentMember = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch team members";
      })
      .addCase(fetchTeamMemberById.fulfilled, (state, action) => {
        state.currentMember = action.payload;
      })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.teamMembers.push(action.payload);
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.teamMembers.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.teamMembers[index] = action.payload;
        }
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.teamMembers = state.teamMembers.filter(
          (m) => m.id !== action.payload
        );
      });
  },
});

export const { setCurrentMember } = teamSlice.actions;
export default teamSlice.reducer;
