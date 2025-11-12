import { useFirestoreCollection, orderBy, where, type UseFirestoreCollectionResult } from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

export interface EmailAccount {
  id: string;
  email: string;
  displayName?: string;
  provider: 'gmail' | 'outlook' | 'custom';
  
  // IMAP Settings
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string; // encrypted
  imapTls?: boolean;
  
  // SMTP Settings (optional - for future use)
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string; // encrypted
  smtpTls?: boolean;
  
  // Automation Settings
  autoProcessResumes: boolean;
  defaultApplicationStatus?: string;
  
  // Status
  isActive: boolean;
  isVerified?: boolean;
  lastChecked?: Date;
  lastError?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform Firestore document to EmailAccount type
 * Converts Firestore Timestamps to JavaScript Date objects
 */
function transformEmailAccountDocument(data: DocumentData): EmailAccount {
  return {
    ...data,
    lastChecked: data.lastChecked?.toDate?.() || data.lastChecked,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
  } as EmailAccount;
}

/**
 * Hook to get all email accounts with realtime updates
 */
export function useEmailAccounts(options?: { enabled?: boolean }): UseFirestoreCollectionResult<EmailAccount> {
  return useFirestoreCollection<EmailAccount>({
    collectionPath: 'emailAccounts',
    queryConstraints: [
      orderBy('createdAt', 'desc'),
    ],
    enabled: options?.enabled,
    transform: transformEmailAccountDocument,
  });
}

/**
 * Hook to get active email accounts only
 */
export function useActiveEmailAccounts(options?: { enabled?: boolean }): UseFirestoreCollectionResult<EmailAccount> {
  return useFirestoreCollection<EmailAccount>({
    collectionPath: 'emailAccounts',
    queryConstraints: [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
    ],
    enabled: options?.enabled,
    transform: transformEmailAccountDocument,
  });
}

/**
 * Hook to get email accounts with automation enabled
 */
export function useAutomatedEmailAccounts(options?: { enabled?: boolean }): UseFirestoreCollectionResult<EmailAccount> {
  return useFirestoreCollection<EmailAccount>({
    collectionPath: 'emailAccounts',
    queryConstraints: [
      where('isActive', '==', true),
      where('autoProcessResumes', '==', true),
      orderBy('createdAt', 'desc'),
    ],
    enabled: options?.enabled,
    transform: transformEmailAccountDocument,
  });
}
