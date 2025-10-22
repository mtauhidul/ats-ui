import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Calendar, Star, Download, MessageSquare, UserCheck, UserX, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface JobCandidateDetailsProps {
  candidate: Candidate;
  job: Job;
  onBack: () => void;
  onStatusChange: (candidateId: string, jobId: string, newStatus: string) => void;
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

const skillLevelColors = {
  beginner: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  intermediate: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  advanced: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  expert: "bg-green-500/10 text-green-700 dark:text-green-400",
} as const;

export function JobCandidateDetails({ candidate, job, onBack, onStatusChange }: JobCandidateDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();
  
  // Get the job application for this specific job
  const jobApplication = candidate.jobApplications.find(app => app.jobId === job.id);
  
  if (!jobApplication) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Application not found</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const daysSinceApplied = Math.floor((new Date().getTime() - new Date(jobApplication.appliedAt).getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(candidate.id, job.id, newStatus);
    toast.success(`Candidate status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-border flex-shrink-0">
            <AvatarImage src={candidate.avatar} alt={fullName} />
            <AvatarFallback className="text-xl lg:text-2xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 truncate">{fullName}</h1>
            {candidate.currentTitle && (
              <p className="text-base lg:text-lg text-muted-foreground mb-3 truncate">
                {candidate.currentTitle}
                {candidate.currentCompany && ` at ${candidate.currentCompany}`}
              </p>
            )}
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <Badge className={cn("border text-xs", statusColors[jobApplication.status as keyof typeof statusColors])}>
                {jobApplication.status.replace(/_/g, ' ')}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                <span>Applied {daysSinceApplied}d ago</span>
              </div>
              {jobApplication.rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-amber-500 text-amber-500" />
                  <span className="text-xs lg:text-sm font-medium">{jobApplication.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Message</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Resume</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium">Update Status:</span>
              <Select value={jobApplication.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="reference_check">Reference Check</SelectItem>
                  <SelectItem value="offer_extended">Offer Extended</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" className="flex-1 sm:flex-none">
                <UserCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Approve</span>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                <UserX className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Reject</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Context */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Applied For</p>
              <h3 className="font-semibold text-base lg:text-lg truncate">{job.title}</h3>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">{job.department || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="font-medium text-sm truncate">{candidate.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {candidate.phone && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2.5 flex-shrink-0">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium text-sm truncate">{candidate.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {candidate.address && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2.5 flex-shrink-0">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                  <p className="font-medium text-sm truncate">{candidate.address.city}, {candidate.address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-11 p-1 bg-card border border-border w-full inline-flex">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
            Skills
          </TabsTrigger>
          <TabsTrigger value="education" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
            Education
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Summary */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Experienced professional with {candidate.yearsOfExperience} years of experience in the field.
                  {candidate.currentTitle && ` Currently working as ${candidate.currentTitle}`}
                  {candidate.currentCompany && ` at ${candidate.currentCompany}`}.
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{candidate.yearsOfExperience}</span>
                    <span className="text-sm text-muted-foreground">years of experience</span>
                  </div>
                  {candidate.currentCompany && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Currently at</p>
                      <p className="font-medium text-sm">{candidate.currentCompany}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            {candidate.languages && candidate.languages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="font-medium text-sm">{lang.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {lang.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4" />
                    Certifications ({candidate.certifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2.5 py-1 font-normal">
                        <Award className="h-3 w-3 mr-1.5" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4" />
                  Skills & Expertise
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {candidate.skills?.length || 0} skills
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {candidate.skills.map((skill, index) => (
                    <div
                      key={index}
                      className={cn(
                        "px-3 py-2.5 rounded-lg border hover:shadow-md transition-shadow",
                        skillLevelColors[skill.level]
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{skill.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                          {skill.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4" />
                Education History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="rounded-lg bg-primary/10 p-2.5 h-fit flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-1">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{edu.institution}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(edu.startDate).getFullYear()} -{" "}
                              {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                            </span>
                          </div>
                          {edu.field && (
                            <Badge variant="outline" className="text-xs">
                              {edu.field}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No education history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-8">
                {/* Timeline Line */}
                <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-border"></div>

                {/* Applied Event */}
                <div className="relative">
                  <div className="absolute -left-8 top-0.5 rounded-full bg-primary p-2 ring-4 ring-background">
                    <Calendar className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Application Submitted</h4>
                      <Badge variant="outline" className="text-xs">
                        {daysSinceApplied} days ago
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(jobApplication.appliedAt).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Last Status Change Event */}
                <div className="relative">
                  <div className="absolute -left-8 top-0.5 rounded-full bg-muted p-2 ring-4 ring-background border-2 border-border">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Status Updated</h4>
                      <Badge className={cn("text-xs border", statusColors[jobApplication.status as keyof typeof statusColors])}>
                        {jobApplication.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(jobApplication.lastStatusChange).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Rating if available */}
                {jobApplication.rating && (
                  <div className="relative">
                    <div className="absolute -left-8 top-0.5 rounded-full bg-amber-500 p-2 ring-4 ring-background">
                      <Star className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">Rating Assigned</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-sm">{jobApplication.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Candidate has been evaluated
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
