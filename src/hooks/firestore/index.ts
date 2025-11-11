/**
 * Firestore Realtime Hooks
 * 
 * This module provides React hooks for subscribing to Firestore collections
 * with realtime updates. Data updates automatically when changes occur in the database.
 * 
 * Usage:
 * ```tsx
 * import { useJobs, useApplications, useCandidates } from '@/hooks/firestore';
 * 
 * function MyComponent() {
 *   const { data: jobs, loading, error } = useJobs();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <div>{jobs.map(job => ...)}</div>;
 * }
 * ```
 */

// Core Firestore hooks
export {
  useFirestoreCollection,
  useFirestoreDocument,
  getUserCompanyId,
  getCompanyCollectionPath,
  where,
  orderBy,
  limit,
  type UseFirestoreCollectionOptions,
  type UseFirestoreCollectionResult,
  type UseFirestoreDocumentOptions,
  type UseFirestoreDocumentResult,
} from '../useFirestore';

// Jobs hooks
export {
  useJobs,
  useJob,
  useJobsByStatus,
  useJobsByClient,
} from '../useJobs';

// Applications hooks
export {
  useApplications,
  useApplication,
  useApplicationsByJob,
  useApplicationsByStatus,
  useApplicationsByCandidate,
} from '../useApplications';

// Candidates hooks
export {
  useCandidates,
  useCandidate,
  useCandidatesByJob,
  useCandidatesByStatus,
} from '../useCandidates';

// Clients, Categories, Tags hooks
export {
  useClients,
  useClient,
  useCategories,
  useCategory,
  useTags,
  useTag,
} from '../useClientsCategoriesTags';

// Team Members hooks
export {
  useTeamMembers,
  useActiveTeamMembers,
  useTeamMembersByRole,
} from '../useTeamMembers';

// Emails hooks
export {
  useEmails,
  useEmailsByCandidateAndJob,
  useEmailsByCandidate,
  useEmailsByThread,
  useEmailsByStatus,
  type Email,
} from '../useEmails';

// Interviews hooks
export {
  useInterviews,
  useInterview,
  useInterviewsByCandidate,
  useInterviewsByJob,
  useInterviewsByCandidateAndJob,
  useInterviewsByStatus,
  useUpcomingInterviews,
} from '../useInterviews';

// Activities hooks
export {
  useActivities,
  useActivitiesByUser,
  useActivitiesByAction,
  useActivitiesByResource,
  type Activity,
} from '../useActivities';
