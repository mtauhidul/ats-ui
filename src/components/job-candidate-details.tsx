import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";

interface JobCandidateDetailsProps {
  candidate: Candidate;
  job: Job;
  onBack: () => void;
  onInterviewClick?: () => void;
  onEmailClick?: () => void;
}

interface Interview {
  id: string;
  title: string;
  status: "scheduled" | "completed" | "cancelled";
  scheduledAt: string;
  feedback?: Array<{
    rating: number;
    recommendation?: string;
    comments?: string;
  }>;
}

const statusColors = {
  new: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  screening:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  interviewing:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  testing: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  reference_check:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  offer_extended:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  hired:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  withdrawn:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
} as const;

export function JobCandidateDetails({
  candidate,
  job,
  onBack,
  onInterviewClick,
  onEmailClick,
}: JobCandidateDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Interview state for timeline
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const initials =
    `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();

  // Backend doesn't have per-job applications, use candidate-level data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidateData = candidate as any;

  // Debug: Log candidate data structure
  console.log("=== CANDIDATE DETAILS DEBUG ===");
  console.log("Full Candidate Object:", candidateData);
  console.log("Skills:", candidateData.skills);
  console.log("Experience:", candidateData.experience);
  console.log("Education:", candidateData.education);
  console.log("Summary:", candidateData.summary);
  console.log("AI Score:", candidateData.aiScore);
  console.log("Certifications:", candidateData.certifications);
  console.log("Languages:", candidateData.languages);
  console.log("===============================");

  // Check if this candidate is associated with this job
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAssociatedWithJob = candidateData.jobIds?.some((jobId: any) => {
    const id = typeof jobId === "object" ? jobId._id || jobId.id : jobId;
    return id === job.id;
  });

  // Fetch interviews for this candidate and job (before early return)
  useEffect(() => {
    if (!isAssociatedWithJob) return; // Skip if not associated

    const fetchInterviews = async () => {
      setIsLoadingInterviews(true);
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5001";
        const token = await window.Clerk?.session?.getToken();

        if (!token) {
          console.error("No auth token available");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/interviews?candidateId=${
            candidateData._id || candidateData.id
          }&jobId=${job.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setInterviews(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    fetchInterviews();
  }, [candidateData._id, candidateData.id, job.id, isAssociatedWithJob]);

  if (!isAssociatedWithJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            Candidate not associated with this job
          </p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Use candidate-level status (not per-job status)
  const status = candidateData.status || "active";

  const daysSinceApplied = Math.floor(
    (new Date().getTime() - new Date(candidateData.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Info Alert - Show if no parsed data */}
      {(!candidateData.skills || candidateData.skills.length === 0) &&
        (!candidateData.experience || candidateData.experience.length === 0) &&
        (!candidateData.education || candidateData.education.length === 0) && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500/10 p-2 shrink-0">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-1">
                    Resume Data Missing
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    The resume data wasn't transferred when this candidate was
                    created. Please delete this candidate and approve the
                    application again to properly populate skills, experience,
                    and education from the resume.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-border shrink-0">
            <AvatarImage src={candidate.avatar} alt={fullName} />
            <AvatarFallback className="text-xl lg:text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 truncate">
              {fullName}
            </h1>
            {candidate.currentTitle && (
              <p className="text-base lg:text-lg text-muted-foreground mb-3 truncate">
                {candidate.currentTitle}
                {candidate.currentCompany && ` at ${candidate.currentCompany}`}
              </p>
            )}
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <Badge
                className={cn(
                  "border text-xs",
                  statusColors[status as keyof typeof statusColors] ||
                    "bg-gray-500/10 text-gray-700"
                )}
              >
                {status.replace(/_/g, " ")}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                <span>Applied {daysSinceApplied}d ago</span>
              </div>
              {candidateData.aiScore?.overallScore && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-amber-500 text-amber-500" />
                  <span className="text-xs lg:text-sm font-medium">
                    AI Score: {candidateData.aiScore.overallScore}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onEmailClick?.()}>
            <Mail className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Email</span>
          </Button>
          {candidateData.resumeUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(candidateData.resumeUrl, "_blank")}
            >
              <Download className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Resume</span>
            </Button>
          )}
        </div>
      </div>

      {/* Job Context */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 shrink-0">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Applied For</p>
              <h3 className="font-semibold text-base lg:text-lg truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                {job.location && (
                  <span className="truncate">
                    {job.location.city && job.location.country
                      ? `${job.location.city}, ${job.location.country}`
                      : job.location.city || job.location.country || ""}
                  </span>
                )}
                {job.location && job.type && <span>•</span>}
                {job.type && (
                  <span className="capitalize">
                    {job.type.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="font-medium text-sm truncate">
                  {candidate.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {candidate.phone && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2.5 shrink-0">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium text-sm truncate">
                    {candidate.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(candidate.address ||
          (candidateData.experience &&
            candidateData.experience.length > 0 &&
            candidateData.experience[0].location)) && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2.5 shrink-0">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Location
                  </p>
                  <p className="font-medium text-sm truncate">
                    {candidate.address
                      ? `${candidate.address.city}, ${candidate.address.country}`
                      : candidateData.experience[0].location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-11 p-1 bg-card border border-border w-full inline-flex">
          <TabsTrigger
            value="overview"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger
            value="education"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
          >
            Education
          </TabsTrigger>
          <TabsTrigger
            value="interviews"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
          >
            Interviews
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
          >
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
                {candidateData.summary ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidateData.summary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidateData.experience &&
                    candidateData.experience.length > 0 &&
                    candidateData.experience[0].title
                      ? `Professional with experience as ${candidateData.experience[0].title}`
                      : "Professional candidate"}
                    {candidateData.experience &&
                      candidateData.experience.length > 0 &&
                      candidateData.experience[0].company &&
                      ` at ${candidateData.experience[0].company}`}
                    .
                  </p>
                )}
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
                    <span className="text-3xl font-bold text-primary">
                      {candidateData.experience?.length || 0}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {candidateData.experience?.length === 1
                        ? "position"
                        : "positions"}
                    </span>
                  </div>
                  {candidateData.experience &&
                    candidateData.experience.length > 0 &&
                    candidateData.experience[0].company && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          Most recent
                        </p>
                        <p className="font-medium text-sm">
                          {candidateData.experience[0].company}
                        </p>
                        {candidateData.experience[0].title && (
                          <p className="text-xs text-muted-foreground">
                            {candidateData.experience[0].title}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            {candidateData.languages && candidateData.languages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidateData.languages.map(
                      (lang: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium text-sm">{lang}</span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {candidateData.certifications &&
              candidateData.certifications.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="h-4 w-4" />
                      Certifications ({candidateData.certifications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.certifications.map(
                        (cert: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-2.5 py-1 font-normal"
                          >
                            <Award className="h-3 w-3 mr-1.5" />
                            {cert}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* AI Assessment */}
            {candidateData.aiScore && (
              <Card className="lg:col-span-2 border-amber-200 dark:border-amber-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-4 w-4 text-amber-500" />
                    AI Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Score and Recommendation */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Overall Score
                        </p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {candidateData.aiScore.overallScore}%
                        </p>
                      </div>
                      {candidateData.aiScore.recommendation && (
                        <Badge
                          variant={
                            candidateData.aiScore.recommendation ===
                            "excellent_fit"
                              ? "success"
                              : candidateData.aiScore.recommendation ===
                                "good_fit"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {candidateData.aiScore.recommendation
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>

                    {/* Strengths */}
                    {candidateData.aiScore.strengths &&
                      candidateData.aiScore.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-400">
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {candidateData.aiScore.strengths.map(
                              (strength: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-0.5">
                                    ✓
                                  </span>
                                  <span>{strength}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Concerns */}
                    {candidateData.aiScore.concerns &&
                      candidateData.aiScore.concerns.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-amber-700 dark:text-amber-400">
                            Areas of Concern
                          </h4>
                          <ul className="space-y-1">
                            {candidateData.aiScore.concerns.map(
                              (concern: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-amber-500 mt-0.5">
                                    ⚠
                                  </span>
                                  <span>{concern}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Experience Details */}
            {candidateData.experience &&
              candidateData.experience.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4" />
                      Work Experience ({candidateData.experience.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {}
                      {candidateData.experience.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (exp: any, index: number) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="rounded-lg bg-blue-500/10 p-2.5 h-fit shrink-0">
                              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base mb-1">
                                {exp.title || exp.position || "Position"}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exp.company &&
                                exp.company.toLowerCase() !== "company"
                                  ? exp.company
                                  : "Company Name Not Specified"}
                              </p>
                              {(exp.startDate ||
                                exp.endDate ||
                                exp.location) && (
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  {(exp.startDate || exp.endDate) && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>
                                        {exp.startDate
                                          ? new Date(
                                              exp.startDate
                                            ).getFullYear()
                                          : "N/A"}{" "}
                                        -{" "}
                                        {exp.endDate
                                          ? new Date(exp.endDate).getFullYear()
                                          : "Present"}
                                      </span>
                                    </div>
                                  )}
                                  {exp.location && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5" />
                                      <span>{exp.location}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
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
                  {candidateData.skills?.length || 0} skills
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {candidateData.skills && candidateData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidateData.skills.map((skill: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-base font-medium text-foreground mb-2">
                    No Skills Data Available
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Skills information will be extracted from the resume during
                    the application approval process.
                  </p>
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
              {candidateData.education && candidateData.education.length > 0 ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {candidateData.education.map((edu: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="rounded-lg bg-primary/10 p-2.5 h-fit shrink-0">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-1">
                          {edu.degree || "Degree"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {edu.institution || edu.school || "Institution"}
                        </p>
                        {(edu.startDate || edu.endDate) && (
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {edu.startDate
                                  ? new Date(edu.startDate).getFullYear()
                                  : "N/A"}{" "}
                                -{" "}
                                {edu.endDate
                                  ? new Date(edu.endDate).getFullYear()
                                  : "Present"}
                              </span>
                            </div>
                            {edu.field && (
                              <Badge variant="outline" className="text-xs">
                                {edu.field}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-base font-medium text-foreground mb-2">
                    No Education Data Available
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Education information will be extracted from the resume
                    during the application approval process.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Interview Management
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  View interview history and schedule new interviews with this
                  candidate for {job.title}
                </p>
                <Button onClick={() => onInterviewClick?.()}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Interviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Job-Specific Activity Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete activity history for this job including stage changes,
                interviews, and communications
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingInterviews ? (
                <div className="text-center py-8">
                  <Loader size="sm" text="Loading timeline..." />
                </div>
              ) : (
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
                        <h4 className="font-semibold text-sm">
                          Application Submitted
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {daysSinceApplied} days ago
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(candidateData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Interview Events */}
                  {interviews.map((interview) => (
                    <div key={interview.id} className="relative">
                      <div
                        className={`absolute -left-8 top-0.5 rounded-full p-2 ring-4 ring-background ${
                          interview.status === "completed"
                            ? "bg-green-500"
                            : interview.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      >
                        {interview.status === "completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Video className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">
                            {interview.status === "completed"
                              ? "Interview Completed"
                              : interview.status === "cancelled"
                              ? "Interview Cancelled"
                              : "Interview Scheduled"}
                          </h4>
                          <Badge
                            variant={
                              interview.status === "completed"
                                ? "success"
                                : interview.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {interview.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{interview.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.scheduledAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        {interview.feedback &&
                          interview.feedback.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium mb-1">
                                Feedback:
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs">
                                  Rating: {interview.feedback[0].rating}/5 ⭐
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {interview.feedback[0].recommendation?.replace(
                                    "_",
                                    " "
                                  )}
                                </Badge>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                  {/* AI Score if available */}
                  {candidateData.aiScore?.overallScore && (
                    <div className="relative">
                      <div className="absolute -left-8 top-0.5 rounded-full bg-amber-500 p-2 ring-4 ring-background">
                        <Star className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">
                            AI Assessment
                          </h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-sm">
                              {candidateData.aiScore.overallScore}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {candidateData.aiScore.recommendation?.replace(
                            /_/g,
                            " "
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Status Change Event */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0.5 rounded-full bg-muted p-2 ring-4 ring-background border-2 border-border">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
                          Current Status
                        </h4>
                        <Badge
                          className={cn(
                            "text-xs border",
                            statusColors[status as keyof typeof statusColors] ||
                              "bg-gray-500/10 text-gray-700"
                          )}
                        >
                          {status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          candidateData.updatedAt || candidateData.createdAt
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
