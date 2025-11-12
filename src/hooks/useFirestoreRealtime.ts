import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { firestoreRealtimeService } from '@/services/firestore-realtime.service';

/**
 * Custom hook for Firestore real-time subscriptions
 * Automatically subscribes on mount and cleans up on unmount
 * Updates Redux store with real-time data
 */

export const useFirestoreRealtime = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Subscribe to candidates
    const unsubCandidates = firestoreRealtimeService.subscribeToCandidates((candidates) => {
      dispatch({
        type: 'candidates/realtimeUpdate',
        payload: candidates,
      });
    });

    // Subscribe to jobs
    const unsubJobs = firestoreRealtimeService.subscribeToJobs((jobs) => {
      dispatch({
        type: 'jobs/realtimeUpdate',
        payload: jobs,
      });
    });

    // Subscribe to applications
    const unsubApplications = firestoreRealtimeService.subscribeToApplications((applications) => {
      dispatch({
        type: 'applications/realtimeUpdate',
        payload: applications,
      });
    });

    // Subscribe to clients
    const unsubClients = firestoreRealtimeService.subscribeToClients((clients) => {
      dispatch({
        type: 'clients/realtimeUpdate',
        payload: clients,
      });
    });

    // Subscribe to users
    const unsubUsers = firestoreRealtimeService.subscribeToUsers((users) => {
      dispatch({
        type: 'users/realtimeUpdate',
        payload: users,
      });
    });

    // Subscribe to categories
    const unsubCategories = firestoreRealtimeService.subscribeToCategories((categories) => {
      dispatch({
        type: 'categories/realtimeUpdate',
        payload: categories,
      });
    });

    // Subscribe to tags
    const unsubTags = firestoreRealtimeService.subscribeToTags((tags) => {
      dispatch({
        type: 'tags/realtimeUpdate',
        payload: tags,
      });
    });

    // Subscribe to pipelines
    const unsubPipelines = firestoreRealtimeService.subscribeToPipelines((pipelines) => {
      dispatch({
        type: 'pipelines/realtimeUpdate',
        payload: pipelines,
      });
    });

    // Cleanup all subscriptions on unmount
    return () => {
      unsubCandidates();
      unsubJobs();
      unsubApplications();
      unsubClients();
      unsubUsers();
      unsubCategories();
      unsubTags();
      unsubPipelines();
    };
  }, [dispatch]);
};
