import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type NotificationType =
  | "application"
  | "interview"
  | "status_change"
  | "job"
  | "offer"
  | "team"
  | "reminder"
  | "client"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntity: {
    type: string;
    id: string;
    name: string;
  } | null;
}

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
    return response.json();
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const notifications = await response.json();

    await Promise.all(
      notifications.map((notif: Notification) =>
        fetch(`${API_BASE_URL}/notifications/${notif.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      )
    );
    return notifications;
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete notification");
    return id;
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (notification: Omit<Notification, "id">) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });
    if (!response.ok) throw new Error("Failed to create notification");
    return response.json();
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.isLoading = false;
          state.notifications = action.payload;
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      // Mark as read
      .addCase(
        markAsRead.fulfilled,
        (state, action: PayloadAction<Notification>) => {
          const index = state.notifications.findIndex(
            (n) => n.id === action.payload.id
          );
          if (index !== -1) {
            state.notifications[index] = action.payload;
          }
        }
      )
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
      })
      // Delete notification
      .addCase(
        deleteNotification.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.notifications = state.notifications.filter(
            (n) => n.id !== action.payload
          );
        }
      )
      // Create notification
      .addCase(
        createNotification.fulfilled,
        (state, action: PayloadAction<Notification>) => {
          state.notifications.unshift(action.payload);
        }
      );
  },
});

export default notificationsSlice.reducer;
