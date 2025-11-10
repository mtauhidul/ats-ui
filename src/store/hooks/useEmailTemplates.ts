import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setEmailTemplates, setLoading } from "../slices/emailTemplatesSlice";
import { firestoreRealtimeService } from "@/services/firestore-realtime.service";

export const useEmailTemplates = () => {
  const dispatch = useAppDispatch();
  const { templates, isLoading, error } = useAppSelector(
    (state) => state.emailTemplates
  );

  // Subscribe to Firestore real-time updates
  useEffect(() => {
    console.log('🔥 Setting up Firestore real-time subscription for email templates');
    dispatch(setLoading(true));
    
    const unsubscribe = firestoreRealtimeService.subscribeToEmailTemplates((templatesData) => {
      console.log('📧 Received email templates from Firestore:', templatesData.length);
      dispatch(setEmailTemplates(templatesData));
    });

    return () => {
      console.log('🔥 Cleaning up email templates Firestore subscription');
      unsubscribe();
    };
  }, [dispatch]);

  return {
    templates,
    isLoading,
    error,
  };
};
