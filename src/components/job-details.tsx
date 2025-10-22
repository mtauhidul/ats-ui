import { useState } from "react";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Clock, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateCard } from "@/components/candidate-card";
import type { Job } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";

interface JobDetailsProps {
  job: Job;
  candidates: Candidate[];
  clientName: string;
  onBack: () => void;
  onCandidateClick: (candidate: Candidate) => void;
}

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  closed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

export function JobDetails({ job, candidates, clientName, onBack, onCandidateClick }: JobDetailsProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Filter candidates for this job
  const jobCandidates = candidates.filter(candidate => 
    candidate.jobApplications.some(app => app.jobId === job.id)
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
            <p className="text-muted-foreground text-lg">{clientName}</p>
          </div>
        </div>
        <Badge className={cn("border text-sm px-3 py-1", statusColors[job.status])}>
          {job.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Job Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="text-lg font-semibold">{job.type.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{job.workMode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2.5">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-lg font-semibold">{job.experienceLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {job.salaryRange && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2.5">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p className="text-sm font-semibold">
                    {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">In Pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/20 dark:from-amber-950/20 dark:to-amber-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Interview</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.interviewing}</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Interviewing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/20 dark:from-green-950/20 dark:to-green-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Hired</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.hired}</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Successfully</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/20 dark:from-red-950/20 dark:to-red-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Not Suitable</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>All candidates who applied for this position</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[160px]">
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
              <p className="text-muted-foreground">No candidates found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  jobId={job.id}
                  onClick={() => onCandidateClick(candidate)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
