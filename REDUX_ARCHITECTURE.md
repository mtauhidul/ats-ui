# Redux Architecture Documentation

## Overview

This ATS application uses **Redux Toolkit** for centralized state management with real-time user feedback through toast notifications. The Redux architecture follows modern best practices with TypeScript for type safety.

## 📁 Directory Structure

```
src/store/
├── index.ts                 # Store configuration and setup
├── hooks.ts                 # Base Redux hooks (useAppDispatch, useAppSelector)
├── api/
│   └── apiSlice.ts          # RTK Query API slice configuration
├── slices/
│   ├── authSlice.ts         # Authentication state
│   ├── uiSlice.ts           # UI state (modals, loading, filters, pagination)
│   ├── clientsSlice.ts      # Clients CRUD operations
│   ├── jobsSlice.ts         # Jobs CRUD operations
│   ├── candidatesSlice.ts   # Candidates CRUD operations
│   ├── applicationsSlice.ts # Applications CRUD operations
│   ├── emailsSlice.ts       # Email communications
│   ├── categoriesSlice.ts   # Categories management
│   ├── tagsSlice.ts         # Tags management
│   ├── pipelinesSlice.ts    # Pipeline templates
│   ├── interviewsSlice.ts   # Interview scheduling
│   ├── teamSlice.ts         # Team members
│   └── usersSlice.ts        # User management
├── hooks/
│   ├── index.ts             # Export all custom hooks
│   ├── useClients.ts        # Client-specific hooks
│   ├── useJobs.ts           # Job-specific hooks
│   ├── useCandidates.ts     # Candidate-specific hooks
│   ├── useApplications.ts   # Application-specific hooks
│   └── useUI.ts             # UI state hooks
├── selectors/
│   ├── index.ts             # Export all selectors
│   ├── clientSelectors.ts   # Memoized client selectors
│   ├── jobSelectors.ts      # Memoized job selectors
│   ├── candidateSelectors.ts# Memoized candidate selectors
│   └── applicationSelectors.ts # Memoized application selectors
└── middleware/
    └── toastMiddleware.ts   # Toast notifications middleware
```

## 🏗️ State Structure

```typescript
{
  auth: {
    user: UserProfile | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  ui: {
    modals: { ... },
    isLoading: { ... },
    filters: { ... },
    pagination: { ... },
    selectedItems: { ... },
    sidebarCollapsed: boolean
  },
  clients: {
    clients: Client[],
    currentClient: Client | null,
    isLoading: boolean,
    error: string | null,
    filters: { ... }
  },
  jobs: {
    jobs: Job[],
    currentJob: Job | null,
    isLoading: boolean,
    error: string | null
  },
  candidates: {
    candidates: Candidate[],
    currentCandidate: Candidate | null,
    isLoading: boolean,
    error: string | null
  },
  applications: {
    applications: Application[],
    currentApplication: Application | null,
    isLoading: boolean,
    error: string | null
  },
  emails: { ... },
  categories: { ... },
  tags: { ... },
  pipelines: { ... },
  interviews: { ... },
  team: { ... },
  users: { ... }
}
```

## 🎯 Usage Patterns

### 1. Using Entity Hooks (Recommended)

Entity hooks provide a clean API for interacting with Redux state:

```typescript
import { useClients } from "@/store/hooks";

function ClientsPage() {
  const {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useClients();

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (data) => {
    await createClient(data);
    // Toast notification shown automatically ✅
  };

  return (
    <div>
      {isLoading && <Spinner />}
      {clients.map(client => <ClientCard key={client.id} {...client} />)}
    </div>
  );
}
```

### 2. Using Base Hooks

For direct access to state and dispatch:

```typescript
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchJobs } from "@/store/slices/jobsSlice";

function JobsList() {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.jobs.jobs);
  const isLoading = useAppSelector((state) => state.jobs.isLoading);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return <div>{/* ... */}</div>;
}
```

### 3. Using Selectors

Memoized selectors for derived/filtered data:

```typescript
import { useAppSelector } from "@/store/hooks";
import { selectFilteredClients, selectClientStatistics } from "@/store/selectors";

function ClientDashboard() {
  const filteredClients = useAppSelector(selectFilteredClients);
  const stats = useAppSelector(selectClientStatistics);

  return (
    <div>
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Active" value={stats.active} />
      {filteredClients.map(client => <ClientCard {...client} />)}
    </div>
  );
}
```

### 4. UI State Management

```typescript
import { useUI } from "@/store/hooks";

function AddClientButton() {
  const { modals, openModal, closeModal } = useUI();

  return (
    <>
      <Button onClick={() => openModal("addClient")}>
        Add Client
      </Button>
      <AddClientModal 
        open={modals.addClient}
        onClose={() => closeModal("addClient")}
      />
    </>
  );
}
```

### 5. Filters and Pagination

```typescript
import { useClients, useUI } from "@/store/hooks";

function ClientsTable() {
  const { clients, filters, setFilters } = useClients();
  const { pagination, setPagination } = useUI();

  const handleSearch = (query: string) => {
    setFilters({ search: query });
  };

  const handlePageChange = (page: number) => {
    setPagination("clients", page);
  };

  return (
    <div>
      <SearchInput onChange={handleSearch} value={filters.search} />
      <Table data={clients} />
      <Pagination 
        page={pagination.clients.page}
        onChange={handlePageChange}
      />
    </div>
  );
}
```

## 🔔 Toast Notifications

Toast notifications are **automatically** shown for all CRUD operations through middleware:

### Automatic Toasts

- ✅ **Success**: "Client created successfully", "Job updated successfully"
- ❌ **Error**: Shows error message from API or generic error
- 📝 Description: Additional context provided automatically

### Manual Toasts

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation completed", {
  description: "Your changes have been saved.",
});

// Error
toast.error("Operation failed", {
  description: "Please try again.",
});

// Info
toast.info("Note", {
  description: "Additional information.",
});

// Warning
toast.warning("Warning", {
  description: "Be careful!",
});
```

## 🔄 Async Operations

All async operations use `createAsyncThunk`:

```typescript
// In slice file
export const fetchClients = createAsyncThunk(
  "clients/fetchAll",
  async () => {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error("Failed to fetch clients");
    return response.json();
  }
);

// States handled automatically:
// - clients/fetchAll/pending → isLoading = true
// - clients/fetchAll/fulfilled → update state, isLoading = false
// - clients/fetchAll/rejected → set error, isLoading = false
```

## 🎨 Best Practices

### 1. Use Entity Hooks

✅ **Do:**
```typescript
const { clients, createClient } = useClients();
```

❌ **Don't:**
```typescript
const dispatch = useAppDispatch();
const clients = useAppSelector(state => state.clients.clients);
dispatch(createClient(data));
```

### 2. Use Selectors for Derived Data

✅ **Do:**
```typescript
const activeClients = useAppSelector(selectActiveClients);
```

❌ **Don't:**
```typescript
const clients = useAppSelector(state => state.clients.clients);
const activeClients = clients.filter(c => c.status === "active");
```

### 3. Handle Loading States

✅ **Do:**
```typescript
const { clients, isLoading } = useClients();

if (isLoading) return <Spinner />;
return <ClientsList clients={clients} />;
```

### 4. Error Handling

```typescript
const { error, fetchClients } = useClients();

useEffect(() => {
  fetchClients().catch(() => {
    // Error already shown via toast
    // Optional: additional error handling
  });
}, []);

{error && <ErrorBanner message={error} />}
```

### 5. Optimistic Updates

```typescript
const handleUpdate = async (id: string, data: Partial<Client>) => {
  // Optimistic update
  const originalClient = currentClient;
  setCurrentClient({ ...currentClient, ...data });
  
  try {
    await updateClient(id, data);
  } catch (error) {
    // Revert on error
    setCurrentClient(originalClient);
  }
};
```

## 🔌 API Integration

### Current Setup (JSON Server)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

### Switching to Real Backend

1. Update `VITE_API_URL` in `.env`:
```
VITE_API_URL=https://api.yourdomain.com
```

2. Add authentication headers in `apiSlice.ts`:
```typescript
prepareHeaders: (headers) => {
  const token = localStorage.getItem("token");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
}
```

## 🧪 Testing

### Testing Components with Redux

```typescript
import { Provider } from "react-redux";
import { store } from "@/store";

test("renders client list", () => {
  render(
    <Provider store={store}>
      <ClientsList />
    </Provider>
  );
  // assertions
});
```

### Testing with Mock Store

```typescript
import { configureStore } from "@reduxjs/toolkit";
import clientsReducer from "@/store/slices/clientsSlice";

const mockStore = configureStore({
  reducer: {
    clients: clientsReducer,
  },
  preloadedState: {
    clients: {
      clients: mockClients,
      isLoading: false,
      error: null,
    },
  },
});
```

## 📊 Performance Optimization

### 1. Memoized Selectors

Selectors use `createSelector` from Reselect for memoization:

```typescript
export const selectFilteredClients = createSelector(
  [selectClients, selectClientFilters],
  (clients, filters) => {
    // Expensive filtering logic
    // Only re-runs when inputs change
    return clients.filter(/* ... */);
  }
);
```

### 2. Normalized State

Consider normalizing state for large datasets:

```typescript
// Instead of:
clients: Client[]

// Use:
clients: {
  byId: Record<string, Client>,
  allIds: string[]
}
```

### 3. Lazy Loading

Load data only when needed:

```typescript
useEffect(() => {
  if (clients.length === 0) {
    fetchClients();
  }
}, [clients.length]);
```

## 🔐 Security

### 1. Sensitive Data

Never store sensitive data in Redux that shouldn't be in memory:
- ❌ Don't store: Passwords, credit cards, SSNs
- ✅ Do store: User profile, JWT tokens, app state

### 2. Token Management

```typescript
// Store token in Redux for API calls
// Also persist to localStorage/sessionStorage
setCredentials({ user, token });
localStorage.setItem("token", token);
```

## 📝 Migration Guide

### Converting Existing Component

**Before:**
```typescript
function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClientsAPI().then(setClients);
  }, []);

  return /* ... */;
}
```

**After:**
```typescript
function ClientsPage() {
  const { clients, isLoading, fetchClients } = useClients();

  useEffect(() => {
    fetchClients();
  }, []);

  return /* ... */;
}
```

## 🐛 Troubleshooting

### 1. State Not Updating

- Check if reducer is handling the action
- Verify action is being dispatched
- Use Redux DevTools to inspect state changes

### 2. TypeScript Errors

- Ensure all slices export default reducer
- Check RootState and AppDispatch types
- Restart TypeScript language server

### 3. Infinite Loops

```typescript
// ❌ Wrong: Missing dependency
useEffect(() => {
  fetchClients();
}, []);

// ✅ Correct: Include all dependencies
useEffect(() => {
  fetchClients();
}, [fetchClients]);

// ✅ Better: Wrap in useCallback
const loadClients = useCallback(() => {
  dispatch(fetchClients());
}, [dispatch]);

useEffect(() => {
  loadClients();
}, [loadClients]);
```

## 🚀 Next Steps

1. **Add Redux Persist** for state persistence across sessions
2. **Implement RTK Query** for advanced caching and data fetching
3. **Add Websockets** for real-time updates
4. **Implement Undo/Redo** functionality
5. **Add State Snapshots** for debugging

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

---

**Note**: This architecture is designed to scale with your application. Start simple and add complexity as needed.
