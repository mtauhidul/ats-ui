import { Building2, MapPin, Briefcase, Clock, Users, DollarSign, Kanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const totalCandidates = job.statistics?.totalCandidates || job.candidateIds?.length || 0;
  const activeCandidates = job.statistics?.activeCandidates || 0;
  const hiredCandidates = job.statistics?.hiredCandidates || 0;

  const handlePipelineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/jobs/pipeline/${job.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary hover:border-l-primary/80"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">
              {job.title}
            </h3>
            {clientName && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{clientName}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Badge className={cn("border text-sm", statusColors[job.status])}>
              {job.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className={cn("border text-sm", typeColors[job.type])}>
              {job.type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {job.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {typeof job.location === 'string'
                  ? job.location
                  : `${job.location.city || ''}, ${job.location.country || ''}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{job.workMode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{job.experienceLevel}</span>
          </div>
          {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {job.salaryRange.currency || 'USD'} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Candidate Statistics */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{totalCandidates}</span>
              <span className="text-muted-foreground text-xs">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="font-medium text-blue-600 dark:text-blue-400">{activeCandidates}</span>
              <span className="text-muted-foreground text-xs">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">{hiredCandidates}</span>
              <span className="text-muted-foreground text-xs">Hired</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            onClick={handlePipelineClick}
          >
            <Kanban className="h-3.5 w-3.5 mr-1.5" />
            Pipeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
