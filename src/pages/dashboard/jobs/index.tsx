import { JobCard } from "@/components/job-card";
import { AddJobModal } from "@/components/modals/add-job-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidates, useClients, useJobs } from "@/store/hooks/index";
import type { CreateJobRequest } from "@/types/job";
import {
  Briefcase,
  CheckCircle2,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardJobsPage() {
  const navigate = useNavigate();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  // Local filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // 🔥 REALTIME: Redux hooks now use Firestore internally - data auto-updates!
  const { jobs, createJob } = useJobs();
  const { clients } = useClients();
  const { candidates } = useCandidates();

  console.log("📋 Jobs page - jobs from hook:", jobs.length);

  // 🔥 REALTIME: Calculate candidate counts from actual candidates collection
  // This ensures accurate counts even after deletions
  const jobCandidateCounts = useMemo(() => {
    const counts = new Map<
      string,
      { total: number; active: number; hired: number }
    >();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    candidates.forEach((candidate: any) => {
      // Get all job IDs this candidate is associated with
      const jobIds = candidate.jobIds || [];

      jobIds.forEach((jobId: string) => {
        if (!counts.has(jobId)) {
          counts.set(jobId, { total: 0, active: 0, hired: 0 });
        }

        const count = counts.get(jobId)!;
        count.total++;

        // Count by status
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

    return counts;
  }, [candidates]);

  // Filter and sort jobs locally (no longer using Redux selector)
  const filteredJobs = jobs
    .filter((job) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || job.type === typeFilter;

      // Client filter
      const matchesClient =
        clientFilter === "all" || job.clientId === clientFilter;

      return matchesSearch && matchesStatus && matchesType && matchesClient;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  // Calculate stats from jobs
  const stats = {
    total: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    onHold: jobs.filter((j) => j.status === "on_hold").length,
    totalCandidates: Array.from(jobCandidateCounts.values()).reduce(
      (sum, counts) => sum + counts.total,
      0
    ),
    totalOpenings: jobs.reduce((sum, j) => sum + (j.openings || 0), 0),
    filled: jobs.reduce((sum, j) => sum + (j.filledPositions || 0), 0),
  };

  // No useEffect needed - Firestore provides realtime data automatically!

  // Get client name helper
  const getClientName = (
    clientOrId?: string | { id?: string; _id?: string; companyName?: string }
  ): string => {
    if (!clientOrId) return "No Client";

    // If a string id was passed
    if (typeof clientOrId === "string") {
      const client = clients.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c) => c.id === clientOrId || (c as any)._id === clientOrId
      );
      return client?.companyName || clientOrId;
    }

    // If an object was passed, prefer its companyName if available,
    // otherwise try to resolve by id/_id
    if (typeof clientOrId === "object") {
      if (clientOrId.companyName) return clientOrId.companyName;
      const id = clientOrId.id || clientOrId._id;
      if (id) {
        const client = clients.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c) => c.id === id || (c as any)._id === id
        );
        return client?.companyName || id;
      }
    }

    return "No Client";
  };

  // Handle add job
  const handleAddJob = (data: CreateJobRequest) => {
    createJob(data);
    setIsAddJobOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all job postings
                </p>
              </div>
              <Button onClick={() => setIsAddJobOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Job
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="rounded-lg border bg-linear-to-br from-card to-muted/20 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Total
                  </span>
                </div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Jobs</p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-green-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Open
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.open}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">
                  {stats.total > 0
                    ? Math.round((stats.open / stats.total) * 100)
                    : 0}
                  % of total
                </p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-blue-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Closed
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.closed}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                  Completed
                </p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-gray-50 to-gray-100/20 dark:from-gray-950/20 dark:to-gray-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-gray-500/10 p-1.5">
                    <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-400">
                    Draft
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.draft}
                </p>
                <p className="text-xs text-gray-600/70 dark:text-gray-400/70">
                  Pending
                </p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-purple-50 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-purple-500/10 p-1.5">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                    Candidates
                  </span>
                </div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalCandidates}
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                  Applied
                </p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-amber-500/10 p-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Openings
                  </span>
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.totalOpenings}
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Positions
                </p>
              </div>

              <div className="rounded-lg border bg-linear-to-br from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-emerald-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Filled
                  </span>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.filled}
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  Hired
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs by title, client, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={clientFilter}
                      onValueChange={setClientFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title (A-Z)</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="candidates">
                          Most Candidates
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredJobs.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {stats.total}
                  </span>{" "}
                  jobs
                </p>
              </div>

              {filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No jobs found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      typeFilter !== "all" ||
                      clientFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Get started by creating your first job"}
                    </p>
                    {!searchQuery &&
                      statusFilter === "all" &&
                      typeFilter === "all" &&
                      clientFilter === "all" && (
                        <Button onClick={() => setIsAddJobOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Job
                        </Button>
                      )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => {
                    const candidateCounts = jobCandidateCounts.get(job.id) || {
                      total: 0,
                      active: 0,
                      hired: 0,
                    };
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                        clientName={getClientName(job.clientId)}
                        candidateCounts={candidateCounts}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddJobModal
        open={isAddJobOpen}
        clients={clients}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={handleAddJob}
      />
    </div>
  );
}
