import type { User } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  return result.data?.users || result.data || result;
});

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
      });
  },
});

export default usersSlice.reducer;
