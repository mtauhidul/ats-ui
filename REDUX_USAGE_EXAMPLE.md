# Redux Implementation Example

This file demonstrates how to convert an existing component to use Redux.

## Example: Converting ClientsPage to use Redux

### Before (Local State)

```typescript
import { useState } from "react";
import clientsData from "@/lib/mock-data/clients.json";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  
  const handleAddClient = (data: CreateClientRequest) => {
    const newClient = { ...data, id: `client-${Date.now()}` };
    setClients([newClient, ...clients]);
    toast.success("Client created successfully");
  };

  const filteredClients = clients.filter(client =>
    client.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <Button onClick={() => setIsAddClientOpen(true)}>Add Client</Button>
      <ClientsList clients={filteredClients} />
      <AddClientModal 
        open={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSubmit={handleAddClient}
      />
    </div>
  );
}
```

### After (Redux)

```typescript
import { useEffect } from "react";
import { useClients, useUI } from "@/store/hooks";
import { useAppSelector } from "@/store/hooks";
import { selectFilteredClients } from "@/store/selectors";

export default function ClientsPage() {
  // Get data and actions from Redux
  const { 
    isLoading, 
    error,
    fetchClients,
    createClient,
    setFilters,
    filters 
  } = useClients();
  
  const { modals, openModal, closeModal } = useUI();
  
  // Use memoized selector for filtered data
  const filteredClients = useAppSelector(selectFilteredClients);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = async (data: CreateClientRequest) => {
    await createClient(data);
    // Toast shown automatically by middleware ✅
    closeModal("addClient");
  };

  const handleSearch = (query: string) => {
    setFilters({ search: query });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <SearchInput 
        value={filters.search} 
        onChange={handleSearch} 
      />
      <Button onClick={() => openModal("addClient")}>
        Add Client
      </Button>
      <ClientsList clients={filteredClients} />
      <AddClientModal 
        open={modals.addClient}
        onClose={() => closeModal("addClient")}
        onSubmit={handleAddClient}
      />
    </div>
  );
}
```

## Benefits of Redux Approach

1. **Centralized State**: All client data accessible across the app
2. **Automatic Loading States**: No need to manage `isLoading` manually
3. **Automatic Error Handling**: Errors captured and displayed
4. **Automatic Toast Notifications**: Success/error toasts shown automatically
5. **Memoized Filtering**: `selectFilteredClients` only recalculates when needed
6. **Type Safety**: Full TypeScript support
7. **DevTools**: Redux DevTools for debugging
8. **Testability**: Easy to test with mock store

## Quick Migration Checklist

- [ ] Import custom hooks instead of useState
- [ ] Remove local state management
- [ ] Use `fetchEntity()` in useEffect
- [ ] Replace manual toast calls (they're automatic now!)
- [ ] Use UI slice for modals/loading
- [ ] Use selectors for filtered/derived data
- [ ] Handle loading and error states from Redux

## Common Patterns

### Pattern 1: Fetch and Display

```typescript
function ClientsList() {
  const { clients, isLoading, fetchClients } = useClients();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (isLoading) return <Spinner />;

  return <div>{clients.map(client => <ClientCard {...client} />)}</div>;
}
```

### Pattern 2: Create with Modal

```typescript
function AddClientButton() {
  const { createClient } = useClients();
  const { modals, openModal, closeModal } = useUI();

  const handleSubmit = async (data) => {
    await createClient(data);
    closeModal("addClient");
    // Navigate or refresh if needed
  };

  return (
    <>
      <Button onClick={() => openModal("addClient")}>Add</Button>
      <Modal 
        open={modals.addClient} 
        onClose={() => closeModal("addClient")}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

### Pattern 3: Update

```typescript
function EditClientForm({ clientId }) {
  const { currentClient, updateClient, fetchClientById } = useClients();

  useEffect(() => {
    fetchClientById(clientId);
  }, [clientId]);

  const handleSubmit = async (data) => {
    await updateClient(clientId, data);
    // Toast shown automatically ✅
  };

  return <Form initialData={currentClient} onSubmit={handleSubmit} />;
}
```

### Pattern 4: Delete

```typescript
function DeleteClientButton({ clientId }) {
  const { deleteClient } = useClients();

  const handleDelete = async () => {
    if (confirm("Are you sure?")) {
      await deleteClient(clientId);
      // Toast shown automatically ✅
    }
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

### Pattern 5: Filters

```typescript
function ClientFilters() {
  const { filters, setFilters, clearFilters } = useClients();

  return (
    <div>
      <Input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <Select
        value={filters.status}
        onChange={(value) => setFilters({ status: value })}
      />
      <Button onClick={clearFilters}>Clear</Button>
    </div>
  );
}
```

## Next Steps

1. Start converting pages one at a time
2. Begin with simple read-only pages
3. Then add create/update functionality
4. Finally implement complex interactions
5. Test thoroughly after each conversion

Happy coding! 🚀
