import {
  collection,
  type DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
  Query,
  QueryConstraint,
  where,
  type WhereFilterOp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../config/firebase";

export interface FirestoreHookResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface QueryOptions {
  orderByField?: string;
  orderByDirection?: "asc" | "desc";
  limitCount?: number;
}

/**
 * Hook to subscribe to a Firestore collection with real-time updates
 *
 * @param collectionPath - Path to the Firestore collection
 * @param filters - Array of query filters
 * @param options - Query options (orderBy, limit)
 * @returns Object containing data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { data: candidates, loading, error } = useFirestoreCollection<Candidate>(
 *   `companies/${companyId}/candidates`,
 *   [{ field: 'status', operator: '==', value: 'active' }],
 *   { orderByField: 'createdAt', orderByDirection: 'desc', limitCount: 20 }
 * );
 * ```
 */
export function useFirestoreCollection<T extends DocumentData>(
  collectionPath: string,
  filters: QueryFilter[] = [],
  options: QueryOptions = {}
): FirestoreHookResult<T & { id: string }> {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Create stable references for filters and options
  const filtersKey = JSON.stringify(filters);
  const optionsKey = JSON.stringify(options);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query constraints
      const constraints: QueryConstraint[] = [];

      // Add filters
      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      // Add ordering
      if (options.orderByField) {
        constraints.push(
          orderBy(options.orderByField, options.orderByDirection || "asc")
        );
      }

      // Add limit
      if (options.limitCount) {
        constraints.push(limit(options.limitCount));
      }

      // Create query
      const q: Query<DocumentData> = query(
        collection(db, collectionPath),
        ...constraints
      );

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as (T & { id: string })[];

          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore subscription error:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore query setup error:", err);
      setError(err as Error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collectionPath,
    filtersKey,
    optionsKey,
    refetchTrigger,
  ]);

  return { data, loading, error, refetch };
}

/**
 * Hook to subscribe to a single Firestore document with real-time updates
 *
 * @param collectionPath - Path to the Firestore collection
 * @param documentId - ID of the document
 * @returns Object containing data, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { data: candidate, loading, error } = useFirestoreDocument<Candidate>(
 *   `companies/${companyId}/candidates`,
 *   candidateId
 * );
 * ```
 */
export function useFirestoreDocument<T extends DocumentData>(
  collectionPath: string,
  documentId: string
): FirestoreHookResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    // Trigger refetch (in practice, Firestore will auto-update)
  }, []);

  useEffect(() => {
    if (!collectionPath || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = collection(db, collectionPath);
      const q = query(docRef, where("__name__", "==", documentId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setData([{ id: doc.id, ...doc.data() } as unknown as T]);
          } else {
            setData([]);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Firestore document subscription error:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore document query error:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionPath, documentId]);

  return { data, loading, error, refetch };
}

/**
 * Hook to get real-time document change notifications
 * Useful for showing toast notifications when data changes
 *
 * @param collectionPath - Path to the Firestore collection
 * @param filters - Array of query filters
 * @param onAdded - Callback when document is added
 * @param onModified - Callback when document is modified
 * @param onRemoved - Callback when document is removed
 *
 * @example
 * ```tsx
 * useFirestoreChanges<Candidate>(
 *   `companies/${companyId}/candidates`,
 *   [{ field: 'status', operator: '==', value: 'active' }],
 *   (candidate) => toast.success(`New candidate: ${candidate.firstName}`),
 *   (candidate) => toast.info(`Candidate updated: ${candidate.firstName}`),
 *   (candidate) => toast.warning(`Candidate removed: ${candidate.firstName}`)
 * );
 * ```
 */
export function useFirestoreChanges<T extends DocumentData>(
  collectionPath: string,
  filters: QueryFilter[] = [],
  onAdded?: (doc: T & { id: string }) => void,
  onModified?: (doc: T & { id: string }) => void,
  onRemoved?: (doc: T & { id: string }) => void
): void {
  const filtersKey2 = JSON.stringify(filters);

  useEffect(() => {
    if (!collectionPath) return;

    try {
      const constraints: QueryConstraint[] = [];

      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      const q: Query<DocumentData> = query(
        collection(db, collectionPath),
        ...constraints
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const doc = { id: change.doc.id, ...change.doc.data() } as T & {
            id: string;
          };

          if (change.type === "added" && onAdded) {
            onAdded(doc);
          }
          if (change.type === "modified" && onModified) {
            onModified(doc);
          }
          if (change.type === "removed" && onRemoved) {
            onRemoved(doc);
          }
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore changes subscription error:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, filtersKey2, onAdded, onModified, onRemoved]);
}
