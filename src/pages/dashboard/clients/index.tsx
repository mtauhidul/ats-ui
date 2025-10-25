import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Building2, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientCard } from "@/components/client-card";
import { AddClientModal } from "@/components/modals/add-client-modal";
import type { Client, CreateClientRequest } from "@/types/client";
import { useClients, useUI, useAppSelector } from "@/store/hooks/index";
import { selectFilteredClients } from "@/store/selectors";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Redux state and actions
  const {
    filters,
    fetchClients,
    createClient,
    deleteClient,
    setFilters,
  } = useClients();
  
  const { modals, openModal, closeModal } = useUI();
  
  // Use memoized selector for filtered clients
  const filteredClients = useAppSelector(selectFilteredClients);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClient = async (data: CreateClientRequest) => {
    await createClient(data);
    closeModal("addClient");
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    await deleteClient(clientToDelete.id);
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Clients
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your client companies and their hiring processes
                  </p>
                </div>
                <Button onClick={() => openModal("addClient")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients by name, email, industry, or location..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.industry} onValueChange={(value) => setFilters({ industry: value })}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ sortBy: value })}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="jobs">Most Jobs</SelectItem>
                    <SelectItem value="candidates">Most Candidates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                  </div>
                  <p className="text-xl font-bold">{filteredClients.length}</p>
                  <p className="text-xs text-muted-foreground">Clients</p>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-green-500/10 p-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Active</span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {filteredClients.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">
                    {filteredClients.length > 0 ? Math.round((filteredClients.filter((c) => c.status === "active").length / filteredClients.length) * 100) : 0}% of total
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-blue-500/10 p-1.5">
                      <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Total Jobs</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredClients.reduce((acc, c) => acc + c.statistics.totalJobs, 0)}
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    Across all clients
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="rounded-md bg-purple-500/10 p-1.5">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Active Jobs</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {filteredClients.reduce((acc, c) => acc + c.statistics.activeJobs, 0)}
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                    Currently open
                  </p>
                </div>
              </div>
            </div>

            {/* Client Cards Grid */}
            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                />
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {filters.search
                    ? "No clients found matching your search"
                    : "No clients yet. Add your first client to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

            {/* Add Client Modal */}
      <AddClientModal
        open={modals.addClient}
        onClose={() => closeModal("addClient")}
        onSubmit={handleAddClient}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              {clientToDelete && (
                <>
                  Are you sure you want to delete <strong>{clientToDelete.companyName}</strong>?
                  {clientToDelete.statistics.totalJobs > 0 && (
                    <span className="block mt-2 text-amber-600 dark:text-amber-500">
                      This client has {clientToDelete.statistics.totalJobs} job{clientToDelete.statistics.totalJobs > 1 ? 's' : ''} in the system.
                    </span>
                  )}
                  <span className="block mt-2">
                    This action cannot be undone.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}