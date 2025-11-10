import { useMemo } from 'react';
import type { Client, Category, Tag } from '@/types';
import {
  useFirestoreCollection,
  where,
  type UseFirestoreCollectionResult,
} from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Transform Firestore document to Client type
 */
function transformClientDocument(doc: DocumentData): Client {
  return {
    ...doc,
    id: doc.id,
    contacts: Array.isArray(doc.contacts) ? doc.contacts : [],
    jobIds: Array.isArray(doc.jobIds) ? doc.jobIds : [],
  } as unknown as Client;
}

/**
 * Hook to subscribe to all clients with realtime updates
 * Note: Clients are stored at root level, not under companies
 */
export function useClients(options?: {
  enabled?: boolean;
  status?: string;
  industry?: string;
}): UseFirestoreCollectionResult<Client> {
  const { enabled = true, status, industry } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (industry) {
      constraints.push(where('industry', '==', industry));
    }

    // Note: Ordering removed to avoid index requirements
    // Can be added back after creating Firestore index if needed

    return constraints;
  }, [status, industry]);

  return useFirestoreCollection<Client>({
    collectionPath: 'clients', // Root level collection
    queryConstraints,
    enabled,
    transform: transformClientDocument,
  });
}

/**
 * Hook to subscribe to a single client with realtime updates
 */
export function useClient(clientId: string | null | undefined): {
  client: Client | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!clientId;

  const { data: clients, loading, error } = useClients({ enabled });

  const client = useMemo(() => {
    if (!clientId || !clients.length) return null;
    return clients.find(c => c.id === clientId) || null;
  }, [clientId, clients]);

  return {
    client,
    loading,
    error: error as Error | null,
    exists: !!client,
  };
}

// ==================== CATEGORIES ====================

/**
 * Transform Firestore document to Category type
 */
function transformCategoryDocument(doc: DocumentData): Category {
  return {
    ...doc,
    id: doc.id,
  } as unknown as Category;
}

/**
 * Hook to subscribe to all categories with realtime updates
 */
export function useCategories(options?: {
  enabled?: boolean;
  isActive?: boolean;
}): UseFirestoreCollectionResult<Category> {
  const { enabled = true, isActive } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (typeof isActive === 'boolean') {
      constraints.push(where('isActive', '==', isActive));
    }

    // Note: Ordering removed to avoid index requirements
    // Can be added back after creating Firestore index if needed

    return constraints;
  }, [isActive]);

  return useFirestoreCollection<Category>({
    collectionPath: 'categories', // Root level collection
    queryConstraints,
    enabled,
    transform: transformCategoryDocument,
  });
}

/**
 * Hook to subscribe to a single category with realtime updates
 */
export function useCategory(categoryId: string | null | undefined): {
  category: Category | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!categoryId;

  const { data: categories, loading, error } = useCategories({ enabled });

  const category = useMemo(() => {
    if (!categoryId || !categories.length) return null;
    return categories.find(c => c.id === categoryId) || null;
  }, [categoryId, categories]);

  return {
    category,
    loading,
    error: error as Error | null,
    exists: !!category,
  };
}

// ==================== TAGS ====================

/**
 * Transform Firestore document to Tag type
 */
function transformTagDocument(doc: DocumentData): Tag {
  return {
    ...doc,
    id: doc.id,
  } as unknown as Tag;
}

/**
 * Hook to subscribe to all tags with realtime updates
 */
export function useTags(options?: {
  enabled?: boolean;
  isActive?: boolean;
}): UseFirestoreCollectionResult<Tag> {
  const { enabled = true, isActive } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (typeof isActive === 'boolean') {
      constraints.push(where('isActive', '==', isActive));
    }

    // Note: Ordering removed to avoid index requirements
    // Can be added back after creating Firestore index if needed

    return constraints;
  }, [isActive]);

  return useFirestoreCollection<Tag>({
    collectionPath: 'tags', // Root level collection
    queryConstraints,
    enabled,
    transform: transformTagDocument,
  });
}

/**
 * Hook to subscribe to a single tag with realtime updates
 */
export function useTag(tagId: string | null | undefined): {
  tag: Tag | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!tagId;

  const { data: tags, loading, error } = useTags({ enabled });

  const tag = useMemo(() => {
    if (!tagId || !tags.length) return null;
    return tags.find(t => t.id === tagId) || null;
  }, [tagId, tags]);

  return {
    tag,
    loading,
    error: error as Error | null,
    exists: !!tag,
  };
}
