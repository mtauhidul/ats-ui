import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  setCurrentConversation,
  setMessagesFromFirestore,
} from "../slices/messagesSlice";
import type { Message, Conversation } from "../slices/messagesSlice";
import { firestoreRealtimeService } from "@/services/firestore-realtime.service";
import { useAuth } from "@/hooks/useAuth";

export const useMessages = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { messages, conversations, currentConversation, isLoading, error } = useAppSelector(
    (state) => state.messages
  );

  // Subscribe to Firestore real-time updates
  useEffect(() => {
    if (!user?.id) {
      console.log('⏳ Waiting for user to be authenticated before subscribing to messages');
      return;
    }

    console.log('🔥 Setting up Firestore real-time subscription for messages with userId:', user.id);
    
    const unsubscribe = firestoreRealtimeService.subscribeToMessages(user.id, (messagesData) => {
      console.log('📨 Received messages from Firestore:', messagesData.length);
      dispatch(setMessagesFromFirestore({ 
        messages: messagesData, 
        currentUserId: user.id 
      }));
    });

    return () => {
      console.log('🔥 Cleaning up messages Firestore subscription');
      unsubscribe();
    };
  }, [dispatch, user?.id]);

  const sendMessageCallback = useCallback((message: Omit<Message, "id" | "sentAt">) => dispatch(sendMessage(message)), [dispatch]);
  const markAsReadCallback = useCallback((id: string) => dispatch(markMessageAsRead(id)), [dispatch]);
  const deleteMessageCallback = useCallback((id: string) => dispatch(deleteMessage(id)), [dispatch]);
  const setCurrentConversationCallback = useCallback((conversation: Conversation | null) =>
      dispatch(setCurrentConversation(conversation)), [dispatch]);

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    error,
    sendMessage: sendMessageCallback,
    markAsRead: markAsReadCallback,
    deleteMessage: deleteMessageCallback,
    setCurrentConversation: setCurrentConversationCallback,
  };
};
