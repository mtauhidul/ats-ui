// Entity-specific hooks for easy access to Redux state
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { 
  fetchClientById, 
  createClient, 
  updateClient,
  addCommunicationNote,
  deleteClient,
  setCurrentClient,
  setFilters as setClientFilters,
  clearFilters as clearClientFilters,
} from "../slices/clientsSlice";
import type { ClientsState } from "../slices/clientsSlice";
import { useClients as useFirestoreClients } from "@/hooks/firestore";

export const useClients = () => {
  const dispatch = useAppDispatch();
  
  // Get realtime data from Firestore
  const { data: clients, loading: isLoading, error: firestoreError } = useFirestoreClients();
  
  // Keep filters and currentClient from Redux for backward compatibility
  const { currentClient, filters } = useAppSelector(
    (state) => state.clients as ClientsState
  );

  // Fetch functions are now no-ops since Firestore provides realtime data
  const fetchClientsCallback = useCallback(() => Promise.resolve(), []);
  const fetchClientsIfNeededCallback = useCallback(() => Promise.resolve(), []);
  const fetchClientByIdCallback = useCallback((_id: string) => dispatch(fetchClientById(_id)), [dispatch]);
  
  // Write operations still go through Redux/API for validation
  const createClientCallback = useCallback((data: Parameters<typeof createClient>[0]) => 
    dispatch(createClient(data)), [dispatch]);
  const updateClientCallback = useCallback((id: string, data: Parameters<typeof updateClient>[0]["data"]) => 
    dispatch(updateClient({ id, data })), [dispatch]);
  const addCommunicationNoteCallback = useCallback((id: string, note: Parameters<typeof addCommunicationNote>[0]["note"]) => 
    dispatch(addCommunicationNote({ id, note })), [dispatch]);
  const deleteClientCallback = useCallback((id: string) => dispatch(deleteClient(id)), [dispatch]);
  const setCurrentClientCallback = useCallback((client: Parameters<typeof setCurrentClient>[0]) => 
    dispatch(setCurrentClient(client)), [dispatch]);
  const setFiltersCallback = useCallback((filters: Parameters<typeof setClientFilters>[0]) => 
    dispatch(setClientFilters(filters)), [dispatch]);
  const clearFiltersCallback = useCallback(() => dispatch(clearClientFilters()), [dispatch]);
  
  // Cache invalidation is automatic with Firestore realtime
  const invalidateCacheCallback = useCallback(() => Promise.resolve(), []);

  return {
    clients, // Now from Firestore with realtime updates!
    currentClient,
    isLoading,
    error: firestoreError,
    filters,
    fetchClients: fetchClientsCallback,
    fetchClientsIfNeeded: fetchClientsIfNeededCallback,
    fetchClientById: fetchClientByIdCallback,
    createClient: createClientCallback,
    updateClient: updateClientCallback,
    addCommunicationNote: addCommunicationNoteCallback,
    deleteClient: deleteClientCallback,
    setCurrentClient: setCurrentClientCallback,
    setFilters: setFiltersCallback,
    clearFilters: clearFiltersCallback,
    invalidateCache: invalidateCacheCallback,
  };
};
