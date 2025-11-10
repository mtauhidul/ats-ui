import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

export type MessageStatus = 'sending' | 'sent' | 'failed' | 'seen';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  recipientAvatar: string;
  message: string;
  read: boolean;
  sentAt: string;
  status?: MessageStatus; // Frontend-only field for optimistic UI
  tempId?: string; // Temporary ID for optimistic messages
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface MessagesState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk("messages/fetchAll", async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/messages`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  const result = await response.json();
  // Backend returns {status: "success", data: {messages: [], conversations: [], total: n}}
  return result.data || result;
});

export const sendMessage = createAsyncThunk(
  "messages/send",
  async (message: Omit<Message, "id" | "sentAt">) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        body: JSON.stringify({
          ...message,
          sentAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Send message failed:', response.status, errorData);
        throw new Error(errorData.message || "Failed to send message");
      }
      
      const result = await response.json();
      console.log('✅ Send message response:', result);
      return result.data || result;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    });
    if (!response.ok) throw new Error("Failed to mark message as read");
    const result = await response.json();
    return result.data || result;
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/delete",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/messages/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete message");
    await response.json();
    return id;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // Set messages from Firestore real-time subscription
    setMessagesFromFirestore: (state, action: PayloadAction<Message[]>) => {
      const messages = action.payload.map((msg) => ({
        ...msg,
        status: msg.read ? 'seen' : 'sent' as MessageStatus,
      }));
      
      state.messages = messages;
      
      // Group messages into conversations
      const conversationsMap = new Map<string, Conversation>();
      
      messages.forEach((msg) => {
        const { conversationId } = msg;
        
        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            participantId: msg.senderId === msg.recipientId ? msg.senderId : 
                          (msg.senderId !== msg.recipientId ? 
                            (msg.senderId || msg.recipientId) : msg.recipientId),
            participantName: msg.senderName || msg.recipientName,
            participantAvatar: msg.senderAvatar || msg.recipientAvatar,
            participantRole: msg.senderRole || msg.recipientRole,
            lastMessage: msg.message,
            lastMessageTime: msg.sentAt,
            unreadCount: 0,
            messages: [],
          });
        }
        
        const conv = conversationsMap.get(conversationId)!;
        conv.messages.push(msg);
        
        // Update last message if this message is newer
        if (new Date(msg.sentAt) > new Date(conv.lastMessageTime)) {
          conv.lastMessage = msg.message;
          conv.lastMessageTime = msg.sentAt;
        }
        
        // Count unread messages
        if (!msg.read) {
          conv.unreadCount++;
        }
      });
      
      state.conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      
      // Update current conversation if it exists
      if (state.currentConversation) {
        const updatedConv = state.conversations.find(
          c => c.id === state.currentConversation?.id
        );
        if (updatedConv) {
          state.currentConversation = updatedConv;
        }
      }
    },
    setCurrentConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.currentConversation = action.payload;
    },
    // Optimistic update: add message immediately with 'sending' status
    addOptimisticMessage: (state, action: PayloadAction<Message>) => {
      const optimisticMsg = { ...action.payload, status: 'sending' as MessageStatus };

      // Add to current conversation immediately
      if (state.currentConversation &&
          state.currentConversation.id === optimisticMsg.conversationId) {
        state.currentConversation.messages.push(optimisticMsg);
        state.currentConversation.lastMessage = optimisticMsg.message;
        state.currentConversation.lastMessageTime = optimisticMsg.sentAt;
      }

      // Update conversation in list
      const convIndex = state.conversations.findIndex(
        c => c.id === optimisticMsg.conversationId
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = optimisticMsg.message;
        state.conversations[convIndex].lastMessageTime = optimisticMsg.sentAt;
        state.conversations[convIndex].messages.push(optimisticMsg);

        // Move to top
        const conv = state.conversations.splice(convIndex, 1)[0];
        state.conversations.unshift(conv);
      }
    },
    // Update message status (sent, failed, seen)
    updateMessageStatus: (
      state,
      action: PayloadAction<{ tempId: string; status: MessageStatus; realId?: string }>
    ) => {
      const { tempId, status, realId } = action.payload;

      // Update in current conversation
      if (state.currentConversation) {
        const msgIndex = state.currentConversation.messages.findIndex(
          m => m.tempId === tempId || m.id === tempId
        );
        if (msgIndex !== -1) {
          state.currentConversation.messages[msgIndex].status = status;
          if (realId) {
            state.currentConversation.messages[msgIndex].id = realId;
          }
        }
      }

      // Update in conversations list
      state.conversations.forEach(conv => {
        const msgIndex = conv.messages.findIndex(
          m => m.tempId === tempId || m.id === tempId
        );
        if (msgIndex !== -1) {
          conv.messages[msgIndex].status = status;
          if (realId) {
            conv.messages[msgIndex].id = realId;
          }
        }
      });
    },
    // Remove failed message (for retry)
    removeOptimisticMessage: (state, action: PayloadAction<string>) => {
      const tempId = action.payload;

      if (state.currentConversation) {
        state.currentConversation.messages = state.currentConversation.messages.filter(
          m => m.tempId !== tempId
        );
      }

      state.conversations.forEach(conv => {
        conv.messages = conv.messages.filter(m => m.tempId !== tempId);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchMessages.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          // Backend returns {messages: [], conversations: []} already processed
          const messages = (action.payload.messages || []).map((msg: any) => ({
            ...msg,
            status: msg.read ? 'seen' : 'sent', // Set default status based on read status
          }));
          const conversations = (action.payload.conversations || []).map((conv: any) => ({
            ...conv,
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              status: msg.read ? 'seen' : 'sent',
            })),
          }));

          state.messages = messages;
          state.conversations = conversations;

          // Update current conversation if it exists
          if (state.currentConversation) {
            const updatedConv = state.conversations.find(
              c => c.id === state.currentConversation?.id
            );
            if (updatedConv) {
              state.currentConversation = updatedConv;
            }
          }
        }
      )
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch messages";
      })
      // Send message - just update status from 'sending' to 'sent'
      .addCase(
        sendMessage.fulfilled,
        (state, action: PayloadAction<Message>) => {
          // The message was already added optimistically, just update its status
          const newMessage = action.payload;
          state.messages.push(newMessage);

          // Note: The optimistic message is already in the UI
          // We just need to update its status and real ID
          // This will be handled by the component dispatching updateMessageStatus
        }
      )
      .addCase(
        sendMessage.rejected,
        () => {
          // Mark the optimistic message as failed
          // This will be handled by the component dispatching updateMessageStatus with 'failed'
        }
      )
      // Mark as read
      .addCase(
        markMessageAsRead.fulfilled,
        (state, action: PayloadAction<Message>) => {
          const updatedMessage = action.payload;
          const index = state.messages.findIndex(
            (m) => m.id === updatedMessage.id
          );
          if (index !== -1) {
            state.messages[index] = updatedMessage;
          }
          // Update in current conversation
          if (state.currentConversation) {
            const msgIndex = state.currentConversation.messages.findIndex(
              m => m.id === updatedMessage.id
            );
            if (msgIndex !== -1) {
              state.currentConversation.messages[msgIndex] = updatedMessage;
            }
          }
          // Note: Marking as read doesn't need to rebuild conversations
        }
      )
      // Delete message
      .addCase(
        deleteMessage.fulfilled,
        (state, action: PayloadAction<string>) => {
          const deletedId = action.payload;
          state.messages = state.messages.filter(
            (m) => m.id !== deletedId
          );
          // Remove from current conversation
          if (state.currentConversation) {
            state.currentConversation.messages = state.currentConversation.messages.filter(
              m => m.id !== deletedId
            );
          }
          // Note: Should refetch to properly update conversations list
        }
      );
  },
});

export const {
  setMessagesFromFirestore,
  setCurrentConversation,
  addOptimisticMessage,
  updateMessageStatus,
  removeOptimisticMessage,
} = messagesSlice.actions;
export default messagesSlice.reducer;
