import type { Tag } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

// Helper function to normalize tag data from backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeTag = (tag: Record<string, any>): Tag => {
  // If tag has _id but no id, use _id as id
  if (tag._id && !tag.id) {
    const { _id, ...rest } = tag;
    return { ...rest, id: _id } as Tag;
  }
  return tag as Tag;
};

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
  const response = await authenticatedFetch(`${API_BASE_URL}/tags`);
  if (!response.ok) throw new Error("Failed to fetch tags");
  const result = await response.json();
  const tags = result.data?.tags || result.data || result;
  // Normalize tags to ensure they have 'id' instead of '_id'
  return Array.isArray(tags) ? tags.map(normalizeTag) : tags;
});

export const fetchTagById = createAsyncThunk(
  "tags/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/tags/${id}`);
    if (!response.ok) throw new Error("Failed to fetch tag");
    const result = await response.json();
    return normalizeTag(result.data || result);
  }
);

export const createTag = createAsyncThunk(
  "tags/create",
  async (tagData: Partial<Tag>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/tags`, {
      method: "POST",
      body: JSON.stringify(tagData),
    });
    if (!response.ok) throw new Error("Failed to create tag");
    const result = await response.json();
    toast.success("Tag created successfully");
    return normalizeTag(result.data || result);
  }
);

export const updateTag = createAsyncThunk(
  "tags/update",
  async ({ id, data }: { id: string; data: Partial<Tag> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update tag");
    const result = await response.json();
    toast.success("Tag updated successfully");
    return normalizeTag(result.data || result);
  }
);

export const deleteTag = createAsyncThunk("tags/delete", async (id: string) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/tags/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete tag");
  await response.json();
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
