import { db } from '@/config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
  or,
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  message: string;
  read: boolean;
  sentAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date | string;
  unreadCount: number;
}

class ChatService {
  private messagesCollection = 'messages';

  /**
   * Generate conversation ID from two user IDs (sorted for consistency)
   */
  generateConversationId(userId1: string, userId2: string): string {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  /**
   * Send a message directly to Firestore
   */
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    message: string;
  }): Promise<string> {
    try {
      const now = new Date();
      const messageData = {
        ...data,
        read: false,
        sentAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.messagesCollection), messageData);
      console.log('✅ Message sent to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to messages for a specific conversation
   */
  subscribeToConversation(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, this.messagesCollection),
      where('conversationId', '==', conversationId),
      orderBy('sentAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('🔥 Firestore snapshot triggered!', {
          conversationId,
          docCount: snapshot.docs.length,
          docChanges: snapshot.docChanges().map(change => ({
            type: change.type,
            id: change.doc.id,
            message: change.doc.data().message?.substring(0, 50)
          }))
        });

        const messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Convert Firestore Timestamps to Date objects
          const sentAt = data.sentAt instanceof Timestamp 
            ? data.sentAt.toDate() 
            : data.sentAt instanceof Date 
            ? data.sentAt 
            : new Date(data.sentAt);
          
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : data.createdAt instanceof Date 
            ? data.createdAt 
            : new Date(data.createdAt);
          
          const updatedAt = data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate() 
            : data.updatedAt instanceof Date 
            ? data.updatedAt 
            : new Date(data.updatedAt);

          return {
            id: doc.id,
            ...data,
            sentAt,
            createdAt,
            updatedAt,
          } as ChatMessage;
        });
        
        console.log('📨 Calling callback with messages:', messages.length);
        callback(messages);
      },
      (error) => {
        console.error('❌ Error subscribing to conversation:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Subscribe to all conversations for a user
   */
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      collection(db, this.messagesCollection),
      or(where('senderId', '==', userId), where('recipientId', '==', userId)),
      orderBy('sentAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversationsMap = new Map<string, Conversation>();

        snapshot.docs.forEach((doc) => {
          const msg = doc.data();
          const conversationId = msg.conversationId;

          // Convert sentAt to Date
          const sentAt = msg.sentAt instanceof Timestamp 
            ? msg.sentAt.toDate() 
            : msg.sentAt instanceof Date 
            ? msg.sentAt 
            : new Date(msg.sentAt);

          if (!conversationsMap.has(conversationId)) {
            const isCurrentUserSender = msg.senderId === userId;
            const participantId = isCurrentUserSender ? msg.recipientId : msg.senderId;
            const participantName = isCurrentUserSender ? msg.recipientName : msg.senderName;
            const participantAvatar = isCurrentUserSender ? msg.recipientAvatar : msg.senderAvatar;

            conversationsMap.set(conversationId, {
              id: conversationId,
              participantId,
              participantName,
              participantAvatar,
              lastMessage: msg.message,
              lastMessageTime: sentAt,
              unreadCount: 0,
            });
          } else {
            const conv = conversationsMap.get(conversationId)!;
            const convTime = conv.lastMessageTime instanceof Date ? conv.lastMessageTime : new Date(conv.lastMessageTime);

            if (sentAt > convTime) {
              conv.lastMessage = msg.message;
              conv.lastMessageTime = sentAt;
            }

            // Count unread messages sent TO this user
            if (!msg.read && msg.recipientId === userId) {
              conv.unreadCount++;
            }
          }
        });

        const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
          const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime : new Date(a.lastMessageTime);
          const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime : new Date(b.lastMessageTime);
          return timeB.getTime() - timeA.getTime();
        });

        console.log('📨 Subscription received conversations:', conversations.length);
        callback(conversations);
      },
      (error) => {
        console.error('❌ Error subscribing to conversations:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, this.messagesCollection, messageId);
      await updateDoc(messageRef, {
        read: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map((document) =>
        updateDoc(document.ref, {
          read: true,
          updatedAt: new Date(),
        })
      );

      await Promise.all(updatePromises);
      console.log(`✅ Marked ${updatePromises.length} messages as read`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
