/**
 * Firestore Realtime Hook for Team Members
 * 
 * Provides realtime subscription to team members collection in Firestore.
 * Data updates automatically when changes occur in the database.
 */

import { useMemo } from 'react';
import { useFirestoreCollection, type UseFirestoreCollectionResult } from './useFirestore';
import type { TeamMember } from '@/types/team';
import type { DocumentData } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

/**
 * Transform Firestore document to TeamMember type
 */
function transformTeamMemberDocument(doc: DocumentData): TeamMember {
  // Convert Firestore Timestamps to Dates
  const createdAt = doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : 
                   doc.createdAt ? new Date(doc.createdAt) : new Date();
  const updatedAt = doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate() : 
                   doc.updatedAt ? new Date(doc.updatedAt) : new Date();
  const startDate = doc.startDate instanceof Timestamp ? doc.startDate.toDate() :
                   doc.startDate ? new Date(doc.startDate) : undefined;

  return {
    ...doc,
    id: doc.id,
    createdAt,
    updatedAt,
    startDate,
    // Ensure status is properly set (handle both isActive and status fields)
    status: doc.status || (doc.isActive !== undefined ? (doc.isActive ? 'active' : 'inactive') : 'active'),
    // Ensure permissions object exists
    permissions: doc.permissions || {
      canManageClients: false,
      canManageJobs: false,
      canReviewApplications: false,
      canManageCandidates: false,
      canSendEmails: false,
      canManageTeam: false,
      canAccessAnalytics: false,
    },
  } as TeamMember;
}

/**
 * Hook to get all team members with realtime updates
 * Note: Currently reads from 'users' collection since team members are users in this system
 */
export function useTeamMembers(options?: {
  enabled?: boolean;
}): UseFirestoreCollectionResult<TeamMember> {
  const { enabled = true } = options || {};

  return useFirestoreCollection<TeamMember>({
    collectionPath: 'users', // Read from users collection, not teamMembers
    queryConstraints: [],
    enabled,
    transform: transformTeamMemberDocument,
  });
}

/**
 * Hook to get active team members only
 */
export function useActiveTeamMembers(options?: {
  enabled?: boolean;
}): UseFirestoreCollectionResult<TeamMember> {
  const result = useTeamMembers(options);

  const activeMembers = useMemo(() => {
    return result.data.filter((member: TeamMember) => member.status === 'active');
  }, [result.data]);

  return {
    ...result,
    data: activeMembers,
  };
}

/**
 * Hook to get team members by role
 */
export function useTeamMembersByRole(
  role: string,
  options?: { enabled?: boolean }
): UseFirestoreCollectionResult<TeamMember> {
  const result = useTeamMembers(options);

  const filteredMembers = useMemo(() => {
    return result.data.filter((member: TeamMember) => member.role === role);
  }, [result.data, role]);

  return {
    ...result,
    data: filteredMembers,
  };
}
