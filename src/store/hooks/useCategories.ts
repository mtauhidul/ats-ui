import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchCategories,
  fetchCategoriesIfNeeded,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  setCurrentCategory,
  invalidateCategoriesCache,
} from "../slices/categoriesSlice";
import type { Category } from "@/types";

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const { categories, currentCategory, isLoading, error } = useAppSelector(
    (state) => state.categories
  );

  const fetchCategoriesCallback = useCallback(() => dispatch(fetchCategories()), [dispatch]);
  const fetchCategoriesIfNeededCallback = useCallback(() => dispatch(fetchCategoriesIfNeeded()), [dispatch]);
  const fetchCategoryByIdCallback = useCallback((id: string) => dispatch(fetchCategoryById(id)), [dispatch]);
  const createCategoryCallback = useCallback((data: Partial<Category>) => dispatch(createCategory(data)), [dispatch]);
  const updateCategoryCallback = useCallback((id: string, data: Partial<Category>) =>
      dispatch(updateCategory({ id, data })), [dispatch]);
  const deleteCategoryCallback = useCallback((id: string) => dispatch(deleteCategory(id)), [dispatch]);
  const setCurrentCategoryCallback = useCallback((category: Category | null) =>
      dispatch(setCurrentCategory(category)), [dispatch]);
  const invalidateCacheCallback = useCallback(() => dispatch(invalidateCategoriesCache()), [dispatch]);

  return {
    categories,
    currentCategory,
    isLoading,
    error,
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
