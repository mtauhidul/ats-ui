import type { Client, CreateClientRequest, UpdateClientRequest } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  const response = await fetch(`${API_BASE_URL}/clients`);
  if (!response.ok) throw new Error("Failed to fetch clients");
  const data = await response.json();
  return data;
});

export const fetchClientById = createAsyncThunk(
  "clients/fetchById",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) throw new Error("Failed to fetch client");
    const data = await response.json();
    return data;
  }
);

export const createClient = createAsyncThunk(
  "clients/create",
  async (clientData: CreateClientRequest) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) throw new Error("Failed to create client");
    const data = await response.json();
    toast.success("Client created successfully");
    return data;
  }
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, data }: { id: string; data: UpdateClientRequest }) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update client");
    const result = await response.json();
    toast.success("Client updated successfully");
    return result;
  }
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete client");
    toast.success("Client deleted successfully");
    return id;
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
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((c) => c.id !== action.payload);
        if (state.currentClient?.id === action.payload) {
          state.currentClient = null;
        }
      });
  },
});

export const { setCurrentClient, setFilters, clearFilters } =
  clientsSlice.actions;
export default clientsSlice.reducer;
