import type { Email } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface EmailsState {
  emails: Email[];
  currentEmail: Email | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailsState = {
  emails: [],
  currentEmail: null,
  isLoading: false,
  error: null,
};

export const fetchEmails = createAsyncThunk("emails/fetchAll", async () => {
  const response = await fetch(`${API_BASE_URL}/emails`);
  if (!response.ok) throw new Error("Failed to fetch emails");
  return response.json();
});

export const sendEmail = createAsyncThunk(
  "emails/send",
  async (emailData: Partial<Email>) => {
    const response = await fetch(`${API_BASE_URL}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) throw new Error("Failed to send email");
    const data = await response.json();
    toast.success("Email sent successfully");
    return data;
  }
);

const emailsSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {
    setCurrentEmail: (state, action: PayloadAction<Email | null>) => {
      state.currentEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emails = action.payload;
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch emails";
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.emails.unshift(action.payload);
      });
  },
});

export const { setCurrentEmail } = emailsSlice.actions;
export default emailsSlice.reducer;
