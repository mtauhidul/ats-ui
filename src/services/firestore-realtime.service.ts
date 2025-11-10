import { db } from '@/config/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  type Unsubscribe,
  type QueryConstraint
} from 'firebase/firestore';

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
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        console.log(`🔥 Real-time update from ${collectionName}:`, data.length, 'items');
        callback(data);
      },
      (error) => {
        console.error(`Error in ${collectionName} subscription:`, error);
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
   * Subscribe to messages
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToMessages(callback: (messages: any[]) => void): () => void {
    return this.subscribeToCollection('messages', callback, [
      orderBy('sentAt', 'desc')
    ]);
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
  subscribeToNotifications(callback: (notifications: any[]) => void): () => void {
    return this.subscribeToCollection('notifications', callback, [
      orderBy('createdAt', 'desc')
    ]);
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.clear();
    console.log('🔥 All Firestore subscriptions cleaned up');
  }
}

export const firestoreRealtimeService = new FirestoreRealtimeService();
