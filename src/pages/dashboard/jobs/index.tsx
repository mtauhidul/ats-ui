import { useState } from "react";
import { Plus, Search, Briefcase, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/job-card";
import { JobDetails } from "@/components/job-details";
import { AddJobModal } from "@/components/modals/add-job-modal";
import type { Job, JobStatus, JobType, CreateJobRequest, UpdateJobRequest } from "@/types/job";
import type { Client } from "@/types/client";
import type { Candidate } from "@/types/candidate";
import jobsData from "@/lib/mock-data/jobs.json";
import clientsData from "@/lib/mock-data/clients.json";
import candidatesData from "@/lib/mock-data/candidates.json";
import { toast } from "sonner";

export default function DashboardJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

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

  // Transform clients data
  const [clients] = useState<Client[]>(
    clientsData.map((client) => ({
      ...client,
      industry: client.industry as Client["industry"],
      companySize: client.companySize as Client["companySize"],
      status: client.status as Client["status"],
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
      communicationNotes: [],
      activityHistory: [],
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
      jobApplications: candidate.jobApplications.map((app) => ({
        ...app,
        status: app.status as Candidate["jobApplications"][0]["status"],
        appliedAt: new Date(app.appliedAt),
        lastStatusChange: new Date(app.lastStatusChange),
      })),
      workExperience: [],
      categoryIds: [],
      tagIds: [],
      isActive: true,
    }))
  );

  // Get client name helper
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.companyName || "Unknown Client";
  };

  // Handle add job
  const handleAddJob = (data: CreateJobRequest) => {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      ...data,
      status: "draft",
      filledPositions: 0,
      candidateIds: [],
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
    toast.success("Job created successfully");
  };

  const handleEditJob = (id: string, data: UpdateJobRequest) => {
    setJobs(jobs.map(job => {
      if (job.id === id) {
        return {
          ...job,
          ...data,
          updatedAt: new Date(),
        };
      }
      return job;
    }));
    
    // Update selectedJob if it's the one being edited
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({
        ...selectedJob,
        ...data,
        updatedAt: new Date(),
      });
    }
    
    toast.success("Job updated successfully");
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(job.clientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesClient = clientFilter === "all" || job.clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "priority": {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      case "candidates":
        return (b.candidateIds?.length || 0) - (a.candidateIds?.length || 0);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === "open").length,
    closed: jobs.filter(j => j.status === "closed").length,
    draft: jobs.filter(j => j.status === "draft").length,
    totalCandidates: jobs.reduce((sum, j) => sum + (j.candidateIds?.length || 0), 0),
    totalOpenings: jobs.reduce((sum, j) => sum + (j.openings || 0), 0),
    filled: jobs.reduce((sum, j) => sum + (j.filledPositions || 0), 0),
  };

  // If viewing job details
  if (selectedJob) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <JobDetails
                job={selectedJob}
                candidates={candidates}
                clients={clients}
                clientName={getClientName(selectedJob.clientId)}
                onBack={() => setSelectedJob(null)}
                onCandidateClick={() => {}}
                onEditJob={handleEditJob}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Total</span>
                </div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Jobs</p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-green-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Open</span>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.open}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">
                  {stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0}% of total
                </p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-blue-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Closed</span>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.closed}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Completed</p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100/20 dark:from-gray-950/20 dark:to-gray-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-gray-500/10 p-1.5">
                    <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-400">Draft</span>
                </div>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</p>
                <p className="text-xs text-gray-600/70 dark:text-gray-400/70">Pending</p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100/20 dark:from-purple-950/20 dark:to-purple-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-purple-500/10 p-1.5">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Candidates</span>
                </div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCandidates}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Applied</p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-amber-500/10 p-1.5">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Openings</span>
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.totalOpenings}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Positions</p>
              </div>

              <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="rounded-md bg-emerald-500/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Filled</span>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.filled}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Hired</p>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
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

                    <Select value={clientFilter} onValueChange={setClientFilter}>
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
                        <SelectItem value="candidates">Most Candidates</SelectItem>
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
                  Showing <span className="font-medium text-foreground">{sortedJobs.length}</span> of{" "}
                  <span className="font-medium text-foreground">{stats.total}</span> jobs
                </p>
              </div>

              {sortedJobs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all" || typeFilter !== "all" || clientFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Get started by creating your first job"}
                    </p>
                    {!searchQuery && statusFilter === "all" && typeFilter === "all" && clientFilter === "all" && (
                      <Button onClick={() => setIsAddJobOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={() => setSelectedJob(job)}
                      clientName={getClientName(job.clientId)}
                    />
                  ))}
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