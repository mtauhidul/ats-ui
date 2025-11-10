import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "interview" | "offer" | "rejection" | "follow_up" | "application_received" | "general";
  variables: string[];
  isDefault?: boolean;
  isActive?: boolean;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmailTemplatesState {
  templates: EmailTemplate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailTemplatesState = {
  templates: [],
  isLoading: false,
  error: null,
};

const emailTemplatesSlice = createSlice({
  name: "emailTemplates",
  initialState,
  reducers: {
    // Set templates from Firestore real-time subscription
    setEmailTemplates: (state, action: PayloadAction<EmailTemplate[]>) => {
      state.templates = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setEmailTemplates, setLoading, setError } = emailTemplatesSlice.actions;
export default emailTemplatesSlice.reducer;
