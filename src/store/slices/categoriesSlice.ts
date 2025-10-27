import type { Category } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to normalize category data from backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeCategory = (category: Record<string, any>): Category => {
  // If category has _id but no id, use _id as id
  if (category._id && !category.id) {
    const { _id, ...rest } = category;
    return { ...rest, id: _id } as Category;
  }
  return category as Category;
};

export interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const result = await response.json();
    const categories = result.data?.categories || result.data || result;
    // Normalize categories to ensure they have 'id' instead of '_id'
    return Array.isArray(categories) 
      ? categories.map(normalizeCategory)
      : categories;
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error("Failed to fetch category");
    const result = await response.json();
    return normalizeCategory(result.data || result);
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData: Partial<Category>) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error("Failed to create category");
    const result = await response.json();
    toast.success("Category created successfully");
    return normalizeCategory(result.data || result);
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: Partial<Category> }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update category");
    const result = await response.json();
    toast.success("Category updated successfully");
    return normalizeCategory(result.data || result);
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
    await response.json();
    toast.success("Category deleted successfully");
    return id;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

export const { setCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
