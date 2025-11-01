// Entity-specific hooks for easy access to Redux state
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { 
  fetchClients,
  fetchClientsIfNeeded,
  fetchClientById, 
  createClient, 
  updateClient, 
  deleteClient,
  setCurrentClient,
  setFilters as setClientFilters,
  clearFilters as clearClientFilters,
  invalidateClientsCache
} from "../slices/clientsSlice";
import type { ClientsState } from "../slices/clientsSlice";

export const useClients = () => {
  const dispatch = useAppDispatch();
  const { clients, currentClient, isLoading, error, filters } = useAppSelector(
    (state) => state.clients as ClientsState
  );

  const fetchClientsCallback = useCallback(() => dispatch(fetchClients()), [dispatch]);
  const fetchClientsIfNeededCallback = useCallback(() => dispatch(fetchClientsIfNeeded()), [dispatch]);
  const fetchClientByIdCallback = useCallback((id: string) => dispatch(fetchClientById(id)), [dispatch]);
  const createClientCallback = useCallback((data: Parameters<typeof createClient>[0]) => 
    dispatch(createClient(data)), [dispatch]);
  const updateClientCallback = useCallback((id: string, data: Parameters<typeof updateClient>[0]["data"]) => 
    dispatch(updateClient({ id, data })), [dispatch]);
  const deleteClientCallback = useCallback((id: string) => dispatch(deleteClient(id)), [dispatch]);
  const setCurrentClientCallback = useCallback((client: Parameters<typeof setCurrentClient>[0]) => 
    dispatch(setCurrentClient(client)), [dispatch]);
  const setFiltersCallback = useCallback((filters: Parameters<typeof setClientFilters>[0]) => 
    dispatch(setClientFilters(filters)), [dispatch]);
  const clearFiltersCallback = useCallback(() => dispatch(clearClientFilters()), [dispatch]);
  const invalidateCacheCallback = useCallback(() => dispatch(invalidateClientsCache()), [dispatch]);

  return {
    clients,
    currentClient,
    isLoading,
    error,
    filters,
    fetchClients: fetchClientsCallback,
    fetchClientsIfNeeded: fetchClientsIfNeededCallback, // New: smart fetch with caching
    fetchClientById: fetchClientByIdCallback,
    createClient: createClientCallback,
    updateClient: updateClientCallback,
    deleteClient: deleteClientCallback,
    setCurrentClient: setCurrentClientCallback,
    setFilters: setFiltersCallback,
    clearFilters: clearFiltersCallback,
    invalidateCache: invalidateCacheCallback, // New: manual cache invalidation
  };
};
