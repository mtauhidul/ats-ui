import { authenticatedFetch } from "@/lib/authenticated-fetch";

export interface EmailTemplate {
  _id?: string;
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: "interview" | "offer" | "rejection" | "follow_up" | "application_received" | "general";
  variables: string[];
  isDefault?: boolean;
  isActive?: boolean;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmailTemplateResponse {
  success: boolean;
  data: EmailTemplate | EmailTemplate[];
  count?: number;
  message?: string;
}

const API_BASE = "/api/email-templates";

/**
 * Get all email templates
 */
export async function getEmailTemplates(params?: {
  type?: string;
  isDefault?: boolean;
  isActive?: boolean;
}): Promise<EmailTemplate[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.type) queryParams.append("type", params.type);
  if (params?.isDefault !== undefined) queryParams.append("isDefault", String(params.isDefault));
  if (params?.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
  
  const url = queryParams.toString() ? `${API_BASE}?${queryParams}` : API_BASE;
  
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch email templates");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to fetch email templates");
  }
  
  return result.data;
}

/**
 * Get a single email template by ID
 */
export async function getEmailTemplateById(id: string): Promise<EmailTemplate> {
  const response = await authenticatedFetch(`${API_BASE}/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch email template");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to fetch email template");
  }
  
  return result.data;
}

/**
 * Get templates by type
 */
export async function getTemplatesByType(type: string): Promise<EmailTemplate[]> {
  const response = await authenticatedFetch(`${API_BASE}/type/${type}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch templates by type");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to fetch templates by type");
  }
  
  return result.data;
}

/**
 * Get default templates
 */
export async function getDefaultTemplates(): Promise<EmailTemplate[]> {
  const response = await authenticatedFetch(`${API_BASE}/defaults`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch default templates");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to fetch default templates");
  }
  
  return result.data;
}

/**
 * Create a new email template
 */
export async function createEmailTemplate(
  template: Omit<EmailTemplate, "_id" | "id" | "variables" | "createdAt" | "updatedAt" | "createdBy">
): Promise<EmailTemplate> {
  const response = await authenticatedFetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create email template");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to create email template");
  }
  
  return result.data;
}

/**
 * Update an email template
 */
export async function updateEmailTemplate(
  id: string,
  updates: Partial<Omit<EmailTemplate, "_id" | "id" | "variables" | "createdAt" | "updatedAt" | "createdBy">>
): Promise<EmailTemplate> {
  const response = await authenticatedFetch(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update email template");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to update email template");
  }
  
  return result.data;
}

/**
 * Delete an email template (soft delete)
 */
export async function deleteEmailTemplate(id: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete email template");
  }
  
  const result: { success: boolean; message?: string } = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Failed to delete email template");
  }
}

/**
 * Duplicate an email template
 */
export async function duplicateEmailTemplate(id: string): Promise<EmailTemplate> {
  const response = await authenticatedFetch(`${API_BASE}/${id}/duplicate`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to duplicate email template");
  }
  
  const result: EmailTemplateResponse = await response.json();
  
  if (!result.success || Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to duplicate email template");
  }
  
  return result.data;
}

