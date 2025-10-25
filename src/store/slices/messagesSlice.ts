import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  const response = await fetch(`${API_BASE_URL}/messages`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
});

export const sendMessage = createAsyncThunk(
  "messages/send",
  async (message: Omit<Message, "id" | "sentAt">) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...message,
        sentAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  }
);

export const markMessageAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (!response.ok) throw new Error("Failed to mark message as read");
    return response.json();
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/delete",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete message");
    return id;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setCurrentConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.currentConversation = action.payload;
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
        (state, action: PayloadAction<Message[]>) => {
          state.isLoading = false;
          state.messages = action.payload;
          // Build conversations from messages
          state.conversations = buildConversations(action.payload);
        }
      )
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch messages";
      })
      // Send message
      .addCase(
        sendMessage.fulfilled,
        (state, action: PayloadAction<Message>) => {
          state.messages.push(action.payload);
          state.conversations = buildConversations(state.messages);
        }
      )
      // Mark as read
      .addCase(
        markMessageAsRead.fulfilled,
        (state, action: PayloadAction<Message>) => {
          const index = state.messages.findIndex(
            (m) => m.id === action.payload.id
          );
          if (index !== -1) {
            state.messages[index] = action.payload;
          }
          state.conversations = buildConversations(state.messages);
        }
      )
      // Delete message
      .addCase(
        deleteMessage.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.messages = state.messages.filter(
            (m) => m.id !== action.payload
          );
          state.conversations = buildConversations(state.messages);
        }
      );
  },
});

// Helper function to build conversations from messages
function buildConversations(messages: Message[]): Conversation[] {
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((msg) => {
    if (!conversationMap.has(msg.conversationId)) {
      conversationMap.set(msg.conversationId, {
        id: msg.conversationId,
        participantId: msg.recipientId,
        participantName: msg.recipientName,
        participantAvatar: msg.recipientAvatar,
        participantRole: msg.recipientRole,
        lastMessage: msg.message,
        lastMessageTime: msg.sentAt,
        unreadCount: 0,
        messages: [],
      });
    }

    const conversation = conversationMap.get(msg.conversationId)!;
    conversation.messages.push(msg);

    if (new Date(msg.sentAt) > new Date(conversation.lastMessageTime)) {
      conversation.lastMessage = msg.message;
      conversation.lastMessageTime = msg.sentAt;
    }

    if (!msg.read) {
      conversation.unreadCount++;
    }
  });

  return Array.from(conversationMap.values()).sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
  );
}

export const { setCurrentConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
