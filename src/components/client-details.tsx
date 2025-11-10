import { JobCard } from "@/components/job-card";
import { AddCommunicationNoteModal } from "@/components/modals/add-communication-note-modal";
import { AddContactModal } from "@/components/modals/add-contact-modal";
import { AddJobModal } from "@/components/modals/add-job-modal";
import { EditClientModal } from "@/components/modals/edit-client-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import type { Candidate } from "@/types/candidate";
import type {
  Client,
  ClientActivityHistory,
  CommunicationNote,
  ContactPerson,
  CreateCommunicationNoteRequest,
  CreateContactRequest,
} from "@/types/client";
import type { CreateJobRequest, Job } from "@/types/job";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  FileEdit,
  FolderOpen,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  ThumbsUp,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClientDetailsProps {
  client: Client;
  jobs: Job[];
  candidates: Candidate[];
  onBack: () => void;
  onUpdate: (clientId: string, updates: Partial<Client>) => void;
  onDelete: (clientId: string) => void;
  onAddJob?: (job: CreateJobRequest) => void;
  onJobClick?: (jobId: string) => void;
  onAddCommunicationNote?: (
    clientId: string,
    note: { type: string; subject: string; content: string }
  ) => void;
}

const statusColors = {
  active:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  inactive:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  pending:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  on_hold:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
} as const;

const industryColors = {
  technology:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  healthcare:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  finance:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  education:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  retail: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  manufacturing:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  consulting:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  real_estate:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  hospitality:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
} as const;

export function ClientDetails({
  client,
  jobs,
  candidates,
  onBack,
  onUpdate,
  onDelete,
  onAddJob,
  onJobClick,
  onAddCommunicationNote,
}: ClientDetailsProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState("");

  // Helper to convert Firestore Timestamp or any date value to Date object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toDateObject = (dateValue: any): Date => {
    if (!dateValue) return new Date();

    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue === "object" && "seconds" in dateValue) {
      return new Date(dateValue.seconds * 1000);
    }

    // Handle string or Date
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Ensure contacts and communicationNotes are always arrays
  // Handle both array format and object format (Firestore sometimes returns objects with numeric keys)
  const contacts: ContactPerson[] = Array.isArray(client.contacts)
    ? client.contacts
    : client.contacts && typeof client.contacts === "object"
    ? (Object.values(client.contacts) as ContactPerson[])
    : [];

  const communicationNotes: CommunicationNote[] = Array.isArray(
    client.communicationNotes
  )
    ? client.communicationNotes
    : client.communicationNotes && typeof client.communicationNotes === "object"
    ? (Object.values(client.communicationNotes) as CommunicationNote[])
    : [];

  const activityHistory: ClientActivityHistory[] = Array.isArray(
    client.activityHistory
  )
    ? client.activityHistory
    : client.activityHistory && typeof client.activityHistory === "object"
    ? (Object.values(client.activityHistory) as ClientActivityHistory[])
    : [];

  const tags: string[] = Array.isArray(client.tags) ? client.tags : [];

  // Ensure statistics has default values
  const statistics = client.statistics || {
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    draftJobs: 0,
    totalCandidates: 0,
    activeCandidates: 0,
    hiredCandidates: 0,
    rejectedCandidates: 0,
    successRate: 0,
  };

  const primaryContact = contacts.find((c) => c.isPrimary);

  // Filter jobs for this client
  const clientJobs = jobs.filter((job) => job.clientId === client.id);

  // Calculate real-time candidate counts for each job
  const jobCandidateCounts = new Map<
    string,
    { total: number; active: number; hired: number }
  >();

  candidates.forEach((candidate) => {
    const jobIds = candidate.jobIds || [];

    jobIds.forEach((jobId: string) => {
      if (!jobCandidateCounts.has(jobId)) {
        jobCandidateCounts.set(jobId, { total: 0, active: 0, hired: 0 });
      }

      const count = jobCandidateCounts.get(jobId)!;
      count.total++;

      if (candidate.status === "hired") {
        count.hired++;
      } else if (
        candidate.status === "active" ||
        candidate.status === "interviewing" ||
        candidate.status === "offered"
      ) {
        count.active++;
      }
    });
  });

  // Get all clients for the job modal (just this one client since we're in client context)
  const clientsList = [client];

  // Handle add job
  const handleAddJob = (data: CreateJobRequest) => {
    if (onAddJob) {
      onAddJob(data);
      toast.success("Job created successfully");
    }
  };

  const handleAddContact = (data: CreateContactRequest) => {
    const newContact: ContactPerson = {
      ...data,
      id: `contact-${Date.now()}`,
    };

    // Create activity for adding contact
    const newActivity = {
      id: `activity-${Date.now()}`,
      clientId: client.id,
      action: "contact_added",
      description: `New contact "${data.name}" (${data.position}) was added`,
      performedBy: currentUser?.id || "system",
      performedByName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "System",
      timestamp: new Date(),
      metadata: {
        contactName: data.name,
        position: data.position,
        email: data.email,
      },
    };

    onUpdate(client.id, {
      contacts: [...contacts, newContact],
      activityHistory: [newActivity, ...activityHistory],
    });
    toast.success("Contact added successfully");
  };

  const handleDeleteContact = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);

    // Create activity for deleting contact
    const newActivity = {
      id: `activity-${Date.now()}`,
      clientId: client.id,
      action: "contact_removed",
      description: `Contact "${contact?.name}" was removed`,
      performedBy: currentUser?.id || "system",
      performedByName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "System",
      timestamp: new Date(),
      metadata: { contactName: contact?.name, contactId },
    };

    onUpdate(client.id, {
      contacts: contacts.filter((c) => c.id !== contactId),
      activityHistory: [newActivity, ...activityHistory],
    });
    toast.success("Contact deleted successfully");
  };

  const handleAddNote = (data: CreateCommunicationNoteRequest) => {
    if (onAddCommunicationNote) {
      // Use the dedicated endpoint for adding communication notes
      onAddCommunicationNote(client.id, data);
    } else {
      // Fallback to the old way using onUpdate
      const newNote: CommunicationNote = {
        ...data,
        id: `note-${Date.now()}`,
        clientId: client.id,
        createdBy: currentUser?.id || "system",
        createdByName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "System",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create activity for adding communication note
      const newActivity = {
        id: `activity-${Date.now()}`,
        clientId: client.id,
        action: "communication_logged",
        description: `Communication logged: ${data.type.replace(
          /_/g,
          " "
        )} - "${data.subject}"`,
        performedBy: currentUser?.id || "system",
        performedByName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : "System",
        timestamp: new Date(),
        metadata: { noteType: data.type, subject: data.subject },
      };

      onUpdate(client.id, {
        communicationNotes: [newNote, ...communicationNotes],
        activityHistory: [newActivity, ...activityHistory],
      });
      toast.success("Communication note added successfully");
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const note = communicationNotes.find((n) => n.id === noteId);

    // Create activity for deleting note
    const newActivity = {
      id: `activity-${Date.now()}`,
      clientId: client.id,
      action: "communication_deleted",
      description: `Communication note "${note?.subject}" was deleted`,
      performedBy: currentUser?.id || "system",
      performedByName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "System",
      timestamp: new Date(),
      metadata: { noteSubject: note?.subject, noteId },
    };

    onUpdate(client.id, {
      communicationNotes: communicationNotes.filter((n) => n.id !== noteId),
      activityHistory: [newActivity, ...activityHistory],
    });
    toast.success("Communication note deleted successfully");
  };

  const handleDeleteClient = () => {
    // Check if client has active jobs
    if (statistics.activeJobs > 0) {
      toast.error(
        `Cannot delete client "${client.companyName}". This client has ${
          statistics.activeJobs
        } active job${
          statistics.activeJobs > 1 ? "s" : ""
        }. Please close or reassign all active jobs before deleting.`,
        { duration: 5000 }
      );
      return;
    }

    // Additional confirmation for clients with any jobs
    let confirmMessage =
      "Are you sure you want to delete this client? This action cannot be undone.";
    if (statistics.totalJobs > 0) {
      confirmMessage = `This client has ${statistics.totalJobs} job${
        statistics.totalJobs > 1 ? "s" : ""
      } in the system. Are you sure you want to delete this client? This action cannot be undone.`;
    }

    setDeleteConfirmMessage(confirmMessage);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClient = () => {
    onDelete(client.id);
    onBack();
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "phone":
        return PhoneCall;
      case "meeting":
        return UsersIcon;
      case "video_call":
        return Video;
      default:
        return MessageSquare;
    }
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "phone":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "meeting":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "video_call":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "job_created":
      case "job_posted":
        return Briefcase;
      case "candidate_hired":
        return UserCheck;
      case "contact_added":
        return UserPlus;
      case "status_changed":
        return CheckCircle2;
      case "client_updated":
        return FileEdit;
      case "client_created":
        return Building2;
      default:
        return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "job_created":
      case "job_posted":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "candidate_hired":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "contact_added":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "status_changed":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "client_updated":
        return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
      case "client_created":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 md:px-4 lg:px-6 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back to Clients</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditClientOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClient}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Client
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 rounded-lg">
            <AvatarImage src={client.logo} alt={client.companyName} />
            <AvatarFallback className="rounded-lg">
              <Building2 className="h-7 w-7 md:h-8 md:w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold mb-1">
              {client.companyName}
            </h1>
            <p className="text-sm text-muted-foreground mb-2">
              {client.description || "No description available"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {client.status && (
                <Badge
                  variant="outline"
                  className={statusColors[client.status]}
                >
                  {client.status.replace("_", " ")}
                </Badge>
              )}
              {client.industry && (
                <Badge
                  variant="outline"
                  className={industryColors[client.industry]}
                >
                  {client.industry}
                </Badge>
              )}
              <Badge variant="outline">
                <UsersIcon className="h-3 w-3" />
                {client.companySize} employees
              </Badge>
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mt-6">
          <div className="rounded-lg border bg-linear-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-blue-500/10 p-1.5">
                <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                Total Jobs
              </span>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalJobs}
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              {statistics.activeJobs}A / {statistics.closedJobs}C /{" "}
              {statistics.draftJobs}D
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-green-500/10 p-1.5">
                <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                Active Jobs
              </span>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {statistics.activeJobs}
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              {statistics.totalJobs > 0
                ? Math.round(
                    (statistics.activeJobs / statistics.totalJobs) * 100
                  )
                : 0}
              % of total
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-purple-50 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-purple-500/10 p-1.5">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                Candidates
              </span>
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.totalCandidates}
            </p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
              {statistics.activeCandidates} active
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-amber-500/10 p-1.5">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Active
              </span>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {statistics.activeCandidates}
            </p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              In pipeline
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-teal-50 to-teal-100/20 dark:from-teal-950/20 dark:to-teal-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-teal-500/10 p-1.5">
                <ThumbsUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Hired
              </span>
            </div>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {statistics.hiredCandidates}
            </p>
            <p className="text-xs text-teal-600/70 dark:text-teal-400/70">
              {statistics.totalCandidates > 0
                ? Math.round(
                    (statistics.hiredCandidates / statistics.totalCandidates) *
                      100
                  )
                : 0}
              % success rate
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-purple-50 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-purple-500/10 p-1.5">
                <UsersIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                Total Candidates
              </span>
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.totalCandidates}
            </p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
              {statistics.activeCandidates} active
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-cyan-50 to-cyan-100/20 dark:from-cyan-950/20 dark:to-cyan-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-cyan-500/10 p-1.5">
                <UsersIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
                Active Candidates
              </span>
            </div>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              {statistics.activeCandidates}
            </p>
            <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70">
              In pipeline
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-amber-500/10 p-1.5">
                <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Hired
              </span>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {statistics.hiredCandidates}
            </p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {statistics.totalCandidates > 0
                ? Math.round(
                    (statistics.hiredCandidates / statistics.totalCandidates) *
                      100
                  )
                : 0}
              % success rate
            </p>
          </div>
          <div className="rounded-lg border bg-linear-to-br from-red-50 to-red-100/20 dark:from-red-950/20 dark:to-red-900/10 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="rounded-md bg-red-500/10 p-1.5">
                <UserCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                Rejected
              </span>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {statistics.rejectedCandidates}
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Not selected
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="px-4 lg:px-6 py-6"
        >
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="h-11 p-1 bg-card border border-border w-full md:w-fit inline-flex">
              <TabsTrigger
                value="overview"
                className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
              >
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
              >
                <Briefcase className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  Jobs ({clientJobs.length})
                </span>
                <span className="sm:hidden">({clientJobs.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
              >
                <UsersIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  Contacts ({contacts.length})
                </span>
                <span className="sm:hidden">({contacts.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="communications"
                className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
              >
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  Communications ({communicationNotes.length})
                </span>
                <span className="sm:hidden">({communicationNotes.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex-1 md:flex-initial px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
              >
                <Activity className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  Activity ({activityHistory.length})
                </span>
                <span className="sm:hidden">({activityHistory.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">
                        {client.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">
                        {client.phone}
                      </div>
                    </div>
                  </div>
                  {client.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Website</div>
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {client.website}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Address</div>
                      <div className="text-sm text-muted-foreground">
                        {client.address.street && (
                          <div>{client.address.street}</div>
                        )}
                        <div>
                          {client.address.city}
                          {client.address.state && `, ${client.address.state}`}
                          {client.address.postalCode &&
                            ` ${client.address.postalCode}`}
                        </div>
                        <div>{client.address.country}</div>
                      </div>
                    </div>
                  </div>
                  {client.assignedTo && client.assignedToName && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">
                          Account Manager
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.assignedToName}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Primary Contact */}
              {primaryContact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Primary Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Name</div>
                        <div className="text-sm text-muted-foreground">
                          {primaryContact.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Position</div>
                        <div className="text-sm text-muted-foreground">
                          {primaryContact.position}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">
                          {primaryContact.email}
                        </div>
                      </div>
                    </div>
                    {primaryContact.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Phone</div>
                          <div className="text-sm text-muted-foreground">
                            {primaryContact.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">All Jobs</h2>
              <Button size="sm" onClick={() => setIsAddJobOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
            <div className="grid gap-4">
              {clientJobs.map((job) => {
                const candidateCounts = jobCandidateCounts.get(job.id) || {
                  total: 0,
                  active: 0,
                  hired: 0,
                };
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => onJobClick?.(job.id)}
                    clientName={client.companyName}
                    candidateCounts={candidateCounts}
                  />
                );
              })}
              {clientJobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No jobs found for this client</p>
                  <p className="text-sm mt-2">
                    Create a job to start recruiting candidates
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Contact Persons</h2>
              <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <Card key={contact.id || contact.email || index}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {contact.name}
                        </CardTitle>
                        {contact.isPrimary && (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          >
                            Primary
                          </Badge>
                        )}
                      </div>
                      {!contact.isPrimary && contact.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id!)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription>{contact.position}</CardDescription>
                    <div className="space-y-2 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {contacts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No contacts found for this client</p>
                  <p className="text-sm mt-2">
                    Add a contact person to manage communications
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="communications" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Communication History</h2>
              <Button size="sm" onClick={() => setIsAddNoteOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
            <div className="space-y-4">
              {communicationNotes.map((note, index) => {
                const Icon = getCommunicationIcon(note.type);
                return (
                  <Card key={note.id || index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={cn(
                              "rounded-md p-2",
                              getCommunicationColor(note.type)
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <CardTitle className="text-base">
                                {note.subject}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className={getCommunicationColor(note.type)}
                              >
                                {note.type.replace("_", " ")}
                              </Badge>
                            </div>
                            <CardDescription className="whitespace-pre-wrap">
                              {note.content}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{note.createdByName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {toDateObject(note.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        {note.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id!)}
                            className="ml-auto h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
              {communicationNotes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No communication notes yet</p>
                  <p className="text-sm mt-1">
                    Add your first note to track interactions with this client
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Activity Timeline</h2>
            </div>
            <div className="space-y-3">
              {activityHistory.map((activity, index) => {
                const Icon = getActivityIcon(activity.action);
                const isLast = index === activityHistory.length - 1;
                return (
                  <div key={activity.id || index} className="relative">
                    {!isLast && (
                      <div className="absolute left-[21px] top-11 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "rounded-full p-2.5 shrink-0 relative z-10",
                          getActivityColor(activity.action)
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <Card className="flex-1">
                        <CardHeader className="py-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium">
                                {activity.description}
                              </CardTitle>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" />
                                  <span>{activity.performedByName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    {toDateObject(
                                      activity.timestamp
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "ml-2",
                                getActivityColor(activity.action)
                              )}
                            >
                              {activity.action.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>
                );
              })}
              {activityHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No activity recorded yet</p>
                  <p className="text-sm mt-1">
                    Activity will appear here as actions are performed
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddContactModal
        open={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSubmit={handleAddContact}
      />

      <AddCommunicationNoteModal
        open={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onSubmit={handleAddNote}
      />

      <EditClientModal
        open={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        onSubmit={(updates) => onUpdate(client.id, updates)}
        client={client}
      />

      <AddJobModal
        open={isAddJobOpen}
        clients={clientsList}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={handleAddJob}
        prefilledClientId={client.id}
        hideClientSelector={true}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Client"
        description={deleteConfirmMessage}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteClient}
        variant="destructive"
      />
    </div>
  );
}
