import type { BaseEntity } from "./common";

// Category entity - Categories for jobs and candidates  
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string; // For hierarchical categories
  isActive: boolean;
  color?: string; // Hex color for UI display
  sortOrder?: number; // For custom ordering
}

// Category with children for hierarchical display
export interface CategoryTree extends Category {
  children?: CategoryTree[];
  level?: number; // Depth in hierarchy
}

// Category creation request
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  sortOrder?: number;
}

// Category update request
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  color?: string;
  sortOrder?: number;
}

// Category filters
export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}

export type CategorySortField = "name" | "sortOrder" | "createdAt" | "updatedAt";