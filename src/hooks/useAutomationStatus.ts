import { useFirestoreDocument, type UseFirestoreDocumentResult } from './useFirestore';
import type { DocumentData } from 'firebase/firestore';

export interface AutomationStatus {
  enabled: boolean;
  running: boolean;
  lastRunAt: Date | null;
  lastRunDuration: number;
  cronIntervalMinutes: number; // Configurable cron interval (default: 1 minute)
  stats: {
    totalEmailsProcessed: number;
    totalCandidatesCreated: number;
    totalRepliesStored: number;
    totalErrors: number;
  };
  updatedAt: Date;
}

/**
 * Transform Firestore document to AutomationStatus type
 * Converts Firestore Timestamps to JavaScript Date objects
 */
function transformAutomationStatusDocument(data: DocumentData): AutomationStatus {
  return {
    enabled: data.enabled || false,
    running: data.running || false,
    lastRunAt: data.lastRunAt?.toDate?.() || data.lastRunAt || null,
    lastRunDuration: data.lastRunDuration || 0,
    cronIntervalMinutes: data.cronIntervalMinutes || 1, // Default: 1 minute
    stats: {
      totalEmailsProcessed: data.stats?.totalEmailsProcessed || 0,
      totalCandidatesCreated: data.stats?.totalCandidatesCreated || 0,
      totalRepliesStored: data.stats?.totalRepliesStored || 0,
      totalErrors: data.stats?.totalErrors || 0,
    },
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
  };
}

/**
 * Hook to get automation status with realtime updates
 * Status is stored as a single document with ID 'global'
 */
export function useAutomationStatus(options?: { enabled?: boolean }): UseFirestoreDocumentResult<AutomationStatus> {
  return useFirestoreDocument<AutomationStatus>({
    documentPath: 'automationStatus/global',
    enabled: options?.enabled,
    transform: transformAutomationStatusDocument,
  });
}
