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

// Helper function to transform backend team member data to frontend format
const transformTeamMember = (backendMember: Record<string, unknown>): TeamMember => {
  // If userId is populated (object), flatten the user fields
  if (backendMember.userId && typeof backendMember.userId === 'object') {
    const userId = backendMember.userId as Record<string, unknown>;
    return {
      ...backendMember,
      id: (backendMember._id || backendMember.id) as string,
      firstName: userId.firstName as string,
      lastName: userId.lastName as string,
      email: userId.email as string,
      avatar: userId.avatar as string | undefined,
      phone: userId.phone as string | undefined,
      title: userId.title as string | undefined,
      department: userId.department as string | undefined,
      status: backendMember.isActive ? 'active' : 'inactive',
      userId: (userId._id || userId.id) as string,
    } as TeamMember;
  }
  // If it's already in the correct format or userId is just an ID
  return {
    ...backendMember,
    id: (backendMember._id || backendMember.id) as string,
    status: backendMember.isActive !== undefined ? (backendMember.isActive ? 'active' : 'inactive') : backendMember.status,
  } as TeamMember;
};

export const fetchTeamMembers = createAsyncThunk("team/fetchAll", async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/team`);
  if (!response.ok) throw new Error("Failed to fetch team members");
  const result = await response.json();
  const teamMembers = result.data?.teamMembers || result.data || result;
  // Transform team members from backend format to frontend format
  return Array.isArray(teamMembers) ? teamMembers.map(transformTeamMember) : [];
});

export const fetchTeamMemberById = createAsyncThunk(
  "team/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/team/${id}`);
    if (!response.ok) throw new Error("Failed to fetch team member");
    const result = await response.json();
    const member = result.data || result;
    return transformTeamMember(member);
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
    const member = result.data || result;
    return transformTeamMember(member);
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
    const member = result.data || result;
    return transformTeamMember(member);
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
