import { Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Candidate } from "@/types/candidate";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  jobId: string;
  onClick: () => void;
}

const statusColors = {
  new: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  screening: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  interviewing: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  testing: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  reference_check: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  offer_extended: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  hired: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  withdrawn: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
} as const;

export function CandidateCard({ candidate, jobId, onClick }: CandidateCardProps) {
  // Find the job application for this specific job
  const jobApplication = candidate.jobApplications.find(app => app.jobId === jobId);
  
  if (!jobApplication) return null;

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();
  const daysSinceApplied = Math.floor((new Date().getTime() - new Date(jobApplication.appliedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={candidate.avatar} alt={fullName} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {fullName}
                </h3>
                {candidate.currentTitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {candidate.currentTitle}
                    {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                  </p>
                )}
              </div>
              <Badge className={cn("border ml-2 flex-shrink-0", statusColors[jobApplication.status])}>
                {jobApplication.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {candidate.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{candidate.phone}</span>
                </div>
              )}
              {candidate.address && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{candidate.address.city}, {candidate.address.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{candidate.yearsOfExperience} years exp.</span>
              </div>
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {candidate.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                    {skill.name}
                  </Badge>
                ))}
                {candidate.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{candidate.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Footer Stats */}
            <div className="flex items-center justify-between pt-3 border-t text-xs">
              <div className="flex items-center gap-3">
                {jobApplication.rating && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-medium">{jobApplication.rating.toFixed(1)}</span>
                  </div>
                )}
                {candidate.education && candidate.education.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{candidate.education[0].degree}</span>
                  </div>
                )}
                {candidate.certifications && candidate.certifications.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-3.5 w-3.5" />
                    <span>{candidate.certifications.length} certs</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{daysSinceApplied}d ago</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
