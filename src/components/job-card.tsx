import { Building2, MapPin, Briefcase, Clock, Users, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/types/job";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  clientName?: string;
}

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  closed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

const typeColors = {
  full_time: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  part_time: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  contract: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  freelance: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  internship: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  temporary: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
} as const;

export function JobCard({ job, onClick, clientName }: JobCardProps) {
  const totalCandidates = job.candidateIds?.length || 0;
  const activeCandidates = job.statistics?.activeCandidates || 0;
  const hiredCandidates = job.statistics?.hiredCandidates || 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary hover:border-l-primary/80"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
              {job.title}
            </h3>
            {clientName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                <span>{clientName}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Badge className={cn("border", statusColors[job.status])}>
              {job.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={cn("border", typeColors[job.type])}>
              {job.type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {job.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.location.city}, {job.location.country}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.workMode}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.experienceLevel}</span>
          </div>
          {job.salaryRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Candidate Statistics */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{totalCandidates}</span>
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium text-blue-600 dark:text-blue-400">{activeCandidates}</span>
              <span className="text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">{hiredCandidates}</span>
              <span className="text-muted-foreground">Hired</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
