import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  setCurrentConversation,
} from "../slices/messagesSlice";
import type { Message, Conversation } from "../slices/messagesSlice";

export const useMessages = () => {
  const dispatch = useAppDispatch();
  const { messages, conversations, currentConversation, isLoading, error } = useAppSelector(
    (state) => state.messages
  );

  const fetchMessagesCallback = useCallback(() => dispatch(fetchMessages()), [dispatch]);
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
    fetchMessages: fetchMessagesCallback,
    sendMessage: sendMessageCallback,
    markAsRead: markAsReadCallback,
    deleteMessage: deleteMessageCallback,
    setCurrentConversation: setCurrentConversationCallback,
  };
};
