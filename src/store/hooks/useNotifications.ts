import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  setNotificationsFromFirestore,
  markNotificationAsReadLocally,
  markAllNotificationsAsReadLocally,
  deleteNotificationLocally,
  setLoading,
  setError,
  type NotificationType,
} from "../slices/notificationsSlice";
import type { Notification } from "../slices/notificationsSlice";
import { firestoreRealtimeService } from "@/services/firestore-realtime.service";
import { db } from "@/config/firebase";
import { doc, updateDoc, deleteDoc, addDoc, collection, writeBatch, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { notifications, isLoading, error } = useAppSelector((state) => state.notifications);

  // 🔥 Subscribe to Firestore notifications real-time for current user
  useEffect(() => {
    if (!user?.id) {
      console.log("⏳ Waiting for user authentication before subscribing to notifications");
      return;
    }

    console.log("🔥 Setting up Firestore notifications subscription for user:", user.id);
    
    const unsubscribe = firestoreRealtimeService.subscribeToNotifications(user.id, (notificationsData) => {
      console.log("🔥 Notifications real-time update:", notificationsData.length);
      dispatch(setNotificationsFromFirestore(notificationsData));
    });

    return () => {
      console.log("🔥 Cleaning up notifications subscription");
      unsubscribe();
    };
  }, [dispatch, user?.id]);

  // Mark notification as read in Firestore
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      dispatch(markNotificationAsReadLocally(id));
      
      // Update in Firestore
      const notificationRef = doc(db, "notifications", id);
      await updateDoc(notificationRef, { read: true });
      
      console.log("✅ Notification marked as read:", id);
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
      dispatch(setError("Failed to mark notification as read"));
    }
  }, [dispatch]);

  // Mark all notifications as read in Firestore
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      dispatch(markAllNotificationsAsReadLocally());
      
      // Update all in Firestore using batch
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      console.log("✅ All notifications marked as read");
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
      dispatch(setError("Failed to mark all notifications as read"));
    }
  }, [dispatch, notifications]);

  // Delete notification from Firestore (Admin only)
  const deleteNotification = useCallback(async (id: string) => {
    // Check if user is admin
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      console.error("❌ Permission denied: Only admins can delete notifications");
      dispatch(setError("Permission denied: Only admins can delete notifications"));
      return;
    }

    try {
      // Optimistic delete
      dispatch(deleteNotificationLocally(id));
      
      // Delete from Firestore
      const notificationRef = doc(db, "notifications", id);
      await deleteDoc(notificationRef);
      
      console.log("✅ Notification deleted by admin:", id);
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
      dispatch(setError("Failed to delete notification"));
    }
  }, [dispatch, user]);

  // Create notification in Firestore (for single user - current user)
  const createNotification = useCallback(async (notification: Omit<Notification, "id" | "userId">) => {
    if (!user?.id) {
      console.error("❌ Cannot create notification: User not authenticated");
      return;
    }

    try {
      dispatch(setLoading(true));
      
      // Add to Firestore with userId
      const notificationsRef = collection(db, "notifications");
      await addDoc(notificationsRef, {
        ...notification,
        userId: user.id, // Assign to current user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read: false,
      });
      
      console.log("✅ Notification created for user:", user.id);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      dispatch(setError("Failed to create notification"));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch, user?.id]);

  // Broadcast important notice to all team members
  const broadcastImportantNotice = useCallback(async (notice: { 
    type: NotificationType; 
    title: string; 
    message: string; 
    priority: 'low' | 'medium' | 'high' | 'urgent'; 
    expiresAt?: string;
  }) => {
    try {
      dispatch(setLoading(true));
      
      // Get all users to send notification to
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      console.log(`📢 Broadcasting to ${usersSnapshot.docs.length} users...`);
      
      // Create batch to add notification for all users
      const batch = writeBatch(db);
      const notificationsRef = collection(db, "notifications");
      
      // Create one notification per user with their userId
      usersSnapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        const newNotificationRef = doc(notificationsRef);
        
        batch.set(newNotificationRef, {
          userId: userData.id || userDoc.id, // FIXED: Assign userId for each user
          type: notice.type,
          title: notice.title,
          message: notice.message,
          priority: notice.priority,
          expiresAt: notice.expiresAt || null,
          isImportant: true,
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          relatedEntity: null,
        });
      });
      
      await batch.commit();
      console.log(`✅ Important notice broadcast to ${usersSnapshot.docs.length} users`);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("❌ Error broadcasting important notice:", error);
      dispatch(setError("Failed to broadcast important notice"));
      dispatch(setLoading(false));
      throw error;
    }
  }, [dispatch]);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    broadcastImportantNotice,
  };
};
