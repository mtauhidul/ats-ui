import type { Tag } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface TagsState {
  tags: Tag[];
  currentTag: Tag | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  currentTag: null,
  isLoading: false,
  error: null,
};

export const fetchTags = createAsyncThunk("tags/fetchAll", async () => {
  const response = await fetch(`${API_BASE_URL}/tags`);
  if (!response.ok) throw new Error("Failed to fetch tags");
  return response.json();
});

export const fetchTagById = createAsyncThunk(
  "tags/fetchById",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`);
    if (!response.ok) throw new Error("Failed to fetch tag");
    return response.json();
  }
);

export const createTag = createAsyncThunk(
  "tags/create",
  async (tagData: Partial<Tag>) => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tagData),
    });
    if (!response.ok) throw new Error("Failed to create tag");
    const data = await response.json();
    toast.success("Tag created successfully");
    return data;
  }
);

export const updateTag = createAsyncThunk(
  "tags/update",
  async ({ id, data }: { id: string; data: Partial<Tag> }) => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update tag");
    const result = await response.json();
    toast.success("Tag updated successfully");
    return result;
  }
);

export const deleteTag = createAsyncThunk("tags/delete", async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete tag");
  toast.success("Tag deleted successfully");
  return id;
});

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    setCurrentTag: (state, action: PayloadAction<Tag | null>) => {
      state.currentTag = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch tags";
      })
      .addCase(fetchTagById.fulfilled, (state, action) => {
        state.currentTag = action.payload;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setCurrentTag } = tagsSlice.actions;
export default tagsSlice.reducer;
