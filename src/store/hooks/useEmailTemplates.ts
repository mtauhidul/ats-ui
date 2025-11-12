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
    dispatch(setLoading(true));
    
    const unsubscribe = firestoreRealtimeService.subscribeToEmailTemplates((templatesData) => {
      dispatch(setEmailTemplates(templatesData));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return {
    templates,
    isLoading,
    error,
  };
};
