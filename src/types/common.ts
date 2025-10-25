// Common types and enums used across the application

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common status types
export const Status = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

// Priority levels
export const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

// Address interface
export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

// Contact information
export interface ContactInfo {
  email: string;
  phone?: string;
  linkedIn?: string;
  website?: string;
}

// File attachment interface
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // MIME type (e.g., 'application/pdf', 'image/png')
  uploadedAt: Date;
  uploadedBy?: string; // User ID who uploaded
}

// Sorting and filtering
export interface SortOptions<T extends string> {
  field: T;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}