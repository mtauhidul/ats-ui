import { useState } from "react";
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
import { ClientDetails } from "@/components/client-details";
import { AddClientModal } from "@/components/modals/add-client-modal";
import type { Client, CommunicationNoteType, CreateClientRequest, ClientStatus } from "@/types/client";
import type { Job, CreateJobRequest, JobStatus, JobType } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import clientsData from "@/lib/mock-data/clients.json";
import jobsData from "@/lib/mock-data/jobs.json";
import candidatesData from "@/lib/mock-data/candidates.json";
import { toast } from "sonner";

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Transform JSON data to match Client type
  const [clients, setClients] = useState<Client[]>(
    clientsData.map((client) => ({
      ...client,
      industry: client.industry as Client["industry"],
      companySize: client.companySize as Client["companySize"],
      status: client.status as ClientStatus,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
      communicationNotes: client.communicationNotes?.map((note) => ({
        ...note,
        type: note.type as CommunicationNoteType,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      })),
      activityHistory: client.activityHistory?.map((activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      })),
    }))
  );

  // Transform jobs data
  const [jobs, setJobs] = useState<Job[]>(
    jobsData.map((job) => ({
      ...job,
      status: job.status as JobStatus,
      type: job.type as JobType,
      experienceLevel: job.experienceLevel as Job["experienceLevel"],
      workMode: job.workMode as Job["workMode"],
      priority: job.priority as Job["priority"],
      salaryRange: job.salaryRange ? {
        ...job.salaryRange,
        period: job.salaryRange.period as "yearly" | "hourly" | "daily" | "monthly",
      } : undefined,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    }))
  );

  // Transform candidates data
  const [candidates] = useState<Candidate[]>(
    candidatesData.map((candidate) => ({
      ...candidate,
      source: candidate.source as Candidate["source"],
      createdAt: new Date(candidate.createdAt),
      updatedAt: new Date(candidate.updatedAt),
      education: candidate.education.map((edu) => ({
        ...edu,
        level: edu.level as Candidate["education"][0]["level"],
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      })),
      skills: candidate.skills.map((skill) => ({
        ...skill,
        level: skill.level as "beginner" | "intermediate" | "advanced" | "expert",
      })),
      languages: candidate.languages.map((lang) => ({
        ...lang,
        proficiency: lang.proficiency as "basic" | "conversational" | "fluent" | "native",
      })),
      jobApplications: candidate.jobApplications.map((app) => {
        const appWithEmail = app as typeof app & { lastEmailDate?: string };
        return {
          ...app,
          status: app.status as Candidate["jobApplications"][0]["status"],
          appliedAt: new Date(app.appliedAt),
          lastStatusChange: new Date(app.lastStatusChange),
          lastEmailDate: appWithEmail.lastEmailDate ? new Date(appWithEmail.lastEmailDate) : undefined,
        };
      }),
      lastEmailDate: (candidate as typeof candidate & { lastEmailDate?: string }).lastEmailDate 
        ? new Date((candidate as typeof candidate & { lastEmailDate?: string }).lastEmailDate!) 
        : undefined,
      workExperience: [],
      categoryIds: candidate.categoryIds || [],
      tagIds: candidate.tagIds || [],
      isActive: candidate.isActive ?? true,
    }))
  );

  // Helper function to add activity to client's activity history
  const addActivityToClient = (
    clientId: string,
    action: string,
    description: string,
    metadata?: Record<string, unknown>
  ) => {
    const newActivity = {
      id: `activity-${Date.now()}-${Math.random()}`,
      clientId,
      action,
      description,
      performedBy: "current-user-id", // TODO: Replace with actual user ID from auth context
      performedByName: "Current User", // TODO: Replace with actual user name from auth context
      timestamp: new Date(),
      metadata,
    };

    setClients(clients.map(c => 
      c.id === clientId 
        ? { 
            ...c, 
            activityHistory: [newActivity, ...(c.activityHistory || [])],
            updatedAt: new Date()
          }
        : c
    ));

    if (selectedClient?.id === clientId) {
      setSelectedClient({
        ...selectedClient,
        activityHistory: [newActivity, ...(selectedClient.activityHistory || [])],
        updatedAt: new Date()
      });
    }
  };

  const handleAddClient = (data: CreateClientRequest) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      ...data,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.companyName)}&background=3b82f6&color=fff`,
      status: "active" as ClientStatus,
      statistics: {
        totalJobs: 0,
        activeJobs: 0,
        closedJobs: 0,
        draftJobs: 0,
        totalCandidates: 0,
        activeCandidates: 0,
        hiredCandidates: 0,
        rejectedCandidates: 0,
        averageTimeToHire: 0,
        successRate: 0,
      },
      jobIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      contacts: data.contacts.map((c, i) => ({
        ...c,
        id: `contact-${Date.now()}-${i}`,
      })),
      activityHistory: [{
        id: `activity-${Date.now()}`,
        clientId: `client-${Date.now()}`,
        action: "client_created",
        description: `Client "${data.companyName}" was created`,
        performedBy: "current-user-id",
        performedByName: "Current User",
        timestamp: new Date(),
        metadata: { companyName: data.companyName, industry: data.industry },
      }],
    };

    setClients([newClient, ...clients]);
    toast.success("Client created successfully");
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    
    // Check if client has active jobs
    if (client && client.statistics.activeJobs > 0) {
      toast.error(
        `Cannot delete client "${client.companyName}". This client has ${client.statistics.activeJobs} active job${client.statistics.activeJobs > 1 ? 's' : ''}. Please close or reassign all active jobs before deleting.`,
        { duration: 5000 }
      );
      return;
    }
    
    // If client can be deleted, show confirmation dialog
    if (client) {
      setClientToDelete(client);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDeleteClient = () => {
    if (!clientToDelete) return;
    
    setClients(clients.filter(c => c.id !== clientToDelete.id));
    toast.success("Client deleted successfully");
    if (selectedClient?.id === clientToDelete.id) {
      setSelectedClient(null);
    }
    
    setDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
    const client = clients.find(c => c.id === clientId);
    const changedFields = Object.keys(updates).filter(key => 
      key !== 'updatedAt' && key !== 'activityHistory'
    );
    
    setClients(clients.map(c => 
      c.id === clientId 
        ? { ...c, ...updates, updatedAt: new Date() }
        : c
    ));
    
    if (selectedClient?.id === clientId) {
      setSelectedClient({ ...selectedClient, ...updates, updatedAt: new Date() });
    }
    
    // Track update activity
    if (client && changedFields.length > 0) {
      addActivityToClient(
        clientId,
        "client_updated",
        `Client information was updated (${changedFields.join(', ')})`,
        { updatedFields: changedFields, changes: updates }
      );
    }
    
    toast.success("Client updated successfully");
  };

  const handleAddJob = (data: CreateJobRequest) => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      ...data,
      status: "draft",
      filledPositions: 0,
      candidateIds: [], // This is correct - Jobs should have candidateIds
      statistics: {
        totalApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalCandidates: 0,
        activeCandidates: 0,
        hiredCandidates: 0,
        rejectedCandidates: 0,
        interviewingCandidates: 0,
        offerExtendedCandidates: 0,
        candidatesInPipeline: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setJobs([newJob, ...jobs]);

    // Update client statistics
    if (selectedClient) {
      const updatedStats = {
        ...selectedClient.statistics,
        totalJobs: selectedClient.statistics.totalJobs + 1,
        draftJobs: selectedClient.statistics.draftJobs + 1,
      };
      
      handleUpdateClient(selectedClient.id, { 
        statistics: updatedStats,
        jobIds: [...selectedClient.jobIds, newJob.id]
      });

      // Add activity
      addActivityToClient(
        selectedClient.id,
        "job_created",
        `New job "${data.title}" was created`,
        { jobTitle: data.title, jobId: newJob.id }
      );
    }
  };

  // Filter clients based on search
  const filteredClients = clients
    .filter((client) => {
      // Search filter
      const matchesSearch =
        client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.address.city.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;

      // Industry filter
      const matchesIndustry = industryFilter === "all" || client.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.companyName.localeCompare(b.companyName);
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "jobs":
          return b.statistics.totalJobs - a.statistics.totalJobs;
        case "candidates":
          return b.statistics.totalCandidates - a.statistics.totalCandidates;
        default:
          return 0;
      }
    });

  if (selectedClient) {
    return (
      <div className="flex flex-1 flex-col">
        <ClientDetails
          client={selectedClient}
          jobs={jobs}
          candidates={candidates}
          onBack={() => setSelectedClient(null)}
          onUpdate={handleUpdateClient}
          onDelete={handleDeleteClient}
          onAddJob={handleAddJob}
        />
      </div>
    );
  }

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
                <Button onClick={() => setIsAddClientOpen(true)}>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
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
                <Select value={sortBy} onValueChange={setSortBy}>
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
                  <p className="text-xl font-bold">{clients.length}</p>
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
                    {clients.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">
                    {clients.length > 0 ? Math.round((clients.filter((c) => c.status === "active").length / clients.length) * 100) : 0}% of total
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
                    {clients.reduce((acc, c) => acc + c.statistics.totalJobs, 0)}
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
                    {clients.reduce((acc, c) => acc + c.statistics.activeJobs, 0)}
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
                  onClick={() => setSelectedClient(client)}
                />
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No clients found matching your search"
                    : "No clients yet. Add your first client to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddClientModal
        open={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
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