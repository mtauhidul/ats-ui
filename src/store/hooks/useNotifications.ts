import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../slices/notificationsSlice";
import type { Notification } from "../slices/notificationsSlice";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, error } = useAppSelector((state) => state.notifications);

  const fetchNotificationsCallback = useCallback(() => dispatch(fetchNotifications()), [dispatch]);
  const markAsReadCallback = useCallback((id: string) => dispatch(markAsRead(id)), [dispatch]);
  const markAllAsReadCallback = useCallback(() => dispatch(markAllAsRead()), [dispatch]);
  const deleteNotificationCallback = useCallback((id: string) => dispatch(deleteNotification(id)), [dispatch]);
  const createNotificationCallback = useCallback((notification: Omit<Notification, "id">) =>
      dispatch(createNotification(notification)), [dispatch]);

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications: fetchNotificationsCallback,
    markAsRead: markAsReadCallback,
    markAllAsRead: markAllAsReadCallback,
    deleteNotification: deleteNotificationCallback,
    createNotification: createNotificationCallback,
  };
};
