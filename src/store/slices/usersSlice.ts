import type { User } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { toast } from "sonner";

import { API_BASE_URL } from "@/config/api";

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  const result = await response.json();
  const users = result.data?.users || result.data || result;

  // Transform _id to id for frontend compatibility
  return users.map((user: any) => ({
    ...user,
    id: user._id || user.id,
    _id: undefined,
  }));
});

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to update user");
      }
      
      toast.success("User updated successfully");
      return result.data || result;
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Failed to update user";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Return the backend error message
        throw new Error(result.message || result.error || "Failed to delete user");
      }
      
      return result.data || result;
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Failed to delete user";
      return rejectWithValue(errorMessage);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Remove the deleted user from the state array
        state.users = state.users.filter(u => u.id !== action.payload.id);
      });
  },
});

export default usersSlice.reducer;
