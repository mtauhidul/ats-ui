import { db } from '@/config/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  type Unsubscribe,
  type QueryConstraint
} from 'firebase/firestore';

/**
 * Convert Firestore Timestamps to JavaScript Dates recursively
 * This ensures Redux doesn't complain about non-serializable values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertTimestamps(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Check if it's a Firestore Timestamp
  if (obj?.toDate && typeof obj.toDate === 'function') {
    return obj.toDate();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converted: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertTimestamps(obj[key]);
      }
    }
    return converted;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Firestore Real-time Service
 * Direct Firestore subscriptions for real-time updates
 * No API calls, no caching needed - just real-time data
 */

export class FirestoreRealtimeService {
  private unsubscribers: Map<string, Unsubscribe> = new Map();

  /**
   * Subscribe to a collection with real-time updates
   */
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    const key = `${collectionName}_${Date.now()}`;
    
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const rawData = { id: doc.id, ...doc.data() };
          // Convert all Firestore Timestamps to JavaScript Dates
          return convertTimestamps(rawData);
        }) as T[];
        
        callback(data);
      },
      (error) => {
        }
    );

    this.unsubscribers.set(key, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.unsubscribers.delete(key);
    };
  }

  /**
   * Subscribe to candidates
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToCandidates(callback: (candidates: any[]) => void): () => void {
    return this.subscribeToCollection('candidates', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to jobs
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToJobs(callback: (jobs: any[]) => void): () => void {
    return this.subscribeToCollection('jobs', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to applications
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToApplications(callback: (applications: any[]) => void): () => void {
    return this.subscribeToCollection('applications', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to clients
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToClients(callback: (clients: any[]) => void): () => void {
    return this.subscribeToCollection('clients', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to users/team members
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToUsers(callback: (users: any[]) => void): () => void {
    return this.subscribeToCollection('users', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to categories
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToCategories(callback: (categories: any[]) => void): () => void {
    return this.subscribeToCollection('categories', callback);
  }

  /**
   * Subscribe to tags
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToTags(callback: (tags: any[]) => void): () => void {
    return this.subscribeToCollection('tags', callback);
  }

  /**
   * Subscribe to pipelines
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToPipelines(callback: (pipelines: any[]) => void): () => void {
    return this.subscribeToCollection('pipelines', callback);
  }

  /**
   * Subscribe to messages for a specific user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToMessages(userId: string, callback: (messages: any[]) => void): () => void {
    const key = `messages_${Date.now()}`;
    
    const collectionRef = collection(db, 'messages');
    
    // Query for messages where user is either sender or recipient
    // Note: Firestore doesn't support OR queries directly, so we'll fetch all and filter
    // For better performance in production, consider composite queries or denormalization
    const q = query(collectionRef, orderBy('sentAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              ...docData,
              // Convert Firestore Timestamp to ISO string for sentAt
              sentAt: docData.sentAt?.toDate?.() 
                ? docData.sentAt.toDate().toISOString() 
                : docData.sentAt,
            };
          })
          // Filter for messages where user is sender or recipient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((msg: any) => {
            const isSender = msg.senderId === userId;
            const isRecipient = msg.recipientId === userId;
            const hasConversationId = !!msg.conversationId;
            const notEmailTracking = !msg.emailId;
            
            return (isSender || isRecipient) && hasConversationId && notEmailTracking;
          });
        
        callback(data);
      },
      (error) => {
        }
    );

    this.unsubscribers.set(key, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.unsubscribers.delete(key);
    };
  }

  /**
   * Subscribe to email templates
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToEmailTemplates(callback: (templates: any[]) => void): () => void {
    return this.subscribeToCollection('emailTemplates', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Subscribe to notifications for current user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void): () => void {
    const key = `notifications_${Date.now()}`;
    
    const collectionRef = collection(db, 'notifications');
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            // Convert Firestore Timestamps to ISO strings
            createdAt: docData.createdAt?.toDate?.() 
              ? docData.createdAt.toDate().toISOString() 
              : docData.createdAt,
            updatedAt: docData.updatedAt?.toDate?.() 
              ? docData.updatedAt.toDate().toISOString() 
              : docData.updatedAt,
            expiresAt: docData.expiresAt?.toDate?.() 
              ? docData.expiresAt.toDate().toISOString() 
              : docData.expiresAt,
          };
        });
        
        callback(data);
      },
      (error) => {
        }
    );

    this.unsubscribers.set(key, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.unsubscribers.delete(key);
    };
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.clear();
    }
}

export const firestoreRealtimeService = new FirestoreRealtimeService();
