import type { Client, CreateClientRequest, UpdateClientRequest } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { API_BASE_URL } from "@/config/api";

export interface ClientsState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp when data was last fetched
  cacheValid: boolean; // Whether cache is still valid
  filters: {
    search: string;
    status: string;
    industry: string;
    sortBy: string;
  };
}

const initialState: ClientsState = {
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  cacheValid: false,
  filters: {
    search: "",
    status: "all",
    industry: "all",
    sortBy: "name",
  },
};

// Cache configuration - clients rarely change, so longer cache
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to check if cache is still valid
const isCacheValid = (lastFetched: number | null): boolean => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

// Async thunks
export const fetchClients = createAsyncThunk("clients/fetchAll", async () => {
  console.log('📡 Fetching fresh clients from API');
  const response = await authenticatedFetch(`${API_BASE_URL}/clients`);
  if (!response.ok) throw new Error("Failed to fetch clients");
  const result = await response.json();
  return result.data?.clients || result.data || result;
});

// Smart fetch - only fetches if cache is stale
export const fetchClientsIfNeeded = createAsyncThunk(
  "clients/fetchIfNeeded",
  async (_, { getState, dispatch }) => {
    const state = getState() as { clients: ClientsState };
    const { lastFetched, cacheValid, clients } = state.clients;
    
    // If cache is valid and we have data, skip fetch
    if (cacheValid && isCacheValid(lastFetched) && clients.length > 0) {
      console.log('✅ Using cached clients (age: ' + Math.round((Date.now() - (lastFetched || 0)) / 1000) + 's)');
      return null;
    }
    
    // Cache is stale or invalid, fetch fresh data
    console.log('🔄 Cache stale or invalid, fetching clients...');
    return dispatch(fetchClients()).then((result) => result.payload);
  }
);

export const fetchClientById = createAsyncThunk(
  "clients/fetchById",
  async (id: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) throw new Error("Failed to fetch client");
    const result = await response.json();
    return result.data || result;
  }
);

export const createClient = createAsyncThunk(
  "clients/create",
  async (clientData: CreateClientRequest, { rejectWithValue }) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to create client";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }
      
      const result = await response.json();
      toast.success("Client created successfully");
      return result.data || result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create client";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, data }: { id: string; data: UpdateClientRequest }) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update client");
    const result = await response.json();
    toast.success("Client updated successfully");
    return result.data || result;
  }
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to delete client";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      await response.json();
      toast.success("Client deleted successfully");
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete client";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setCurrentClient: (state, action: PayloadAction<Client | null>) => {
      state.currentClient = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ClientsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    // Invalidate cache - force refetch on next access
    invalidateClientsCache: (state) => {
      state.cacheValid = false;
      state.lastFetched = null;
      console.log('🔄 Clients cache invalidated');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all clients
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload;
        state.lastFetched = Date.now(); // Update cache timestamp
        state.cacheValid = true; // Mark cache as valid
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch clients";
        state.cacheValid = false; // Invalidate on error
      })
      // Fetch clients if needed (smart fetch)
      .addCase(fetchClientsIfNeeded.pending, (state) => {
        // Only show loading if we're actually fetching (not using cache)
        if (!state.cacheValid || !isCacheValid(state.lastFetched)) {
          state.isLoading = true;
        }
      })
      .addCase(fetchClientsIfNeeded.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only update if we got fresh data (not null from cache)
        if (action.payload && Array.isArray(action.payload)) {
          state.clients = action.payload;
          state.lastFetched = Date.now();
          state.cacheValid = true;
        }
      })
      .addCase(fetchClientsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch clients";
        state.cacheValid = false;
      })
      // Fetch client by ID
      .addCase(fetchClientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch client";
      })
      // Create client
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload);
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      // Update client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?.id === action.payload.id) {
          state.currentClient = action.payload;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      // Delete client
      .addCase(deleteClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = state.clients.filter((c) => c.id !== action.payload);
        if (state.currentClient?.id === action.payload) {
          state.currentClient = null;
        }
        state.lastFetched = Date.now(); // Keep cache fresh
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "Failed to delete client";
      });
  },
});

export const { setCurrentClient, setFilters, clearFilters, invalidateClientsCache } =
  clientsSlice.actions;
export default clientsSlice.reducer;
