import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

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
  userId: string; // User this notification belongs to
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  isImportant?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
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
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const result = await response.json();
    return result.data?.notifications || result.data || result;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
    const result = await response.json();
    return result.data || result;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const result = await response.json();
    const notifications = result.data?.notifications || result.data || result;

    await Promise.all(
      notifications.map((notif: Notification) =>
        authenticatedFetch(`${API_BASE_URL}/notifications/${notif.id}`, {
          method: "PATCH",
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
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete notification");
    await response.json();
    return id;
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (notification: Omit<Notification, "id">) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      body: JSON.stringify(notification),
    });
    if (!response.ok) throw new Error("Failed to create notification");
    const result = await response.json();
    return result.data || result;
  }
);

export const broadcastImportantNotice = createAsyncThunk(
  "notifications/broadcastImportant",
  async (notice: { type: NotificationType; title: string; message: string; priority: 'low' | 'medium' | 'high' | 'urgent'; expiresAt?: string }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/broadcast-important`, {
      method: "POST",
      body: JSON.stringify(notice),
    });
    if (!response.ok) throw new Error("Failed to broadcast important notice");
    const result = await response.json();
    return result.data || result;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Set notifications from Firestore real-time subscription
    setNotificationsFromFirestore: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // Optimistic update for marking as read
    markNotificationAsReadLocally: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    // Optimistic update for marking all as read
    markAllNotificationsAsReadLocally: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    // Optimistic delete
    deleteNotificationLocally: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
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

export const {
  setNotificationsFromFirestore,
  markNotificationAsReadLocally,
  markAllNotificationsAsReadLocally,
  deleteNotificationLocally,
  setLoading,
  setError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
