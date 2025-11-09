import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  setCurrentCategory,
} from "../slices/categoriesSlice";
import type { Category } from "@/types";
import { useCategories as useFirestoreCategories } from "@/hooks/firestore";

export const useCategories = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { data: categories, loading: isLoading, error: firestoreError } = useFirestoreCategories();
  
  // Keep currentCategory from Redux for backward compatibility
  const { currentCategory } = useAppSelector(
    (state) => state.categories
  );

  // Fetch functions are now no-ops since Firestore provides realtime data
  const fetchCategoriesCallback = useCallback(() => Promise.resolve(), []);
  const fetchCategoriesIfNeededCallback = useCallback(() => Promise.resolve(), []);
  const fetchCategoryByIdCallback = useCallback((_id: string) => dispatch(fetchCategoryById(_id)), [dispatch]);
  
  // Write operations still go through Redux/API for validation
  const createCategoryCallback = useCallback((data: Partial<Category>) => dispatch(createCategory(data)), [dispatch]);
  const updateCategoryCallback = useCallback((id: string, data: Partial<Category>) =>
      dispatch(updateCategory({ id, data })), [dispatch]);
  const deleteCategoryCallback = useCallback((id: string) => dispatch(deleteCategory(id)), [dispatch]);
  const setCurrentCategoryCallback = useCallback((category: Category | null) =>
      dispatch(setCurrentCategory(category)), [dispatch]);
  
  // Cache invalidation is automatic with Firestore realtime
  const invalidateCacheCallback = useCallback(() => Promise.resolve(), []);

  return {
    categories, // Now from Firestore with realtime updates!
    currentCategory,
    isLoading,
    error: firestoreError,
    fetchCategories: fetchCategoriesCallback,
    fetchCategoriesIfNeeded: fetchCategoriesIfNeededCallback,
    fetchCategoryById: fetchCategoryByIdCallback,
    createCategory: createCategoryCallback,
    updateCategory: updateCategoryCallback,
    deleteCategory: deleteCategoryCallback,
    setCurrentCategory: setCurrentCategoryCallback,
    invalidateCache: invalidateCacheCallback,
  };
};
