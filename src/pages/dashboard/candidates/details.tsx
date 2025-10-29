import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tagsData from "@/lib/mock-data/tags.json";
import {
  useAppDispatch,
  useAppSelector,
  useCandidates,
  useClients,
  useJobs,
} from "@/store/hooks/index";
import {
  selectCandidateById,
  selectClients,
  selectJobs,
} from "@/store/selectors";
import { fetchCandidateEmails } from "@/store/slices/emailsSlice";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconBriefcase,
  IconCalendar,
  IconCircleCheckFilled,
  IconClockHour4,
  IconDownload,
  IconFileText,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTag,
  IconUserCheck,
  IconUserX,
  IconX,
} from "@tabler/icons-react";
import { CheckCircle2, XCircle } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

// Helper functions for status badges
function getStatusBadge(status: string) {
  switch (status) {
    case "Hired":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
        >
          <IconCircleCheckFilled className="h-3 w-3 mr-1" />
          Hired
        </Badge>
      );
    case "Rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
        >
          <IconUserX className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "Withdrawn":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800"
        >
          <IconUserX className="h-3 w-3 mr-1" />
          Withdrawn
        </Badge>
      );
    case "Offered":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800"
        >
          <IconUserCheck className="h-3 w-3 mr-1" />
          Offered
        </Badge>
      );
    case "Interviewing":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
        >
          <IconClockHour4 className="h-3 w-3 mr-1" />
          Interviewing
        </Badge>
      );
    case "In Process":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
        >
          <IconClockHour4 className="h-3 w-3 mr-1" />
          In Process
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function CandidateDetailsPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [showResumePreview, setShowResumePreview] = React.useState(false);
  const [showVideoPreview, setShowVideoPreview] = React.useState(false);
  const [openTagPopover, setOpenTagPopover] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Fetch data from Redux store
  const dispatch = useAppDispatch();
  const { fetchCandidateById, isLoading: candidatesLoading } = useCandidates();
  const { fetchJobs, isLoading: jobsLoading } = useJobs();
  const { fetchClients, isLoading: clientsLoading } = useClients();

  const candidateData = useAppSelector(selectCandidateById(candidateId || ""));
  const jobs = useAppSelector(selectJobs);
  const clients = useAppSelector(selectClients);
  const emails = useAppSelector((state: any) => state.emails.emails || []);

  React.useEffect(() => {
    if (candidateId) {
      fetchCandidateById(candidateId);
      // Fetch candidate emails
      dispatch(fetchCandidateEmails(candidateId));
    }
    fetchJobs();
    fetchClients();
  }, [candidateId, fetchCandidateById, fetchJobs, fetchClients, dispatch]);

  // Log candidate data for debugging
  React.useEffect(() => {
    if (candidateData) {
      console.log("=== CANDIDATE DATA ===");
      console.log("Full candidate object:", candidateData);
      console.log("Job IDs:", candidateData.jobIds);
      console.log("Job Applications:", candidateData.jobApplications);
      console.log("Skills:", candidateData.skills);
      console.log("Education:", candidateData.education);
      // Backend uses 'experience' field, frontend type has 'workExperience'
      console.log(
        "Work Experience (experience field):",
        (candidateData as unknown as Record<string, unknown>).experience
      );
      console.log(
        "Work Experience (workExperience field):",
        candidateData.workExperience
      );
      console.log("Resume:", candidateData.resume);
      console.log("=====================");
    }
  }, [candidateData]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Loading state
  const isLoading = candidatesLoading || jobsLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            Loading candidate details...
          </div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Candidate not found</div>
          <Button
            onClick={() => navigate("/dashboard/candidates")}
            className="mt-4"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  // Get job and client details
  const firstJobId = candidateData.jobIds?.[0];
  let job: (typeof jobs)[0] | null = null;
  let client: (typeof clients)[0] | null = null;

  if (firstJobId) {
    if (typeof firstJobId === "object" && "title" in firstJobId) {
      // Create a mutable copy and normalize the ID
      job = {
        ...firstJobId,
        id: firstJobId.id || firstJobId._id,
      } as (typeof jobs)[0];
      if (
        job?.clientId &&
        typeof job.clientId === "object" &&
        "companyName" in job.clientId
      ) {
        // Normalize client ID too
        client = {
          ...job.clientId,
          id: job.clientId.id || job.clientId._id,
        } as (typeof clients)[0];
      } else if (job?.clientId) {
        const clientIdStr =
          typeof job.clientId === "object"
            ? job.clientId._id || job.clientId.id
            : job.clientId;
        client = clients.find((c) => c.id === clientIdStr) || null;
      }
    } else {
      job = jobs.find((j) => j.id === firstJobId) || null;
      if (job?.clientId) {
        client = clients.find((c) => c.id === job?.clientId) || null;
      }
    }
  }

  // Log job and client data
  console.log("=== JOB & CLIENT DATA ===");
  console.log("First Job ID:", firstJobId);
  console.log("Job:", job);
  console.log("Client:", client);
  console.log("All Jobs:", jobs);
  console.log("All Clients:", clients);
  console.log("========================");

  const candidate = {
    id: candidateData.id || "",
    firstName: candidateData.firstName,
    lastName: candidateData.lastName,
    fullName: `${candidateData.firstName} ${candidateData.lastName}`,
    email: candidateData.email,
    phone: candidateData.phone || "N/A",
    photo: candidateData.avatar,
    currentTitle: candidateData.currentTitle,
    currentCompany: candidateData.currentCompany,
    yearsOfExperience: candidateData.yearsOfExperience || 0,
    skills: candidateData.skills || [],
    coverLetter: candidateData.coverLetter?.url || candidateData.notes,
    resumeText: candidateData.notes,
    resumeFilename:
      (candidateData as { resumeOriginalName?: string }).resumeOriginalName ||
      candidateData.resume?.name ||
      "resume.pdf",
    resumeFileSize: candidateData.resume?.size
      ? `${Math.round(candidateData.resume.size / 1024)} KB`
      : "N/A",
    resumeUrl:
      (candidateData as { resumeUrl?: string }).resumeUrl ||
      candidateData.resume?.url,
    location: candidateData.address
      ? `${candidateData.address.city}, ${candidateData.address.country}`
      : undefined,
    linkedInUrl: candidateData.linkedInUrl,
    portfolioUrl: candidateData.portfolioUrl,
    githubUrl: candidateData.githubUrl,
    // Use actual status from backend model
    status: (() => {
      const backendStatus = (
        candidateData as {
          status?:
            | "active"
            | "interviewing"
            | "offered"
            | "hired"
            | "rejected"
            | "withdrawn";
        }
      ).status;
      if (!backendStatus) return "In Process";

      switch (backendStatus) {
        case "hired":
          return "Hired";
        case "rejected":
          return "Rejected";
        case "offered":
          return "Offered";
        case "interviewing":
          return "Interviewing";
        case "withdrawn":
          return "Withdrawn";
        case "active":
        default:
          return "In Process";
      }
    })(),
    jobId: job?.id || "N/A",
    jobTitle: job?.title || "N/A",
    currentStage:
      (candidateData as { currentStage?: { name: string } }).currentStage
        ?.name || "Not Assigned",
    clientName: client?.companyName || "N/A",
    clientLogo:
      client?.logo ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${
        client?.companyName || "C"
      }`,
    appliedDate: new Date(candidateData.createdAt).toLocaleDateString(),
    lastStatusChange: new Date(candidateData.updatedAt).toLocaleDateString(),
    rating: undefined as number | undefined, // Backend doesn't have rating in Candidate model
    reviewedBy: (() => {
      const assignedTo = (
        candidateData as {
          assignedTo?: { firstName?: string; lastName?: string };
        }
      ).assignedTo;
      if (assignedTo && typeof assignedTo === "object") {
        return (
          `${assignedTo.firstName || ""} ${assignedTo.lastName || ""}`.trim() ||
          "N/A"
        );
      }
      return "N/A";
    })(),
    teamMembers: [] as string[],
    interviewScheduled: undefined as Date | undefined, // Backend doesn't have this in Candidate model
    totalEmails:
      (candidateData.totalEmailsSent || 0) +
      (candidateData.totalEmailsReceived || 0),
    videoIntroUrl: undefined,
    videoIntroFilename: undefined,
    videoIntroFileSize: undefined,
    videoIntroDuration: undefined,
    // Additional fields from backend - use 'experience' field from backend
    experience:
      (
        candidateData as {
          experience?: Array<{
            company: string;
            title: string;
            duration: string;
            description?: string;
          }>;
        }
      ).experience ||
      candidateData.workExperience ||
      [],
    education: candidateData.education || [],
    certifications: candidateData.certifications || [],
    languages: candidateData.languages || [],
    aiScore: (
      candidateData as {
        aiScore?: {
          overallScore: number;
          skillsMatch: number;
          experienceMatch: number;
          educationMatch: number;
          summary: string;
          strengths: string[];
          concerns: string[];
          recommendation: string;
        };
      }
    ).aiScore,
  };

  // Log transformed candidate object
  console.log("=== TRANSFORMED CANDIDATE ===");
  console.log("Transformed candidate:", candidate);
  console.log("============================");

  // TODO: Replace with real history data from backend - multiple job applications for this candidate
  const historyData: Array<{
    id: string;
    jobTitle: string;
    jobId: string;
    clientName: string;
    appliedDate: string;
    status: string;
    stage: string;
    lastUpdated: string;
  }> = [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with Back Button */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/candidates")}
                className="gap-2"
              >
                <IconArrowLeft className="h-4 w-4" />
                Back to Candidates
              </Button>
            </div>

            {/* Candidate Header Card */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-24 w-24 border-2 rounded-lg flex-shrink-0">
                    <AvatarImage
                      src={candidate.photo || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-semibold rounded-lg">
                      {candidate.firstName[0]}
                      {candidate.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">
                          {candidate.fullName}
                        </h1>
                        {candidate.currentTitle && (
                          <p className="text-muted-foreground flex items-center gap-2">
                            <IconBriefcase className="h-4 w-4" />
                            {candidate.currentTitle}
                            {candidate.currentCompany &&
                              ` at ${candidate.currentCompany}`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(candidate.status)}
                        {candidate.rating && candidate.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < candidate.rating!
                                    ? "fill-amber-500"
                                    : "fill-muted"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconMail className="h-4 w-4" />
                          <a
                            href={`mailto:${candidate.email}`}
                            className="hover:text-foreground truncate"
                          >
                            {candidate.email}
                          </a>
                        </div>
                        {candidate.phone && candidate.phone !== "N/A" && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconPhone className="h-4 w-4" />
                            <a
                              href={`tel:${candidate.phone}`}
                              className="hover:text-foreground"
                            >
                              {candidate.phone}
                            </a>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconMapPin className="h-4 w-4" />
                            <span>{candidate.location}</span>
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    {/* Social Links */}
                    {(candidate.linkedInUrl ||
                      candidate.githubUrl ||
                      candidate.portfolioUrl) && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {candidate.linkedInUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(candidate.linkedInUrl, "_blank")
                            }
                          >
                            <svg
                              className="h-4 w-4 mr-1.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                          </Button>
                        )}
                        {candidate.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(candidate.githubUrl, "_blank")
                            }
                          >
                            <svg
                              className="h-4 w-4 mr-1.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                          </Button>
                        )}
                        {candidate.portfolioUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(candidate.portfolioUrl, "_blank")
                            }
                          >
                            <IconBriefcase className="h-4 w-4 mr-1.5" />
                            Portfolio
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <IconTag className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Tags</Label>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tagsData.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: tag.color,
                          }}
                          className="px-2 py-1 text-xs border"
                        >
                          {tag.name}
                          <button
                            onClick={() => toggleTag(tag.id)}
                            className="ml-1.5 hover:opacity-70"
                          >
                            <IconX className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                    <Popover
                      open={openTagPopover}
                      onOpenChange={setOpenTagPopover}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-dashed"
                        >
                          <IconTag className="h-3 w-3 mr-1" />
                          Add Tag
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            {tagsData.map((tag) => (
                              <CommandItem
                                key={tag.id}
                                onSelect={() => {
                                  toggleTag(tag.id);
                                  setOpenTagPopover(false);
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span>{tag.name}</span>
                                </div>
                                {selectedTags.includes(tag.id) && (
                                  <IconCircleCheckFilled className="h-4 w-4 text-primary" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <div className="px-4 lg:px-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="h-11 p-1 bg-card border border-border w-full inline-flex">
                <TabsTrigger
                  value="overview"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="candidacy"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  Current Candidacy
                </TabsTrigger>
                <TabsTrigger
                  value="communications"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  Communications
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  History
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-sm font-normal"
                          >
                            {typeof skill === "string" ? skill : skill.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Work Experience */}
                {candidate.experience && candidate.experience.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {candidate.experience.map((exp, index) => {
                          const workExp = exp as {
                            company?: string;
                            title?: string;
                            position?: string;
                            duration?: string;
                            description?: string;
                          };
                          const title =
                            workExp.title ||
                            workExp.position ||
                            "Position Not Specified";

                          return (
                            <div
                              key={index}
                              className={`pb-4 ${
                                index !== candidate.experience.length - 1
                                  ? "border-b"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm">
                                    {title}
                                  </h4>
                                  {workExp.company && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <IconBriefcase className="h-3 w-3" />
                                      {workExp.company}
                                    </p>
                                  )}
                                </div>
                                {workExp.duration && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs whitespace-nowrap"
                                  >
                                    {workExp.duration}
                                  </Badge>
                                )}
                              </div>
                              {workExp.description && (
                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line leading-relaxed">
                                  {workExp.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {candidate.education && candidate.education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {candidate.education.map((edu, index) => {
                          const education = edu as {
                            institution?: string;
                            degree?: string;
                            field?: string;
                            year?: string;
                          };

                          return (
                            <div
                              key={index}
                              className={`pb-4 ${
                                index !== candidate.education.length - 1
                                  ? "border-b"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm">
                                    {education.degree || "Degree Not Specified"}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {education.institution ||
                                      "Institution Not Specified"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {education.year && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {education.year}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {education.field && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Field: {education.field}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Qualifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Certifications */}
                  {candidate.certifications &&
                    candidate.certifications.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Certifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {candidate.certifications.map((cert, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <IconCircleCheckFilled className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{cert}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                  {/* Languages */}
                  {candidate.languages && candidate.languages.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {candidate.languages.map((lang, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm font-normal"
                            >
                              {typeof lang === "string" ? lang : lang.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* AI Score & Analysis */}
                {candidate.aiScore && (
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          AI Candidate Analysis
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`${
                            candidate.aiScore.overallScore >= 80
                              ? "bg-green-100 text-green-700 border-green-200"
                              : candidate.aiScore.overallScore >= 60
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : candidate.aiScore.overallScore >= 40
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {candidate.aiScore.recommendation
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Overall Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Overall Match Score
                          </Label>
                          <span className="text-2xl font-bold text-primary">
                            {candidate.aiScore.overallScore}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              candidate.aiScore.overallScore >= 80
                                ? "bg-green-600"
                                : candidate.aiScore.overallScore >= 60
                                ? "bg-blue-600"
                                : candidate.aiScore.overallScore >= 40
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                            style={{
                              width: `${candidate.aiScore.overallScore}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Detailed Scores */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Skills Match
                          </Label>
                          <p className="text-xl font-bold mt-1">
                            {candidate.aiScore.skillsMatch}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Experience Match
                          </Label>
                          <p className="text-xl font-bold mt-1">
                            {candidate.aiScore.experienceMatch}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Education Match
                          </Label>
                          <p className="text-xl font-bold mt-1">
                            {candidate.aiScore.educationMatch}%
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      {candidate.aiScore.summary && (
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          <Label className="text-xs text-muted-foreground mb-1.5 block">
                            AI Summary
                          </Label>
                          <p className="text-sm leading-relaxed">
                            {candidate.aiScore.summary}
                          </p>
                        </div>
                      )}

                      {/* Strengths */}
                      {candidate.aiScore.strengths &&
                        candidate.aiScore.strengths.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                              Strengths
                            </Label>
                            <ul className="space-y-1.5">
                              {candidate.aiScore.strengths.map(
                                (strength, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span className="text-green-600 mt-0.5">
                                      •
                                    </span>
                                    <span>{strength}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Concerns */}
                      {candidate.aiScore.concerns &&
                        candidate.aiScore.concerns.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <IconX className="h-4 w-4 text-amber-600" />
                              Areas for Consideration
                            </Label>
                            <ul className="space-y-1.5">
                              {candidate.aiScore.concerns.map(
                                (concern, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span className="text-amber-600 mt-0.5">
                                      •
                                    </span>
                                    <span>{concern}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                {(candidate.resumeFilename || candidate.videoIntroUrl) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Documents & Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Resume */}
                      {candidate.resumeFilename && (
                        <div className="rounded-lg border overflow-hidden">
                          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="rounded-md bg-background p-2 border">
                                <IconFileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {candidate.resumeFilename}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setShowResumePreview(!showResumePreview)
                                }
                                className="h-8 px-3"
                              >
                                <span className="text-xs">
                                  {showResumePreview ? "Hide" : "View"}
                                </span>
                              </Button>
                              {candidate.resumeUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(candidate.resumeUrl, "_blank")
                                  }
                                >
                                  <IconDownload className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {showResumePreview && (
                            <div className="border-t">
                              {candidate.resumeUrl ? (
                                candidate.resumeUrl
                                  .toLowerCase()
                                  .endsWith(".pdf") ? (
                                  <div className="relative bg-muted/30">
                                    <iframe
                                      src={`${candidate.resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                      className="w-full h-[600px]"
                                      title="Resume Preview"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-12 text-center bg-muted/30">
                                    <IconFileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground mb-1">
                                      PDF Preview Only
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Download the file to view
                                    </p>
                                  </div>
                                )
                              ) : candidate.resumeText ? (
                                <div className="max-h-[600px] overflow-y-auto p-4 bg-muted/30">
                                  <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                                    {candidate.resumeText}
                                  </pre>
                                </div>
                              ) : (
                                <div className="p-12 text-center bg-muted/30">
                                  <IconFileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Preview not available
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Download the file to view
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Video Introduction */}
                      {candidate.videoIntroUrl && (
                        <div className="rounded-lg border overflow-hidden">
                          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="rounded-md bg-background p-2 border">
                                <IconFileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {candidate.videoIntroFilename ||
                                    "Video Introduction"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  {candidate.videoIntroDuration && (
                                    <span>{candidate.videoIntroDuration}</span>
                                  )}
                                  {candidate.videoIntroFileSize && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {candidate.videoIntroFileSize}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setShowVideoPreview(!showVideoPreview)
                                }
                                className="h-8 px-3"
                              >
                                <span className="text-xs">
                                  {showVideoPreview ? "Hide" : "View"}
                                </span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconDownload className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {showVideoPreview && (
                            <div className="border-t bg-black flex items-center justify-center">
                              <video
                                controls
                                className="w-full h-[600px] object-contain"
                                preload="metadata"
                                poster={candidate.photo || undefined}
                              >
                                <source
                                  src={candidate.videoIntroUrl}
                                  type="video/mp4"
                                />
                                <source
                                  src={candidate.videoIntroUrl}
                                  type="video/webm"
                                />
                                <source
                                  src={candidate.videoIntroUrl}
                                  type="video/ogg"
                                />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Cover Letter */}
                {candidate.coverLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cover Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {candidate.coverLetter}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Current Candidacy Tab */}
              <TabsContent value="candidacy" className="mt-6 space-y-6">
                {/* Current Application Card */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 rounded-md border-2">
                          <AvatarImage src={candidate.clientLogo} />
                          <AvatarFallback className="rounded-md">
                            {candidate.clientName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {candidate.jobTitle}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {candidate.clientName}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(candidate.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job Information Grid */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Job Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">
                            Job ID
                          </Label>
                          <p className="text-sm font-medium font-mono mt-1">
                            {candidate.jobId}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">
                            Client
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {candidate.clientName}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">
                            Job Title
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {candidate.jobTitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Application Progress */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Application Progress
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Current Stage
                          </Label>
                          <p className="text-sm font-semibold mt-1 text-primary">
                            {candidate.currentStage}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Applied Date
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {candidate.appliedDate}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">
                            Last Updated
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {candidate.lastStatusChange}
                          </p>
                        </div>
                        {candidate.interviewScheduled && (
                          <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                            <Label className="text-xs text-amber-700 dark:text-amber-400">
                              Next Interview
                            </Label>
                            <p className="text-sm font-semibold mt-1 text-amber-800 dark:text-amber-300">
                              {new Date(
                                candidate.interviewScheduled
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating & Feedback */}
                    {candidate.rating && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">
                          Rating & Feedback
                        </h4>
                        <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <IconCircleCheckFilled
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(candidate.rating!)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                              {candidate.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / 5.0
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Based on interview feedback and assessments
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Team Assignment */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Team Assignment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Reviewed By
                          </Label>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {candidate.reviewedBy
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {candidate.reviewedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Stats */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Communication Statistics
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                          <Label className="text-xs text-blue-700 dark:text-blue-400">
                            Total Emails
                          </Label>
                          <p className="text-2xl font-bold mt-1 text-blue-800 dark:text-blue-300">
                            {candidate.totalEmails}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                          <Label className="text-xs text-green-700 dark:text-green-400">
                            Sent
                          </Label>
                          <p className="text-2xl font-bold mt-1 text-green-800 dark:text-green-300">
                            {Math.floor(candidate.totalEmails * 0.6)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                          <Label className="text-xs text-purple-700 dark:text-purple-400">
                            Received
                          </Label>
                          <p className="text-2xl font-bold mt-1 text-purple-800 dark:text-purple-300">
                            {Math.ceil(candidate.totalEmails * 0.4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Communication Timeline */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">
                        Communication History
                      </h4>
                      <div className="space-y-3">
                        {emails && emails.length > 0 ? (
                          emails.slice(0, 3).map((email: any) => (
                            <div
                              key={email._id || email.id}
                              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                            >
                              <div
                                className={`p-2 rounded-md ${
                                  email.direction === "outbound"
                                    ? "bg-blue-100 dark:bg-blue-900/30"
                                    : "bg-green-100 dark:bg-green-900/30"
                                }`}
                              >
                                <IconMail
                                  className={`h-4 w-4 ${
                                    email.direction === "outbound"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-green-600 dark:text-green-400"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium">
                                    {email.subject}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {email.direction === "outbound"
                                      ? "Sent"
                                      : "Received"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <IconCalendar className="h-3 w-3" />
                                  {email.sentAt
                                    ? new Date(email.sentAt).toLocaleString()
                                    : email.receivedAt
                                    ? new Date(
                                        email.receivedAt
                                      ).toLocaleString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No communications yet
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <IconMail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconCalendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconUserCheck className="h-4 w-4 mr-2" />
                        Move to Next Stage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communications Tab */}
              <TabsContent value="communications" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Email Communication History
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      All email communications with this candidate across all
                      jobs
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconMail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <Label className="text-xs text-blue-700 dark:text-blue-400">
                            Total Emails
                          </Label>
                        </div>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {emails?.length || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <Label className="text-xs text-green-700 dark:text-green-400">
                            Sent
                          </Label>
                        </div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          {emails?.filter(
                            (e: any) => e.direction === "outbound"
                          ).length || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconArrowDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <Label className="text-xs text-purple-700 dark:text-purple-400">
                            Received
                          </Label>
                        </div>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                          {emails?.filter((e: any) => e.direction === "inbound")
                            .length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Job-wise Communication Summary */}
                    <div className="space-y-4">
                      {/* Current Job */}
                      <div className="p-4 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Avatar className="h-10 w-10 rounded-md border-2 border-primary/20 flex-shrink-0">
                              <AvatarImage src={candidate.clientLogo} />
                              <AvatarFallback className="rounded-md text-xs">
                                {candidate.clientName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                {candidate.jobTitle}
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {candidate.clientName}
                              </p>
                              <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">
                                    Job ID
                                  </Label>
                                  <p className="font-mono mt-0.5">
                                    {candidate.jobId}
                                  </p>
                                </div>
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">
                                    Total Emails
                                  </Label>
                                  <p className="font-semibold mt-0.5">
                                    {emails?.length || 0}
                                  </p>
                                </div>
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">
                                    Last Contact
                                  </Label>
                                  <p className="mt-0.5">
                                    {emails && emails.length > 0
                                      ? new Date(
                                          emails[0].sentAt ||
                                            emails[0].receivedAt
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() =>
                            navigate(
                              `/dashboard/jobs/pipeline/${candidate.jobId}`
                            )
                          }
                        >
                          <IconMail className="h-4 w-4 mr-2" />
                          View Full Communication Details
                        </Button>
                      </div>

                      {/* Previous Jobs */}
                      {historyData.map((history) => {
                        // Mock email data for past jobs
                        const emailCount = Math.floor(Math.random() * 8) + 2; // 2-9 emails
                        const sentCount = Math.floor(emailCount * 0.6);
                        const receivedCount = emailCount - sentCount;
                        const lastEmailDate = history.lastUpdated;

                        return (
                          <div
                            key={history.id}
                            className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 rounded-md border flex-shrink-0">
                                  <AvatarFallback className="rounded-md text-xs">
                                    {history.clientName
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1">
                                    {history.jobTitle}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {history.clientName}
                                  </p>
                                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">
                                        Job ID
                                      </Label>
                                      <p className="font-mono mt-0.5">
                                        {history.jobId}
                                      </p>
                                    </div>
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">
                                        Total Emails
                                      </Label>
                                      <p className="font-semibold mt-0.5">
                                        {emailCount}
                                      </p>
                                      <p className="text-muted-foreground mt-0.5">
                                        {sentCount} sent, {receivedCount}{" "}
                                        received
                                      </p>
                                    </div>
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">
                                        Last Contact
                                      </Label>
                                      <p className="mt-0.5">{lastEmailDate}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() =>
                                navigate(
                                  `/dashboard/jobs/pipeline/${history.jobId}`
                                )
                              }
                            >
                              <IconMail className="h-4 w-4 mr-2" />
                              View Communication Details
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Empty State */}
                    {historyData.length === 0 &&
                      (!emails || emails.length === 0) && (
                        <div className="text-center py-12">
                          <IconMail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground mb-1">
                            No email communications yet
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Start communicating with this candidate to see the
                            history here
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Quick Email Action */}
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <IconMail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Send Email</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Quickly compose and send an email to this candidate
                          from the current job context.
                        </p>
                        <Button variant="outline" size="sm">
                          <IconMail className="h-4 w-4 mr-2" />
                          Compose Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-6 space-y-6">
                {/* Warning Banner for Previous Interactions */}
                {historyData.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                          <IconCalendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                            Previous Client Interactions Found
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                            This candidate has {historyData.length} previous
                            application{historyData.length !== 1 ? "s" : ""}{" "}
                            with{" "}
                            {new Set(historyData.map((h) => h.clientName)).size}{" "}
                            client
                            {new Set(historyData.map((h) => h.clientName))
                              .size !== 1
                              ? "s"
                              : ""}
                            . Please review their interview history below before
                            submitting to the same clients.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(
                              new Set(historyData.map((h) => h.clientName))
                            ).map((clientName, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700"
                              >
                                {clientName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Interview History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Interview History
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete interview history with all clients - prevents
                      re-submitting to clients who previously rejected this
                      candidate
                    </p>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // TODO: Replace with real interview data from backend
                      const candidateInterviews: Array<{
                        id: string;
                        date: string;
                        type: string;
                        status: string;
                        feedback: string;
                        interviewer: string;
                        outcome?: string;
                        jobTitle?: string;
                        interviewType?: string;
                        clientName?: string;
                        interviewerName?: string;
                        interviewDate?: string;
                        duration?: number;
                        rating?: number;
                        notes?: string;
                      }> = [];

                      if (candidateInterviews.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <IconCalendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                              No interview history
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This candidate hasn't interviewed with any clients
                              yet
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {candidateInterviews.map((interview) => {
                            const isCompleted =
                              interview.status === "completed";
                            const isPassed = interview.outcome === "passed";
                            const isFailed = interview.outcome === "failed";
                            const isNoShow = interview.status === "no_show";

                            return (
                              <div
                                key={interview.id}
                                className={`p-4 rounded-lg border ${
                                  isPassed
                                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                                    : isFailed
                                    ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                                    : isNoShow
                                    ? "bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700"
                                    : "bg-card"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold">
                                        {interview.jobTitle}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          interview.interviewType ===
                                          "technical"
                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                            : interview.interviewType ===
                                              "final"
                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                        }`}
                                      >
                                        {interview.interviewType?.replace(
                                          "_",
                                          " "
                                        ) || "N/A"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <IconBriefcase className="h-3 w-3" />
                                      {interview.clientName}
                                    </p>
                                    {interview.interviewerName && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Interviewed by:{" "}
                                        {interview.interviewerName}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {isCompleted ? (
                                      isPassed ? (
                                        <Badge className="bg-green-600">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Passed
                                        </Badge>
                                      ) : isFailed ? (
                                        <Badge variant="destructive">
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Not Selected
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          Completed
                                        </Badge>
                                      )
                                    ) : isNoShow ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-200 text-gray-700"
                                      >
                                        No Show
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-100 text-blue-700"
                                      >
                                        Scheduled
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      Interview Date
                                    </Label>
                                    <p className="text-xs mt-1 flex items-center gap-1">
                                      <IconCalendar className="h-3 w-3" />
                                      {interview.interviewDate
                                        ? new Date(
                                            interview.interviewDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      Duration
                                    </Label>
                                    <p className="text-xs mt-1">
                                      {interview.duration
                                        ? `${interview.duration} min`
                                        : "N/A"}
                                    </p>
                                  </div>
                                  {interview.rating && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Rating
                                      </Label>
                                      <p className="text-xs mt-1 flex items-center gap-1">
                                        <span className="text-yellow-600">
                                          ★
                                        </span>
                                        {interview.rating}/5
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      Status
                                    </Label>
                                    <p className="text-xs mt-1 capitalize">
                                      {interview.status.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>

                                {interview.feedback && (
                                  <div className="pt-3 border-t">
                                    <Label className="text-xs text-muted-foreground">
                                      Feedback
                                    </Label>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                      {interview.feedback}
                                    </p>
                                  </div>
                                )}

                                {interview.notes && (
                                  <div className="pt-2">
                                    <Label className="text-xs text-muted-foreground">
                                      Notes
                                    </Label>
                                    <p className="text-sm mt-1 text-muted-foreground italic">
                                      {interview.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Application History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Application History
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      All past applications and interactions in the platform
                    </p>
                  </CardHeader>
                  <CardContent>
                    {historyData.length > 0 ? (
                      <div className="space-y-4">
                        {historyData.map((history) => (
                          <div
                            key={history.id}
                            className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h4 className="font-semibold">
                                  {history.jobTitle}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {history.clientName}
                                </p>
                              </div>
                              {getStatusBadge(history.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Job ID
                                </Label>
                                <p className="font-mono text-xs mt-1">
                                  {history.jobId}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Applied
                                </Label>
                                <p className="text-xs mt-1">
                                  {history.appliedDate}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Final Stage
                                </Label>
                                <p className="text-xs mt-1">{history.stage}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Last Updated
                                </Label>
                                <p className="text-xs mt-1">
                                  {history.lastUpdated}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <IconClockHour4 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          No previous applications
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Note about re-applying */}
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <IconUserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          Apply to Future Jobs
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          This candidate can be assigned to any future job
                          openings. Their profile and documents are saved in the
                          system.
                        </p>
                        <Button variant="outline" size="sm">
                          Assign to New Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
