import { useState } from "react";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Clock, CheckCircle2, XCircle, UserCheck, Building2, Calendar, Target, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CandidateCard } from "@/components/candidate-card";
import { JobCandidateDetails } from "@/components/job-candidate-details";
import { EditJobModal } from "@/components/modals/edit-job-modal";
import type { Job, UpdateJobRequest } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import type { Client } from "@/types/client";
import { cn } from "@/lib/utils";

interface JobDetailsProps {
  job: Job;
  candidates: Candidate[];
  clients: Client[];
  clientName: string;
  onBack: () => void;
  onCandidateClick: (candidate: Candidate) => void;
  onEditJob?: (id: string, data: UpdateJobRequest) => void;
}

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  closed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

export function JobDetails({ job, candidates, clients, clientName, onBack, onCandidateClick, onEditJob }: JobDetailsProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter candidates for this job
  const jobCandidates = candidates.filter(candidate => 
    candidate.jobApplications.some(app => app.jobId === job.id)
  );

  // Handle status change for candidate
  const handleStatusChange = (candidateId: string, jobId: string, newStatus: string) => {
    // This would update the candidate status in the parent component
    console.log("Status change:", { candidateId, jobId, newStatus });
  };

  const handleEditJob = (id: string, data: UpdateJobRequest) => {
    if (onEditJob) {
      onEditJob(id, data);
    }
    setIsEditModalOpen(false);
  };

  // If viewing candidate details
  if (selectedCandidate) {
    return (
      <JobCandidateDetails
        candidate={selectedCandidate}
        job={job}
        onBack={() => setSelectedCandidate(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  // Apply filters
  const filteredCandidates = jobCandidates.filter(candidate => {
    const jobApp = candidate.jobApplications.find(app => app.jobId === job.id);
    if (!jobApp) return false;
    
    if (statusFilter === "all") return true;
    return jobApp.status === statusFilter;
  });

  // Apply sorting
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const appA = a.jobApplications.find(app => app.jobId === job.id);
    const appB = b.jobApplications.find(app => app.jobId === job.id);
    
    if (!appA || !appB) return 0;
    
    switch (sortBy) {
      case "newest":
        return new Date(appB.appliedAt).getTime() - new Date(appA.appliedAt).getTime();
      case "oldest":
        return new Date(appA.appliedAt).getTime() - new Date(appB.appliedAt).getTime();
      case "rating":
        return (appB.rating || 0) - (appA.rating || 0);
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      default:
        return 0;
    }
  });

  // Calculate statistics by status
  const stats = {
    total: jobCandidates.length,
    active: jobCandidates.filter(c => {
      const app = c.jobApplications.find(a => a.jobId === job.id);
      return app && !['hired', 'rejected', 'withdrawn'].includes(app.status);
    }).length,
    interviewing: jobCandidates.filter(c => {
      const app = c.jobApplications.find(a => a.jobId === job.id);
      return app && app.status === 'interviewing';
    }).length,
    hired: jobCandidates.filter(c => {
      const app = c.jobApplications.find(a => a.jobId === job.id);
      return app && app.status === 'hired';
    }).length,
    rejected: jobCandidates.filter(c => {
      const app = c.jobApplications.find(a => a.jobId === job.id);
      return app && app.status === 'rejected';
    }).length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{job.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("border text-sm px-3 py-1 whitespace-nowrap", statusColors[job.status])}>
              {job.status.replace(/_/g, ' ')}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 sm:hidden">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Client Info */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="text-sm md:text-base">{clientName}</span>
          <span className="text-xs">•</span>
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Job Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Type</p>
          </div>
          <p className="text-sm md:text-base font-semibold capitalize">{job.type.replace(/_/g, ' ')}</p>
        </div>

        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-md bg-blue-500/10 p-1.5">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Mode</p>
          </div>
          <p className="text-sm md:text-base font-semibold capitalize">{job.workMode}</p>
        </div>

        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-md bg-green-500/10 p-1.5">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <p className="text-sm md:text-base font-semibold capitalize">{job.experienceLevel}</p>
        </div>

        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-md bg-amber-500/10 p-1.5">
              <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs text-muted-foreground">Openings</p>
          </div>
          <p className="text-sm md:text-base font-semibold">{job.openings} {job.openings === 1 ? 'position' : 'positions'}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Total</span>
          </div>
          <p className="text-xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Candidates</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-md bg-blue-500/10 p-1.5">
              <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Active</span>
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70">In Pipeline</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-md bg-amber-500/10 p-1.5">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Interview</span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.interviewing}</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Stage</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-md bg-green-500/10 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Hired</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.hired}</p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70">Success</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-red-50 to-red-100/20 dark:from-red-950/20 dark:to-red-900/10 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="rounded-md bg-red-500/10 p-1.5">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Rejected</span>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70">Declined</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="h-11 p-1 bg-card border border-border w-fit">
          <TabsTrigger 
            value="pipeline" 
            className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
          >
            Pipeline
          </TabsTrigger>
          <TabsTrigger 
            value="candidates" 
            className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
          >
            Candidates ({sortedCandidates.length})
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
          >
            Job Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Pipeline Management</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Use the dedicated Pipeline page to manage candidates through your hiring stages with drag & drop functionality.
                </p>
                <Button onClick={() => window.location.href = `/dashboard/jobs/pipeline/${job.id}`}>
                  Go to Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">All Candidates</CardTitle>
                  <CardDescription className="text-sm">
                    Showing {sortedCandidates.length} of {jobCandidates.length} candidates
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="reference_check">Reference Check</SelectItem>
                      <SelectItem value="offer_extended">Offer Extended</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {statusFilter !== "all" ? "No candidates found with this status" : "No candidates have applied yet"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      jobId={job.id}
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        onCandidateClick(candidate);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Job Description */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">{job.requirements.experience}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.skills.required.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                {job.requirements.skills.preferred.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Preferred Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.skills.preferred.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-purple-500/10 p-2">
                      <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Salary Range</p>
                      <p className="text-sm text-muted-foreground">
                        {job.salaryRange.currency || 'USD'} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                        {job.salaryRange.period && ` / ${job.salaryRange.period}`}
                      </p>
                    </div>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-blue-500/10 p-2">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof job.location === 'string'
                          ? job.location
                          : `${job.location.city || ''}, ${job.location.country || ''}`}
                      </p>
                    </div>
                  </div>
                )}
                {job.department && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-green-500/10 p-2">
                      <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{job.department}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-amber-500/10 p-2">
                    <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Priority</p>
                    <Badge variant="outline" className="text-xs capitalize mt-1">
                      {job.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Job Modal */}
      <EditJobModal
        open={isEditModalOpen}
        job={job}
        clients={clients}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditJob}
      />
    </div>
  );
}
