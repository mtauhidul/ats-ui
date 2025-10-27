import type { BaseEntity } from "./common";

// Pipeline stage
export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  isDefault?: boolean;
}

// Pipeline
export interface Pipeline extends BaseEntity {
  name: string;
  description?: string;
  type?: 'candidate' | 'interview' | 'custom'; // Type from backend
  stages: PipelineStage[];
  isDefault?: boolean; // From backend - whether this is a default template
  isActive: boolean;
}

// Default pipeline templates
export const DEFAULT_PIPELINE_TEMPLATES = {
  STANDARD: {
    name: "Standard Hiring Pipeline",
    description: "Traditional recruitment workflow",
    stages: [
      { id: "new", name: "New Applications", description: "Recently submitted applications", color: "#3b82f6", icon: "📥", order: 1, isDefault: true },
      { id: "screening", name: "Screening", description: "Initial review", color: "#8b5cf6", icon: "🔍", order: 2, isDefault: true },
      { id: "interviewing", name: "Interviewing", description: "Interview process", color: "#f59e0b", icon: "💬", order: 3, isDefault: true },
      { id: "offer_extended", name: "Offer Extended", description: "Offer sent", color: "#10b981", icon: "🎁", order: 4, isDefault: true },
      { id: "hired", name: "Hired", description: "Successfully hired", color: "#22c55e", icon: "🎉", order: 5, isDefault: true },
    ],
  },
  TECHNICAL: {
    name: "Technical Hiring Pipeline",
    description: "For engineering and technical roles",
    stages: [
      { id: "new", name: "New Applications", description: "Recently submitted", color: "#3b82f6", icon: "📥", order: 1 },
      { id: "screening", name: "Resume Screening", description: "Initial review", color: "#8b5cf6", icon: "🔍", order: 2 },
      { id: "technical_test", name: "Technical Test", description: "Coding assessment", color: "#06b6d4", icon: "💻", order: 3 },
      { id: "technical_interview", name: "Technical Interview", description: "Deep dive technical", color: "#f59e0b", icon: "🔧", order: 4 },
      { id: "behavioral", name: "Behavioral Interview", description: "Culture fit", color: "#ec4899", icon: "👥", order: 5 },
      { id: "offer", name: "Offer", description: "Offer extended", color: "#10b981", icon: "🎁", order: 6 },
      { id: "hired", name: "Hired", description: "Onboarding", color: "#22c55e", icon: "🎉", order: 7 },
    ],
  },
  SALES: {
    name: "Sales Hiring Pipeline",
    description: "For sales and business development roles",
    stages: [
      { id: "new", name: "New Applications", description: "Initial applications", color: "#3b82f6", icon: "📥", order: 1 },
      { id: "phone_screen", name: "Phone Screen", description: "Quick assessment", color: "#8b5cf6", icon: "📞", order: 2 },
      { id: "sales_assessment", name: "Sales Assessment", description: "Role play or test", color: "#06b6d4", icon: "📊", order: 3 },
      { id: "manager_interview", name: "Manager Interview", description: "Hiring manager", color: "#f59e0b", icon: "👔", order: 4 },
      { id: "final_interview", name: "Final Interview", description: "Leadership team", color: "#ec4899", icon: "⭐", order: 5 },
      { id: "offer", name: "Offer", description: "Offer extended", color: "#10b981", icon: "🎁", order: 6 },
      { id: "hired", name: "Hired", description: "Successfully hired", color: "#22c55e", icon: "🎉", order: 7 },
    ],
  },
};
