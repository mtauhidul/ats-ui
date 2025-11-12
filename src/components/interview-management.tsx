import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/config/api";
import { useInterviewsByCandidateAndJob } from "@/hooks/firestore";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { useTeam } from "@/store/hooks/useTeam";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Phone,
  Plus,
  Star,
  User,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Interview {
  _id?: string;
  id?: string;
  candidateId: string;
  jobId: string;
  clientId: string;
  type: "phone" | "video" | "in-person" | "technical" | "hr" | "final";
  round: number;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  timezone: string;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  interviewerIds: Array<
    | string
    | {
        id?: string;
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }
  >;
  organizerId?:
    | string
    | {
        id?: string;
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  status:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  feedback?: Array<{
    interviewerId: string;
    rating: number;
    strengths: string[];
    weaknesses: string[];
    comments: string;
    recommendation: "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
    submittedAt: string;
  }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InterviewManagementProps {
  candidate: Candidate;
  job: Job;
  clientName: string;
  onBack: () => void;
}

const interviewTypeConfig = {
  phone: { label: "Phone Interview", icon: Phone, color: "text-blue-500" },
  video: { label: "Video Interview", icon: Video, color: "text-purple-500" },
  "in-person": { label: "In-Person", icon: Users, color: "text-green-500" },
  technical: {
    label: "Technical Round",
    icon: FileText,
    color: "text-orange-500",
  },
  hr: { label: "HR Round", icon: Users, color: "text-teal-500" },
  final: {
    label: "Final Round",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-indigo-500", icon: CheckCircle2 },
  "in-progress": {
    label: "In Progress",
    color: "bg-yellow-500",
    icon: AlertCircle,
  },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-red-500", icon: AlertCircle },
};

export function InterviewManagement({
  candidate,
  job,
  clientName,
  onBack,
}: InterviewManagementProps) {
  // Check if candidate is rejected
  const isRejected = candidate.status?.toLowerCase() === "rejected";
  
  // 🔥 REALTIME: Get interviews from Firestore with automatic updates
  const {
    data: firestoreInterviews,
    loading: isLoading,
    error: interviewsError,
  } = useInterviewsByCandidateAndJob(candidate.id, job.id);

  // Normalize interviews to match component expectations (cast to any for compatibility)
  const interviews = (firestoreInterviews?.map((int) => ({
    ...int,
    id: int.id,
    // Ensure scheduledAt is in ISO string format for consistency
    scheduledAt:
      int.interviewDate instanceof Date
        ? int.interviewDate.toISOString()
        : int.interviewDate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) || []) as any[];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingZoom, setIsCreatingZoom] = useState(false);

  const { teamMembers } = useTeam();

  const [formData, setFormData] = useState({
    title: "",
    type: "video" as Interview["type"],
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    interviewerIds: [] as string[],
  });

  // State for instant Zoom dialog
  const [isInstantZoomDialogOpen, setIsInstantZoomDialogOpen] = useState(false);
  const [isCreatingInstantZoom, setIsCreatingInstantZoom] = useState(false);

  // State for complete & review dialog
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingInterview, setReviewingInterview] =
    useState<Interview | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    feedback: "",
    recommendation: "pending" as "hire" | "reject" | "pending" | "hold",
    strengths: "",
    weaknesses: "",
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [interviewToCancel, setInterviewToCancel] = useState<string | null>(
    null
  );

  // 🔥 REALTIME: Team members now come from Firestore automatically - no fetch needed!

  const handleScheduleInterview = async () => {
    if (!formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.interviewerIds.length === 0) {
      toast.error("Please select at least one interviewer");
      return;
    }

    try {
      setIsSaving(true);

      // Combine date and time
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const interviewData = {
        candidateId: candidate.id,
        jobId: job.id,
        clientId: job.clientId,
        title: formData.title,
        type: formData.type,
        scheduledAt: scheduledAt.toISOString(),
        duration: formData.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        interviewerIds: formData.interviewerIds,
        round: interviews.length + 1,
        createZoomMeeting: formData.type === "video",
        sendEmail: true,
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/interviews`, {
        method: "POST",
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule interview");
      }

      await response.json();
      toast.success("Interview scheduled and email sent to candidate!");

      setIsAddDialogOpen(false);
      resetForm();
      // Firestore will automatically update the interviews list
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule interview"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInstantZoomMeeting = async () => {
    try {
      setIsCreatingInstantZoom(true);

      const now = new Date();
      const startTime = new Date(now.getTime() + 5 * 60000);

      const interviewData = {
        candidateId: candidate.id,
        jobId: job.id,
        clientId: job.clientId,
        title: `Instant Interview - ${candidate.firstName} ${candidate.lastName}`,
        type: "video" as const,
        scheduledAt: startTime.toISOString(),
        duration: 60,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        interviewerIds: [],
        round: interviews.length + 1,
        createZoomMeeting: true,
        sendEmail: true,
        isInstant: true,
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/interviews`, {
        method: "POST",
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create instant meeting"
        );
      }

      await response.json();
      toast.success("Instant Zoom meeting created and link sent to candidate!");

      setIsInstantZoomDialogOpen(false);
      // Firestore will automatically update the interviews list
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create instant meeting"
      );
    } finally {
      setIsCreatingInstantZoom(false);
    }
  };

  const handleAddZoomToInterview = async (interview: Interview) => {
    if (interview.meetingLink) {
      toast.info("This interview already has a Zoom meeting");
      return;
    }

    try {
      setIsCreatingZoom(true);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/interviews/${
          interview.id || interview._id
        }/zoom-meeting`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create Zoom meeting");
      }

      await response.json();
      toast.success("Zoom meeting created successfully!");

      // Firestore will automatically update the interviews list
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create Zoom meeting"
      );
    } finally {
      setIsCreatingZoom(false);
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    setInterviewToCancel(interviewId);
    setCancelDialogOpen(true);
  };

  const confirmCancelInterview = async () => {
    if (!interviewToCancel) return;

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/interviews/${interviewToCancel}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }

      toast.success("Interview deleted successfully");
      setCancelDialogOpen(false);
      setInterviewToCancel(null);
      // Firestore will automatically update the interviews list
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const handleOpenReviewDialog = (interview: Interview) => {
    setReviewingInterview(interview);
    setReviewData({
      rating: 5,
      feedback: "",
      recommendation: "pending",
      strengths: "",
      weaknesses: "",
    });
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingInterview) return;

    if (!reviewData.feedback.trim()) {
      toast.error("Please provide feedback for the interview");
      return;
    }

    try {
      setIsSubmittingReview(true);

      // Submit review and mark interview as completed
      const response = await authenticatedFetch(
        `${API_BASE_URL}/interviews/${
          reviewingInterview.id || reviewingInterview._id
        }/complete`,
        {
          method: "POST",
          body: JSON.stringify({
            rating: reviewData.rating,
            feedback: reviewData.feedback,
            recommendation: reviewData.recommendation,
            strengths: reviewData.strengths,
            weaknesses: reviewData.weaknesses,
            candidateId: candidate.id,
            jobId: job.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      toast.success("Interview completed and review submitted successfully!");
      setIsReviewDialogOpen(false);
      setReviewingInterview(null);
      // Firestore will automatically update the interviews list
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "video",
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      interviewerIds: [],
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getInterviewerName = (
    interviewer:
      | string
      | { firstName?: string; lastName?: string; email?: string }
  ) => {
    if (typeof interviewer === "string") return "Interviewer";
    return (
      `${interviewer.firstName || ""} ${interviewer.lastName || ""}`.trim() ||
      interviewer.email ||
      "Interviewer"
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between px-3 md:px-6 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 shrink-0"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-semibold truncate">
                  Interview Management
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {candidate.firstName} {candidate.lastName} • {job.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => !isRejected && setIsInstantZoomDialogOpen(true)}
                variant="outline"
                className="flex-1 sm:flex-initial h-8 md:h-10 text-xs md:text-sm"
                disabled={isRejected}
                title={isRejected ? "Cannot schedule interviews for rejected candidates" : ""}
              >
                <Video className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Instant Zoom Meeting</span>
                <span className="md:hidden">Zoom</span>
              </Button>
              <Button
                onClick={() => !isRejected && setIsAddDialogOpen(true)}
                className="flex-1 sm:flex-initial h-8 md:h-10 text-xs md:text-sm"
                disabled={isRejected}
                title={isRejected ? "Cannot schedule interviews for rejected candidates" : ""}
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Schedule Interview</span>
                <span className="sm:hidden">Schedule</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md:p-6">
          <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
            {/* Rejection Warning Banner */}
            {isRejected && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-red-900 dark:text-red-100 mb-1">
                      Candidate Rejected - Interview Scheduling Disabled
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This candidate has been rejected. You cannot schedule new interviews or create instant Zoom meetings. Past interview records remain available for viewing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Candidate & Job Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs md:text-sm text-muted-foreground">
                      Candidate
                    </Label>
                    <p className="text-base md:text-lg font-medium break-word">
                      {candidate.firstName} {candidate.lastName}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground break-all">
                      {candidate.email}
                    </p>
                    {candidate.phone && (
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {candidate.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs md:text-sm text-muted-foreground">
                      Position
                    </Label>
                    <p className="text-base md:text-lg font-medium break-word">
                      {job.title}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground break-word">
                      {clientName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interviews List */}
            {interviewsError ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                  <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-orange-500 mb-3 md:mb-4" />
                  <p className="text-base md:text-lg font-medium mb-2">
                    Database Index Required
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 text-center px-4 max-w-md">
                    The database index for interviews is being created. This
                    usually takes 2-5 minutes. Please refresh the page in a
                    moment.
                  </p>
                  <p className="text-xs text-muted-foreground/70 text-center px-4 max-w-md">
                    If you just created the index in Firebase Console, it may
                    take a few minutes to build.
                  </p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
                  <p className="text-base md:text-lg font-medium mb-2">
                    No interviews scheduled
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 text-center px-4">
                    {isRejected 
                      ? "This candidate has been rejected" 
                      : "Schedule your first interview to get started"}
                  </p>
                  {!isRejected && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="h-8 md:h-10 text-xs md:text-sm"
                    >
                      <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      Schedule Interview
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => {
                  const typeKey =
                    interview.type as keyof typeof interviewTypeConfig;
                  const statusKey =
                    interview.status as keyof typeof statusConfig;
                  const typeConfig = interviewTypeConfig[typeKey];
                  const statusConf = statusConfig[statusKey];
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusConf.icon;
                  const dateTime = formatDateTime(interview.scheduledAt);

                  return (
                    <Card
                      key={interview.id || interview._id}
                      className="overflow-hidden border-l-4 hover:shadow-md transition-shadow"
                      style={{
                        borderLeftColor: statusConf.color.includes("blue")
                          ? "#3b82f6"
                          : statusConf.color.includes("green")
                          ? "#22c55e"
                          : statusConf.color.includes("gray")
                          ? "#6b7280"
                          : "#ef4444",
                      }}
                    >
                      <CardContent className="p-0">
                        {/* Header Section */}
                        <div className="px-4 md:px-5 py-3 border-b bg-muted/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div
                                className={`p-2 rounded-lg ${typeConfig.color} shrink-0`}
                              >
                                <TypeIcon className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 truncate">
                                  {interview.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Round {interview.round}</span>
                                  <span>•</span>
                                  <Badge
                                    className={`${statusConf.color} text-white text-[10px] h-5 px-2`}
                                  >
                                    <StatusIcon className="h-2.5 w-2.5 mr-1" />
                                    {statusConf.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="px-4 md:px-5 py-3">
                          {/* Date & Time Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                              <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  Date
                                </p>
                                <p className="text-xs font-medium truncate">
                                  {dateTime.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                              <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  Time
                                </p>
                                <p className="text-xs font-medium truncate">
                                  {dateTime.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                              <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  Duration
                                </p>
                                <p className="text-xs font-medium">
                                  {interview.duration} min
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {interview.description && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {interview.description}
                              </p>
                            </div>
                          )}

                          {/* Interviewers */}
                          {interview.interviewerIds &&
                            interview.interviewerIds.length > 0 && (
                              <div className="mb-3">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                                  Interviewers
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {interview.interviewerIds.map(
                                    (
                                      interviewer: Interview["interviewerIds"][number],
                                      idx: number
                                    ) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-[10px] h-6"
                                      >
                                        <Users className="h-2.5 w-2.5 mr-1" />
                                        {getInterviewerName(interviewer)}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Zoom Meeting Section */}
                          {interview.meetingLink && (
                            <div className="p-3 rounded-lg border bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-blue-600">
                                    <Video className="h-3.5 w-3.5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                                      Zoom Meeting
                                    </p>
                                    {interview.meetingPassword && (
                                      <p className="text-[10px] text-blue-700 dark:text-blue-300">
                                        Pass:{" "}
                                        <span className="font-mono font-medium">
                                          {interview.meetingPassword}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/50"
                                  onClick={() =>
                                    copyToClipboard(interview.meetingLink!)
                                  }
                                >
                                  <Copy className="h-3 w-3 mr-1.5" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() =>
                                    window.open(interview.meetingLink, "_blank")
                                  }
                                >
                                  <ExternalLink className="h-3 w-3 mr-1.5" />
                                  Join
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions Footer */}
                        <div className="px-4 md:px-5 py-2.5 bg-muted/20 border-t flex flex-wrap gap-2">
                          {!interview.meetingLink &&
                            interview.type === "video" &&
                            interview.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() =>
                                  handleAddZoomToInterview(interview)
                                }
                                disabled={isCreatingZoom}
                              >
                                {isCreatingZoom ? (
                                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                ) : (
                                  <Video className="h-3 w-3 mr-1.5" />
                                )}
                                Add Zoom
                              </Button>
                            )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1.5" />
                            Details
                          </Button>
                          {interview.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleOpenReviewDialog(interview)
                                }
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() =>
                                  handleCancelInterview(
                                    interview.id || interview._id!
                                  )
                                }
                              >
                                <X className="h-3 w-3 mr-1.5" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Interview Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">
                Schedule Interview
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Schedule a new interview for {candidate.firstName}{" "}
                {candidate.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 md:space-y-4 py-3 md:py-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="title" className="text-xs md:text-sm">
                  Interview Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Initial Phone Screen"
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="type" className="text-xs md:text-sm">
                  Interview Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      type: value as Interview["type"],
                    })
                  }
                >
                  <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone" className="text-xs md:text-sm">
                      Phone Interview
                    </SelectItem>
                    <SelectItem value="video" className="text-xs md:text-sm">
                      Video Interview
                    </SelectItem>
                    <SelectItem
                      value="in-person"
                      className="text-xs md:text-sm"
                    >
                      In-Person
                    </SelectItem>
                    <SelectItem
                      value="technical"
                      className="text-xs md:text-sm"
                    >
                      Technical Round
                    </SelectItem>
                    <SelectItem value="hr" className="text-xs md:text-sm">
                      HR Round
                    </SelectItem>
                    <SelectItem value="final" className="text-xs md:text-sm">
                      Final Round
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="scheduledDate" className="text-xs md:text-sm">
                    Date *
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="h-9 md:h-10 text-xs md:text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="scheduledTime" className="text-xs md:text-sm">
                    Time *
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="h-9 md:h-10 text-xs md:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="duration" className="text-xs md:text-sm">
                  Duration (minutes) *
                </Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, duration: parseInt(value) })
                  }
                >
                  <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="text-xs md:text-sm">
                      30 minutes
                    </SelectItem>
                    <SelectItem value="45" className="text-xs md:text-sm">
                      45 minutes
                    </SelectItem>
                    <SelectItem value="60" className="text-xs md:text-sm">
                      1 hour
                    </SelectItem>
                    <SelectItem value="90" className="text-xs md:text-sm">
                      1.5 hours
                    </SelectItem>
                    <SelectItem value="120" className="text-xs md:text-sm">
                      2 hours
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="interviewers" className="text-xs md:text-sm">
                  Interviewers *
                </Label>
                <Select
                  value={formData.interviewerIds[0] || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, interviewerIds: [value] })
                  }
                >
                  <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                    <SelectValue placeholder="Select interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.userId || member.id}
                        className="text-xs md:text-sm"
                      >
                        {member.firstName} {member.lastName} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSaving}
                className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleInterview}
                disabled={isSaving}
                className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instant Zoom Meeting Dialog */}
        <Dialog
          open={isInstantZoomDialogOpen}
          onOpenChange={setIsInstantZoomDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Create Instant Zoom Meeting
              </DialogTitle>
              <DialogDescription>
                This will create a Zoom meeting starting in 5 minutes and send
                the link to the candidate via email.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm font-medium">Candidate</Label>
                    <p className="text-sm font-medium text-foreground">
                      {candidate.firstName} {candidate.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {candidate.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <Label className="text-sm font-medium">Meeting Details</Label>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    Starts in 5 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    Duration: 60 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <Video className="h-4 w-4 shrink-0" />
                    Type: Video (Zoom)
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    Email notification will be sent
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInstantZoomDialogOpen(false)}
                disabled={isCreatingInstantZoom}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateInstantZoomMeeting}
                disabled={isCreatingInstantZoom}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCreatingInstantZoom ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Create Instant Meeting
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete & Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">
                Complete Interview & Submit Review
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Mark this interview as completed and provide your feedback for{" "}
                {candidate.firstName} {candidate.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 md:space-y-4 py-3 md:py-4">
              {/* Rating */}
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-xs md:text-sm">Overall Rating *</Label>
                <div className="flex items-center gap-1 md:gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating })}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 md:h-8 md:w-8 ${
                          rating <= reviewData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-1 md:ml-2 text-xs md:text-sm text-muted-foreground">
                    {reviewData.rating} out of 5
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="recommendation" className="text-xs md:text-sm">
                  Recommendation *
                </Label>
                <Select
                  value={reviewData.recommendation}
                  onValueChange={(value: string) =>
                    setReviewData({
                      ...reviewData,
                      recommendation: value as
                        | "hire"
                        | "reject"
                        | "pending"
                        | "hold",
                    })
                  }
                >
                  <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hire" className="text-xs md:text-sm">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-600" />
                        Hire - Strong candidate
                      </div>
                    </SelectItem>
                    <SelectItem value="hold" className="text-xs md:text-sm">
                      <div className="flex items-center">
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 text-yellow-600" />
                        Hold - Need more evaluation
                      </div>
                    </SelectItem>
                    <SelectItem value="reject" className="text-xs md:text-sm">
                      <div className="flex items-center">
                        <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 text-red-600" />
                        Reject - Not a good fit
                      </div>
                    </SelectItem>
                    <SelectItem value="pending" className="text-xs md:text-sm">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-600" />
                        Pending - Undecided
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="feedback" className="text-xs md:text-sm">
                  Overall Feedback *
                </Label>
                <Textarea
                  id="feedback"
                  value={reviewData.feedback}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, feedback: e.target.value })
                  }
                  placeholder="Provide detailed feedback about the candidate's performance during the interview..."
                  rows={4}
                  className="text-xs md:text-sm"
                />
              </div>

              {/* Strengths */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="strengths" className="text-xs md:text-sm">
                  Key Strengths
                </Label>
                <Textarea
                  id="strengths"
                  value={reviewData.strengths}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, strengths: e.target.value })
                  }
                  placeholder="What did the candidate excel at? (e.g., technical skills, communication, problem-solving)"
                  rows={3}
                  className="text-xs md:text-sm"
                />
              </div>

              {/* Weaknesses */}
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="weaknesses" className="text-xs md:text-sm">
                  Areas for Improvement
                </Label>
                <Textarea
                  id="weaknesses"
                  value={reviewData.weaknesses}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, weaknesses: e.target.value })
                  }
                  placeholder="What areas could the candidate improve on?"
                  rows={3}
                  className="text-xs md:text-sm"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This review will be added to the
                  candidate's profile and your interview history. The interview
                  will be marked as completed and can no longer be edited.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
                disabled={isSubmittingReview}
                className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm bg-green-600 hover:bg-green-700"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    <span className="hidden xs:inline">
                      Complete & Submit Review
                    </span>
                    <span className="inline xs:hidden">Submit Review</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Interview Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl p-4 md:p-6">
            {selectedInterview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">
                    {selectedInterview.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Interview details and information
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 py-3 md:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Type
                      </Label>
                      <p className="font-medium text-sm md:text-base">
                        {interviewTypeConfig[selectedInterview.type].label}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Status
                      </Label>
                      <Badge
                        className={`${
                          statusConfig[selectedInterview.status].color
                        } text-white text-[10px] md:text-xs`}
                      >
                        {statusConfig[selectedInterview.status].label}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Date & Time
                      </Label>
                      <p className="font-medium text-sm md:text-base">
                        {formatDateTime(selectedInterview.scheduledAt).date}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {formatDateTime(selectedInterview.scheduledAt).time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Duration
                      </Label>
                      <p className="font-medium text-sm md:text-base">
                        {selectedInterview.duration} minutes
                      </p>
                    </div>
                  </div>

                  {selectedInterview.location && (
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Location
                      </Label>
                      <p className="font-medium text-sm md:text-base break-word">
                        {selectedInterview.location}
                      </p>
                    </div>
                  )}

                  {selectedInterview.description && (
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-xs md:text-sm">
                        {selectedInterview.description}
                      </p>
                    </div>
                  )}

                  {selectedInterview.notes && (
                    <div>
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        Internal Notes
                      </Label>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {selectedInterview.notes}
                      </p>
                    </div>
                  )}

                  {selectedInterview.meetingLink && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs md:text-sm text-muted-foreground">
                          Zoom Meeting
                        </Label>
                        <div className="mt-2 space-y-2">
                          <Button
                            variant="outline"
                            className="w-full h-9 md:h-10 text-xs md:text-sm"
                            onClick={() =>
                              window.open(
                                selectedInterview.meetingLink,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Join Zoom Meeting
                          </Button>
                          {selectedInterview.meetingPassword && (
                            <div className="p-2 bg-muted rounded text-xs md:text-sm">
                              <span className="font-medium">Password:</span>{" "}
                              {selectedInterview.meetingPassword}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Interview Dialog */}
        <ConfirmationDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Delete Interview"
          description="Are you sure you want to delete this interview? This action cannot be undone and will permanently remove the interview from the database."
          confirmText="Delete Interview"
          cancelText="Keep Interview"
          onConfirm={confirmCancelInterview}
          variant="destructive"
        />
      </div>
    </>
  );
}
