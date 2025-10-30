import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  X,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Copy,
  ExternalLink,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import { useTeam } from "@/store/hooks/useTeam";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  interviewerIds: Array<string | {
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }>;
  organizerId?: string | {
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
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
  technical: { label: "Technical Round", icon: FileText, color: "text-orange-500" },
  hr: { label: "HR Round", icon: Users, color: "text-teal-500" },
  final: { label: "Final Round", icon: CheckCircle2, color: "text-emerald-500" },
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-indigo-500", icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "bg-yellow-500", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
  "no-show": { label: "No Show", color: "bg-red-500", icon: AlertCircle },
};

export function InterviewManagement({ candidate, job, clientName, onBack }: InterviewManagementProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingZoom, setIsCreatingZoom] = useState(false);
  
  const { teamMembers, fetchTeam } = useTeam();
  
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
  const [reviewingInterview, setReviewingInterview] = useState<Interview | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    feedback: "",
    recommendation: "pending" as "hire" | "reject" | "pending" | "hold",
    strengths: "",
    weaknesses: "",
  });

  // Fetch team members
  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Fetch interviews for this candidate and job
  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(
        `${API_BASE_URL}/interviews?candidateId=${candidate.id}&jobId=${job.id}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }
      
      const result = await response.json();
      const interviewsData = result.data?.interviews || result.data || [];
      
      // Normalize IDs
      const normalizedInterviews = interviewsData.map((int: Interview) => ({
        ...int,
        id: int.id || int._id,
      }));
      
      setInterviews(normalizedInterviews);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setIsLoading(false);
    }
  }, [candidate.id, job.id]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

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
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
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
      fetchInterviews();
    } catch (error: unknown) {
      console.error("Failed to schedule interview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule interview");
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
        throw new Error(errorData.message || "Failed to create instant meeting");
      }

      await response.json();
      toast.success("Instant Zoom meeting created and link sent to candidate!");
      
      setIsInstantZoomDialogOpen(false);
      fetchInterviews();
    } catch (error: unknown) {
      console.error("Failed to create instant meeting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create instant meeting");
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
        `${API_BASE_URL}/interviews/${interview.id || interview._id}/zoom-meeting`,
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
      
      fetchInterviews();
    } catch (error: unknown) {
      console.error("Failed to create Zoom meeting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create Zoom meeting");
    } finally {
      setIsCreatingZoom(false);
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    if (!confirm("Are you sure you want to cancel this interview?")) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/interviews/${interviewId}/cancel`,
        {
          method: "POST",
          body: JSON.stringify({ reason: "Cancelled by user" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel interview");
      }

      toast.success("Interview cancelled successfully");
      fetchInterviews();
    } catch (error) {
      console.error("Failed to cancel interview:", error);
      toast.error("Failed to cancel interview");
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
        `${API_BASE_URL}/interviews/${reviewingInterview.id || reviewingInterview._id}/complete`,
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
      fetchInterviews();
    } catch (error: unknown) {
      console.error("Failed to submit review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
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

  const getInterviewerName = (interviewer: string | { firstName?: string; lastName?: string; email?: string }) => {
    if (typeof interviewer === "string") return "Interviewer";
    return `${interviewer.firstName || ""} ${interviewer.lastName || ""}`.trim() || interviewer.email || "Interviewer";
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Interview Management</h1>
              <p className="text-sm text-muted-foreground">
                {candidate.firstName} {candidate.lastName} • {job.title}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsInstantZoomDialogOpen(true)} variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Instant Zoom Meeting
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Candidate & Job Info */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Candidate</Label>
                  <p className="text-lg font-medium">
                    {candidate.firstName} {candidate.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  {candidate.phone && (
                    <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Position</Label>
                  <p className="text-lg font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{clientName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interviews List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : interviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No interviews scheduled</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule your first interview to get started
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => {
                const typeConfig = interviewTypeConfig[interview.type];
                const statusConf = statusConfig[interview.status];
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConf.icon;
                const dateTime = formatDateTime(interview.scheduledAt);

                return (
                  <Card key={interview.id || interview._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-muted ${typeConfig.color}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{interview.title}</h3>
                              <p className="text-sm text-muted-foreground">Round {interview.round}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{dateTime.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{dateTime.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{interview.duration} minutes</span>
                            </div>
                            <Badge className={`${statusConf.color} text-white w-fit`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                          </div>

                          {interview.description && (
                            <p className="text-sm text-muted-foreground mt-3">
                              {interview.description}
                            </p>
                          )}

                          {interview.interviewerIds && interview.interviewerIds.length > 0 && (
                            <div className="mt-3">
                              <Label className="text-xs text-muted-foreground">Interviewers:</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {interview.interviewerIds.map((interviewer, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {getInterviewerName(interviewer)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {interview.meetingLink && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium">Zoom Meeting</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(interview.meetingLink!)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Link
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(interview.meetingLink, "_blank")}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Join
                                  </Button>
                                </div>
                              </div>
                              {interview.meetingPassword && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Password: {interview.meetingPassword}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {!interview.meetingLink && interview.type === "video" && interview.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddZoomToInterview(interview)}
                              disabled={isCreatingZoom}
                            >
                              {isCreatingZoom ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Video className="h-4 w-4 mr-1" />
                              )}
                              Create Zoom
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                          {interview.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleOpenReviewDialog(interview)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Complete & Review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelInterview(interview.id || interview._id!)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule a new interview for {candidate.firstName} {candidate.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Interview Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Initial Phone Screen"
              />
            </div>

            <div>
              <Label htmlFor="type">Interview Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => setFormData({ ...formData, type: value as Interview["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Interview</SelectItem>
                  <SelectItem value="video">Video Interview</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="technical">Technical Round</SelectItem>
                  <SelectItem value="hr">HR Round</SelectItem>
                  <SelectItem value="final">Final Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interviewers">Interviewers *</Label>
              <Select
                value={formData.interviewerIds[0] || ""}
                onValueChange={(value) => setFormData({ ...formData, interviewerIds: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.userId || member.id}>
                      {member.firstName} {member.lastName} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      <Dialog open={isInstantZoomDialogOpen} onOpenChange={setIsInstantZoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Instant Zoom Meeting</DialogTitle>
            <DialogDescription>
              This will create a Zoom meeting starting in 5 minutes and send the link to the candidate's email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <p className="text-sm font-medium">{candidate.firstName} {candidate.lastName}</p>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Meeting Details</Label>
              <p className="text-sm text-muted-foreground">
                • Meeting starts in 5 minutes<br />
                • Duration: 60 minutes<br />
                • Type: Video (Zoom)<br />
                • Email notification will be sent to candidate
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInstantZoomDialogOpen(false)} 
              disabled={isCreatingInstantZoom}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInstantZoomMeeting} 
              disabled={isCreatingInstantZoom}
            >
              {isCreatingInstantZoom ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Interview & Submit Review</DialogTitle>
            <DialogDescription>
              Mark this interview as completed and provide your feedback for {candidate.firstName} {candidate.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div>
              <Label>Overall Rating *</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating })}
                    className="focus:outline-none transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviewData.rating} out of 5
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <Label htmlFor="recommendation">Recommendation *</Label>
              <Select
                value={reviewData.recommendation}
                onValueChange={(value: string) => 
                  setReviewData({ ...reviewData, recommendation: value as "hire" | "reject" | "pending" | "hold" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hire">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Hire - Strong candidate
                    </div>
                  </SelectItem>
                  <SelectItem value="hold">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                      Hold - Need more evaluation
                    </div>
                  </SelectItem>
                  <SelectItem value="reject">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Reject - Not a good fit
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                      Pending - Undecided
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback">Overall Feedback *</Label>
              <Textarea
                id="feedback"
                value={reviewData.feedback}
                onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                placeholder="Provide detailed feedback about the candidate's performance during the interview..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Strengths */}
            <div>
              <Label htmlFor="strengths">Key Strengths</Label>
              <Textarea
                id="strengths"
                value={reviewData.strengths}
                onChange={(e) => setReviewData({ ...reviewData, strengths: e.target.value })}
                placeholder="What did the candidate excel at? (e.g., technical skills, communication, problem-solving)"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Weaknesses */}
            <div>
              <Label htmlFor="weaknesses">Areas for Improvement</Label>
              <Textarea
                id="weaknesses"
                value={reviewData.weaknesses}
                onChange={(e) => setReviewData({ ...reviewData, weaknesses: e.target.value })}
                placeholder="What areas could the candidate improve on?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This review will be added to the candidate's profile and your interview history.
                The interview will be marked as completed and can no longer be edited.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReviewDialogOpen(false)} 
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              disabled={isSubmittingReview}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete & Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedInterview && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInterview.title}</DialogTitle>
                <DialogDescription>
                  Interview details and information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium">{interviewTypeConfig[selectedInterview.type].label}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={`${statusConfig[selectedInterview.status].color} text-white`}>
                      {statusConfig[selectedInterview.status].label}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Date & Time</Label>
                    <p className="font-medium">
                      {formatDateTime(selectedInterview.scheduledAt).date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedInterview.scheduledAt).time}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-medium">{selectedInterview.duration} minutes</p>
                  </div>
                </div>

                {selectedInterview.location && (
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{selectedInterview.location}</p>
                  </div>
                )}

                {selectedInterview.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedInterview.description}</p>
                  </div>
                )}

                {selectedInterview.notes && (
                  <div>
                    <Label className="text-muted-foreground">Internal Notes</Label>
                    <p className="text-sm text-muted-foreground">{selectedInterview.notes}</p>
                  </div>
                )}

                {selectedInterview.meetingLink && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Zoom Meeting</Label>
                      <div className="mt-2 space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(selectedInterview.meetingLink, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Zoom Meeting
                        </Button>
                        {selectedInterview.meetingPassword && (
                          <div className="p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Password:</span> {selectedInterview.meetingPassword}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
