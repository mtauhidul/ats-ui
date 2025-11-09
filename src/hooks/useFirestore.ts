import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  type QueryConstraint,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Re-export query helpers for convenience
export { where, orderBy, limit } from 'firebase/firestore';

/**
 * Generic Firestore realtime hook
 * Subscribes to a collection and returns live data
 */
export interface UseFirestoreCollectionOptions<T = DocumentData> {
  collectionPath: string;
  queryConstraints?: QueryConstraint[];
  enabled?: boolean; // Allow disabling the subscription
  transform?: (doc: DocumentData) => T; // Transform function for each document
}

export interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
  refetch: () => Promise<void>;
}

export function useFirestoreCollection<T = DocumentData>(
  options: UseFirestoreCollectionOptions<T>
): UseFirestoreCollectionResult<T> {
  const { collectionPath, queryConstraints = [], enabled = true, transform } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Manual refetch function
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const collectionRef = collection(db, collectionPath);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : query(collectionRef);
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => {
        const docData = { id: doc.id, ...doc.data() };
        return transform ? transform(docData) : docData;
      });
      
      setData(docs as T[]);
    } catch (err) {
      setError(err as FirestoreError);
      console.error(`Error fetching ${collectionPath}:`, err);
    } finally {
      setLoading(false);
    }
  }, [collectionPath, queryConstraints, transform]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe | undefined;

    try {
      const collectionRef = collection(db, collectionPath);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : query(collectionRef);

      // Subscribe to realtime updates
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map(doc => {
            const docData = { id: doc.id, ...doc.data() };
            return transform ? transform(docData) : docData;
          });

          setData(docs as T[]);
          setLoading(false);
          
          console.log(`📊 Firestore realtime update: ${collectionPath} (${docs.length} documents)`);
        },
        (err) => {
          setError(err);
          setLoading(false);
          console.error(`❌ Firestore subscription error for ${collectionPath}:`, err);
        }
      );
    } catch (err) {
      setError(err as FirestoreError);
      setLoading(false);
      console.error(`❌ Error setting up Firestore subscription for ${collectionPath}:`, err);
    }

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        console.log(`🔌 Unsubscribing from ${collectionPath}`);
        unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, enabled, JSON.stringify(queryConstraints)]);

  return { data, loading, error, refetch };
}

/**
 * Hook for subscribing to a single document
 */
export interface UseFirestoreDocumentOptions<T = DocumentData> {
  documentPath: string;
  enabled?: boolean;
  transform?: (doc: DocumentData) => T;
}

export interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
  exists: boolean;
}

export function useFirestoreDocument<T = DocumentData>(
  options: UseFirestoreDocumentOptions<T>
): UseFirestoreDocumentResult<T> {
  const { documentPath, enabled = true, transform } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!enabled || !documentPath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Split path into collection/doc/collection/doc...
    const parts = documentPath.split('/');
    const collectionPath = parts.slice(0, parts.length - 1).join('/');
    const docId = parts[parts.length - 1];
    
    const docRef = doc(db, collectionPath, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = { id: snapshot.id, ...snapshot.data() };
          setData((transform ? transform(docData) : docData) as T);
          setExists(true);
        } else {
          setData(null);
          setExists(false);
        }
        setLoading(false);
        
        console.log(`📄 Firestore document update: ${documentPath}`);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        console.error(`❌ Firestore document subscription error for ${documentPath}:`, err);
      }
    );

    return () => {
      console.log(`🔌 Unsubscribing from document ${documentPath}`);
      unsubscribe();
    };
  }, [documentPath, enabled, transform]);

  return { data, loading, error, exists };
}

/**
 * Utility function to get user's company ID
 * Gets from localStorage or uses default
 */
export function getUserCompanyId(): string {
  // Try to get from localStorage (set during login)
  const storedCompanyId = localStorage.getItem('companyId');
  if (storedCompanyId) {
    return storedCompanyId;
  }
  
  // Fallback to environment variable or default
  const envCompanyId = import.meta.env.VITE_DEFAULT_COMPANY_ID;
  if (envCompanyId) {
    return envCompanyId;
  }
  
  // Ultimate fallback - matches backend default
  return 'default-company';
}

/**
 * Helper to build company-scoped collection path
 */
export function getCompanyCollectionPath(collectionName: string): string {
  const companyId = getUserCompanyId();
  console.log(`🏢 Building Firestore path: companies/${companyId}/${collectionName}`);
  return `companies/${companyId}/${collectionName}`;
}
