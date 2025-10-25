import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconArrowLeft,
  IconArrowUp,
  IconArrowDown,
  IconBriefcase,
  IconCalendar,
  IconCircleCheckFilled,
  IconClockHour4,
  IconDownload,
  IconFileText,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUserCheck,
  IconUserX,
  IconTag,
  IconX,
} from "@tabler/icons-react";
import { CheckCircle2, XCircle } from "lucide-react";
import applicationsData from "@/lib/mock-data/applications.json";
import interviewsData from "@/lib/mock-data/interviews.json";
import tagsData from "@/lib/mock-data/tags.json";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

// Mock stages and clients for demonstration
const stages = ["New Application", "Screening", "Interview", "Assessment", "Offer", "Hired"];
const clients = [
  { name: "Tech Corp Inc.", logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC" },
  { name: "Innovation Labs", logo: "https://api.dicebear.com/7.x/initials/svg?seed=IL" },
  { name: "Global Solutions", logo: "https://api.dicebear.com/7.x/initials/svg?seed=GS" },
  { name: "StartUp Hub", logo: "https://api.dicebear.com/7.x/initials/svg?seed=SH" },
  { name: "Enterprise Co.", logo: "https://api.dicebear.com/7.x/initials/svg?seed=EC" },
];

// Mock communications data
const mockCommunications = [
  {
    id: 1,
    type: "email",
    subject: "Application Received - Acknowledgment",
    date: "2024-01-15 10:30 AM",
    direction: "outbound",
  },
  {
    id: 2,
    type: "email",
    subject: "Interview Invitation - Technical Round",
    date: "2024-01-18 02:15 PM",
    direction: "outbound",
  },
  {
    id: 3,
    type: "email",
    subject: "Re: Interview Confirmation",
    date: "2024-01-18 03:45 PM",
    direction: "inbound",
  },
  {
    id: 4,
    type: "email",
    subject: "Follow-up After Interview",
    date: "2024-01-22 09:00 AM",
    direction: "outbound",
  },
];

export default function CandidateDetailsPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [showResumePreview, setShowResumePreview] = React.useState(false);
  const [showVideoPreview, setShowVideoPreview] = React.useState(false);
  const [openTagPopover, setOpenTagPopover] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>(["tag-1", "tag-3"]); // Mock initial tags

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Find the candidate data (mock)
  const candidateIndex = candidateId ? parseInt(candidateId) - 1 : 0;
  const app = applicationsData[candidateIndex] || applicationsData[0];
  
  const clientIndex = candidateIndex % clients.length;
  
  // Mock job titles
  const jobTitles = [
    "Senior Full Stack Developer",
    "Product Manager",
    "UX/UI Designer",
    "Data Scientist",
    "DevOps Engineer",
  ];
  
  // Mock team members
  const teamMembersPool = ["John Smith", "Sarah Wilson", "Mike Johnson", "Lisa Brown", "Tom Davis"];
  const teamMemberCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...teamMembersPool].sort(() => 0.5 - Math.random());
  const assignedTeamMembers = shuffled.slice(0, teamMemberCount);
  
  const candidate = {
    id: candidateId || "1",
    firstName: app.firstName,
    lastName: app.lastName,
    fullName: `${app.firstName} ${app.lastName}`,
    email: app.email,
    phone: app.phone,
    photo: app.photo,
    currentTitle: app.currentTitle,
    currentCompany: app.currentCompany,
    yearsOfExperience: app.yearsOfExperience,
    skills: app.skills,
    coverLetter: app.coverLetter,
    resumeText: app.resumeText,
    resumeFilename: app.resume?.filename,
    resumeFileSize: app.resume?.size ? `${Math.round(app.resume.size / 1024)} KB` : undefined,
    location: app.address,
    linkedInUrl: app.linkedInUrl,
    portfolioUrl: app.portfolioUrl,
    status: app.status === "pending" ? "In Process" : app.status === "approved" ? "Hired" : "Rejected",
    jobId: app.targetJobId || `JOB-${String(candidateIndex + 1).padStart(3, '0')}`,
    jobTitle: jobTitles[candidateIndex % jobTitles.length],
    currentStage: stages[candidateIndex % stages.length],
    clientName: clients[clientIndex].name,
    clientLogo: clients[clientIndex].logo,
    appliedDate: new Date(app.submittedAt).toLocaleDateString(),
    lastStatusChange: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    rating: candidateIndex % 2 === 0 ? 4.5 : undefined,
    reviewedBy: app.reviewedBy || "John Smith",
    teamMembers: assignedTeamMembers,
    interviewScheduled: candidateIndex < 3 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : undefined,
    totalEmails: Math.floor(Math.random() * 10) + 4,
    // Video introduction data (for first candidate)
    videoIntroUrl: candidateIndex === 0 ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined,
    videoIntroFilename: candidateIndex === 0 ? "video_introduction.mp4" : undefined,
    videoIntroFileSize: candidateIndex === 0 ? "15.2 MB" : undefined,
    videoIntroDuration: candidateIndex === 0 ? "2:30" : undefined,
  };

  // Mock history data - simulate past applications
  const historyData = [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      jobId: "JOB-001",
      clientName: "Tech Corp Inc.",
      appliedDate: "2023-08-15",
      status: "Rejected",
      stage: "Interview",
      lastUpdated: "2023-09-02",
    },
    {
      id: "2",
      jobTitle: "Frontend Developer",
      jobId: "JOB-045",
      clientName: "StartUp Hub",
      appliedDate: "2023-11-20",
      status: "Hired",
      stage: "Hired",
      lastUpdated: "2023-12-15",
    },
  ];

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
                    <AvatarImage src={candidate.photo || ""} className="object-cover" />
                    <AvatarFallback className="text-2xl font-semibold rounded-lg">
                      {candidate.firstName[0]}
                      {candidate.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{candidate.fullName}</h1>
                        {candidate.currentTitle && (
                          <p className="text-muted-foreground flex items-center gap-2">
                            <IconBriefcase className="h-4 w-4" />
                            {candidate.currentTitle}
                            {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(candidate.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconMail className="h-4 w-4" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-foreground">
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconPhone className="h-4 w-4" />
                          <a href={`tel:${candidate.phone}`} className="hover:text-foreground">
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
                      {candidate.yearsOfExperience && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IconBriefcase className="h-4 w-4" />
                          <span>{candidate.yearsOfExperience} years experience</span>
                        </div>
                      )}
                    </div>

                    {candidate.linkedInUrl || candidate.portfolioUrl ? (
                      <div className="flex gap-2 mt-4">
                        {candidate.linkedInUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={candidate.linkedInUrl} target="_blank" rel="noopener noreferrer">
                              LinkedIn Profile
                            </a>
                          </Button>
                        )}
                        {candidate.portfolioUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                              Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : null}
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
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
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
                    <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
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
                <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="candidacy" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
                  Current Candidacy
                </TabsTrigger>
                <TabsTrigger value="communications" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
                  Communications
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground">
                  History
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {candidate.currentTitle && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Current Position</Label>
                          <p className="text-sm font-medium mt-1">{candidate.currentTitle}</p>
                        </div>
                      )}
                      {candidate.currentCompany && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Current Company</Label>
                          <p className="text-sm font-medium mt-1">{candidate.currentCompany}</p>
                        </div>
                      )}
                      {candidate.yearsOfExperience && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Years of Experience</Label>
                          <p className="text-sm font-medium mt-1">{candidate.yearsOfExperience} years</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="text-sm font-medium mt-1">
                          <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                            {candidate.email}
                          </a>
                        </p>
                      </div>
                      {candidate.phone && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <p className="text-sm font-medium mt-1">
                            <a href={`tel:${candidate.phone}`} className="text-primary hover:underline">
                              {candidate.phone}
                            </a>
                          </p>
                        </div>
                      )}
                      {candidate.location && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Location</Label>
                          <p className="text-sm font-medium mt-1">{candidate.location}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                {(candidate.resumeFilename || candidate.videoIntroUrl) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documents & Media</CardTitle>
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
                                <p className="text-sm font-medium truncate">{candidate.resumeFilename}</p>
                                {candidate.resumeFileSize && (
                                  <p className="text-xs text-muted-foreground">{candidate.resumeFileSize}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResumePreview(!showResumePreview)}
                                className="h-8 px-3"
                              >
                                <span className="text-xs">
                                  {showResumePreview ? "Hide" : "View"}
                                </span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconDownload className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {showResumePreview && (
                            <div className="border-t">
                              {candidate.resumeFilename.toLowerCase().endsWith(".pdf") ? (
                                <div className="relative bg-muted/30">
                                  <iframe
                                    src={`/uploads/resumes/${candidate.resumeFilename}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                    className="w-full h-[600px]"
                                    title="Resume Preview"
                                  />
                                </div>
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
                                  {candidate.videoIntroFilename || "Video Introduction"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  {candidate.videoIntroDuration && (
                                    <span>{candidate.videoIntroDuration}</span>
                                  )}
                                  {candidate.videoIntroFileSize && (
                                    <>
                                      <span>•</span>
                                      <span>{candidate.videoIntroFileSize}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowVideoPreview(!showVideoPreview)}
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
                                <source src={candidate.videoIntroUrl} type="video/mp4" />
                                <source src={candidate.videoIntroUrl} type="video/webm" />
                                <source src={candidate.videoIntroUrl} type="video/ogg" />
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
                            {candidate.clientName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{candidate.jobTitle}</CardTitle>
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
                      <h4 className="text-sm font-semibold mb-3">Job Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">Job ID</Label>
                          <p className="text-sm font-medium font-mono mt-1">{candidate.jobId}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">Client</Label>
                          <p className="text-sm font-medium mt-1">{candidate.clientName}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <Label className="text-xs text-muted-foreground">Job Title</Label>
                          <p className="text-sm font-medium mt-1">{candidate.jobTitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Application Progress */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Application Progress</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">Current Stage</Label>
                          <p className="text-sm font-semibold mt-1 text-primary">{candidate.currentStage}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">Applied Date</Label>
                          <p className="text-sm font-medium mt-1">{candidate.appliedDate}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground">Last Updated</Label>
                          <p className="text-sm font-medium mt-1">{candidate.lastStatusChange}</p>
                        </div>
                        {candidate.interviewScheduled && (
                          <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                            <Label className="text-xs text-amber-700 dark:text-amber-400">Next Interview</Label>
                            <p className="text-sm font-semibold mt-1 text-amber-800 dark:text-amber-300">
                              {candidate.interviewScheduled}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating & Feedback */}
                    {candidate.rating && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Rating & Feedback</h4>
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
                            <span className="text-sm text-muted-foreground">/ 5.0</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Based on interview feedback and assessments
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Team Assignment */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Team Assignment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground mb-2 block">Reviewed By</Label>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {candidate.reviewedBy.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{candidate.reviewedBy}</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Label className="text-xs text-muted-foreground mb-2 block">Assigned Team Members</Label>
                          <div className="flex items-center gap-1">
                            {candidate.teamMembers.slice(0, 3).map((member, idx) => (
                              <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="text-xs">
                                  {member.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {candidate.teamMembers.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium">+{candidate.teamMembers.length - 3}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground ml-2">
                              {candidate.teamMembers.length} member{candidate.teamMembers.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Stats */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Communication Statistics</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                          <Label className="text-xs text-blue-700 dark:text-blue-400">Total Emails</Label>
                          <p className="text-2xl font-bold mt-1 text-blue-800 dark:text-blue-300">{candidate.totalEmails}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                          <Label className="text-xs text-green-700 dark:text-green-400">Sent</Label>
                          <p className="text-2xl font-bold mt-1 text-green-800 dark:text-green-300">
                            {Math.floor(candidate.totalEmails * 0.6)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                          <Label className="text-xs text-purple-700 dark:text-purple-400">Received</Label>
                          <p className="text-2xl font-bold mt-1 text-purple-800 dark:text-purple-300">
                            {Math.ceil(candidate.totalEmails * 0.4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Communication Timeline */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Communication History</h4>
                      <div className="space-y-3">
                        {mockCommunications.map((comm) => (
                          <div key={comm.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                            <div className={`p-2 rounded-md ${comm.direction === 'outbound' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                              <IconMail className={`h-4 w-4 ${comm.direction === 'outbound' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{comm.subject}</p>
                                <Badge variant="outline" className="text-xs">
                                  {comm.direction === 'outbound' ? 'Sent' : 'Received'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <IconCalendar className="h-3 w-3" />
                                {comm.date}
                              </p>
                            </div>
                          </div>
                        ))}
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
                    <CardTitle className="text-base">Email Communication History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      All email communications with this candidate across all jobs
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconMail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <Label className="text-xs text-blue-700 dark:text-blue-400">Total Emails</Label>
                        </div>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{candidate.totalEmails}</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <Label className="text-xs text-green-700 dark:text-green-400">Sent</Label>
                        </div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          {Math.floor(candidate.totalEmails * 0.6)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <IconArrowDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <Label className="text-xs text-purple-700 dark:text-purple-400">Received</Label>
                        </div>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                          {Math.ceil(candidate.totalEmails * 0.4)}
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
                                {candidate.clientName.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                {candidate.jobTitle}
                                <Badge variant="default" className="text-xs">Current</Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">{candidate.clientName}</p>
                              <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">Job ID</Label>
                                  <p className="font-mono mt-0.5">{candidate.jobId}</p>
                                </div>
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">Total Emails</Label>
                                  <p className="font-semibold mt-0.5">{mockCommunications.length}</p>
                                </div>
                                <div className="p-2 rounded-md bg-background/60 border">
                                  <Label className="text-xs text-muted-foreground">Last Contact</Label>
                                  <p className="mt-0.5">{mockCommunications[0]?.date}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => navigate(`/dashboard/jobs/pipeline/${candidate.jobId}`)}
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
                          <div key={history.id} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 rounded-md border flex-shrink-0">
                                  <AvatarFallback className="rounded-md text-xs">
                                    {history.clientName.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1">{history.jobTitle}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{history.clientName}</p>
                                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">Job ID</Label>
                                      <p className="font-mono mt-0.5">{history.jobId}</p>
                                    </div>
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">Total Emails</Label>
                                      <p className="font-semibold mt-0.5">{emailCount}</p>
                                      <p className="text-muted-foreground mt-0.5">
                                        {sentCount} sent, {receivedCount} received
                                      </p>
                                    </div>
                                    <div className="p-2 rounded-md bg-background/60 border">
                                      <Label className="text-xs text-muted-foreground">Last Contact</Label>
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
                              onClick={() => navigate(`/dashboard/jobs/pipeline/${history.jobId}`)}
                            >
                              <IconMail className="h-4 w-4 mr-2" />
                              View Communication Details
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Empty State */}
                    {historyData.length === 0 && mockCommunications.length === 0 && (
                      <div className="text-center py-12">
                        <IconMail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground mb-1">No email communications yet</p>
                        <p className="text-xs text-muted-foreground">
                          Start communicating with this candidate to see the history here
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
                          Quickly compose and send an email to this candidate from the current job context.
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
                            This candidate has {historyData.length} previous application{historyData.length !== 1 ? 's' : ''} with {new Set(historyData.map(h => h.clientName)).size} client{new Set(historyData.map(h => h.clientName)).size !== 1 ? 's' : ''}.
                            Please review their interview history below before submitting to the same clients.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(historyData.map(h => h.clientName))).map((clientName, idx) => (
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
                    <CardTitle className="text-base">Interview History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Complete interview history with all clients - prevents re-submitting to clients who previously rejected this candidate
                    </p>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Filter interviews for this candidate
                      const candidateInterviews = interviewsData.filter(
                        (interview) => interview.candidateId === `cand-${candidateId}`
                      );

                      if (candidateInterviews.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <IconCalendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No interview history</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This candidate hasn't interviewed with any clients yet
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {candidateInterviews.map((interview) => {
                            const isCompleted = interview.status === "completed";
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
                                      <h4 className="font-semibold">{interview.jobTitle}</h4>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          interview.interviewType === "technical"
                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                            : interview.interviewType === "final"
                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                        }`}
                                      >
                                        {interview.interviewType.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <IconBriefcase className="h-3 w-3" />
                                      {interview.clientName}
                                    </p>
                                    {interview.interviewerName && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Interviewed by: {interview.interviewerName}
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
                                        <Badge variant="secondary">Completed</Badge>
                                      )
                                    ) : isNoShow ? (
                                      <Badge variant="outline" className="bg-gray-200 text-gray-700">
                                        No Show
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
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
                                      {new Date(interview.interviewDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Duration</Label>
                                    <p className="text-xs mt-1">
                                      {interview.duration ? `${interview.duration} min` : "N/A"}
                                    </p>
                                  </div>
                                  {interview.rating && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Rating</Label>
                                      <p className="text-xs mt-1 flex items-center gap-1">
                                        <span className="text-yellow-600">★</span>
                                        {interview.rating}/5
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <p className="text-xs mt-1 capitalize">
                                      {interview.status.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>

                                {interview.feedback && (
                                  <div className="pt-3 border-t">
                                    <Label className="text-xs text-muted-foreground">Feedback</Label>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                      {interview.feedback}
                                    </p>
                                  </div>
                                )}

                                {interview.notes && (
                                  <div className="pt-2">
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
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
                    <CardTitle className="text-base">Application History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      All past applications and interactions in the platform
                    </p>
                  </CardHeader>
                  <CardContent>
                    {historyData.length > 0 ? (
                      <div className="space-y-4">
                        {historyData.map((history) => (
                          <div key={history.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h4 className="font-semibold">{history.jobTitle}</h4>
                                <p className="text-sm text-muted-foreground">{history.clientName}</p>
                              </div>
                              {getStatusBadge(history.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <Label className="text-xs text-muted-foreground">Job ID</Label>
                                <p className="font-mono text-xs mt-1">{history.jobId}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Applied</Label>
                                <p className="text-xs mt-1">{history.appliedDate}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Final Stage</Label>
                                <p className="text-xs mt-1">{history.stage}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Last Updated</Label>
                                <p className="text-xs mt-1">{history.lastUpdated}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <IconClockHour4 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No previous applications</p>
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
                        <p className="text-sm font-medium mb-1">Apply to Future Jobs</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          This candidate can be assigned to any future job openings. Their profile and documents are saved in the system.
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
