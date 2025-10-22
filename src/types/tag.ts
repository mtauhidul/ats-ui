import type { BaseEntity } from "./common";

// Tag entity - Simple tags for jobs and candidates
export interface Tag extends BaseEntity {
  name: string;
  description?: string;
  color?: string; // Hex color for UI display
  isSystem?: boolean; // System tags vs user-created tags
}

// Tag creation request
export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

// Tag update request
export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
}

// Tag filters
export interface TagFilters {
  search?: string;
  isSystem?: boolean;
}

export type TagSortField = "name" | "createdAt" | "updatedAt";