import type { Client, CreateClientRequest, UpdateClientRequest } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface ClientsState {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
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
  filters: {
    search: "",
    status: "all",
    industry: "all",
    sortBy: "name",
  },
};

// Async thunks
export const fetchClients = createAsyncThunk("clients/fetchAll", async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/clients`);
  if (!response.ok) throw new Error("Failed to fetch clients");
  const result = await response.json();
  return result.data?.clients || result.data || result;
});

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
  async (clientData: CreateClientRequest) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/clients`, {
      method: "POST",
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error("Failed to create client");
    const result = await response.json();
    toast.success("Client created successfully");
    return result.data || result;
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
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch clients";
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
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "Failed to delete client";
      });
  },
});

export const { setCurrentClient, setFilters, clearFilters } =
  clientsSlice.actions;
export default clientsSlice.reducer;
