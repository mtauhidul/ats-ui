import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";
import {
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Kanban,
  MapPin,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  clientName?: string;
}

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  on_hold:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  closed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
} as const;

const typeColors = {
  full_time:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  part_time:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  contract:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  freelance:
    "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  internship:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  temporary:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
} as const;

export function JobCard({ job, onClick, clientName }: JobCardProps) {
  const navigate = useNavigate();
  const totalCandidates =
    job.statistics?.totalCandidates || job.candidateIds?.length || 0;
  const activeCandidates = job.statistics?.activeCandidates || 0;
  const hiredCandidates = job.statistics?.hiredCandidates || 0;

  // Convert categoryIds to array if it's an object (Firestore serialization issue)
  const categoryIds = Array.isArray(job.categoryIds)
    ? job.categoryIds
    : job.categoryIds && typeof job.categoryIds === 'object'
    ? Object.values(job.categoryIds)
    : [];

  const handlePipelineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/jobs/pipeline/${job.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary hover:border-l-primary/80"
      onClick={onClick}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 line-clamp-1">
              {job.title}
            </h3>
            {clientName && (
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="truncate">{clientName}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-wrap sm:ml-4">
            <Badge
              className={cn(
                "border text-xs md:text-sm",
                statusColors[job.status]
              )}
            >
              {job.status.replace(/_/g, " ")}
            </Badge>
            <Badge
              className={cn("border text-xs md:text-sm", typeColors[job.type])}
            >
              {job.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 mb-3">
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
              <span className="truncate">
                {typeof job.location === "string"
                  ? job.location
                  : `${job.location.city || ""}, ${job.location.country || ""}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
            <Briefcase className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
            <span className="truncate">{job.workMode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
            <span className="truncate">{job.experienceLevel}</span>
          </div>
          {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
              <span className="truncate">
                {job.salaryRange.currency || "USD"}{" "}
                {job.salaryRange.min.toLocaleString()} -{" "}
                {job.salaryRange.max.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Categories */}
        {categoryIds && categoryIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categoryIds.slice(0, 3).map((categoryId: any) => {
              const category =
                typeof categoryId === "object" ? categoryId : null;
              if (!category) return null;

              return (
                <Badge
                  key={category.id || category._id}
                  variant="secondary"
                  style={{
                    backgroundColor: `${category.color || "#3B82F6"}15`,
                    color: category.color || "#3B82F6",
                    borderColor: `${category.color || "#3B82F6"}40`,
                  }}
                  className="px-2 py-0.5 text-xs border"
                >
                  {category.name}
                </Badge>
              );
            })}
            {categoryIds.length > 3 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                +{categoryIds.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Candidate Statistics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 border-t">
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-1 md:gap-1.5">
              <Users className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
              <span className="font-medium">{totalCandidates}</span>
              <span className="text-muted-foreground text-[10px] md:text-xs">
                Total
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {activeCandidates}
              </span>
              <span className="text-muted-foreground text-[10px] md:text-xs">
                Active
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">
                {hiredCandidates}
              </span>
              <span className="text-muted-foreground text-[10px] md:text-xs">
                Hired
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 md:h-8 text-xs md:text-sm w-full sm:w-auto"
            onClick={handlePipelineClick}
          >
            <Kanban className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5" />
            Pipeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
