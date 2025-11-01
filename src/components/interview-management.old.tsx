import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  MapPin,
  Phone,
  Plus,
  Star,
  UserCheck,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Interview {
  id: string;
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
  interviewerIds: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  organizerId: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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
  createdAt: string;
  updatedAt: string;
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
  in_person: { label: "In-Person", icon: Users, color: "text-green-500" },
  technical: {
    label: "Technical Round",
    icon: FileText,
    color: "text-orange-500",
  },
  final: {
    label: "Final Round",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: XCircle },
  no_show: { label: "No Show", color: "bg-red-500", icon: AlertCircle },
};

const outcomeConfig = {
  pending: { label: "Pending", color: "bg-gray-500" },
  passed: { label: "Passed", color: "bg-green-500" },
  failed: { label: "Failed", color: "bg-red-500" },
};

export function InterviewManagement({
  candidate,
  job,
  clientName,
  onBack,
}: InterviewManagementProps) {
  const [interviews, setInterviews] = useState<Interview[]>([
    // Mock data - replace with real data
    {
      id: "int-1",
      date: "2025-10-28",
      time: "10:00",
      type: "phone",
      interviewer: "John Smith",
      interviewerEmail: "john.smith@company.com",
      duration: 30,
      status: "completed",
      outcome: "passed",
      rating: 4,
      feedback:
        "Great communication skills and technical knowledge. Candidate demonstrated strong problem-solving abilities.",
      notes: "Follow up with technical round",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Interview>>({
    date: "",
    time: "",
    type: "phone",
    interviewer: "",
    interviewerEmail: "",
    duration: 30,
    status: "scheduled",
    notes: "",
    location: "",
    meetingLink: "",
  });

  const hasScheduledInterview = interviews.some(
    (int) => int.status === "scheduled"
  );
  const completedInterviews = interviews.filter(
    (int) => int.status === "completed"
  );
  const averageRating =
    completedInterviews.length > 0
      ? completedInterviews.reduce((acc, int) => acc + (int.rating || 0), 0) /
        completedInterviews.length
      : 0;

  const handleScheduleInterview = () => {
    if (!formData.date || !formData.time || !formData.interviewer) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      date: formData.date!,
      time: formData.time!,
      type: formData.type || "phone",
      interviewer: formData.interviewer!,
      interviewerEmail: formData.interviewerEmail,
      duration: formData.duration || 30,
      status: "scheduled",
      notes: formData.notes,
      location: formData.location,
      meetingLink: formData.meetingLink,
    };

    setInterviews([...interviews, newInterview]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Interview scheduled successfully");
  };

  const handleUpdateInterview = () => {
    if (!selectedInterview) return;

    setInterviews(
      interviews.map((int) =>
        int.id === selectedInterview.id
          ? {
              ...int,
              ...formData,
              date: formData.date || int.date,
              time: formData.time || int.time,
            }
          : int
      )
    );

    setIsEditDialogOpen(false);
    setSelectedInterview(null);
    resetForm();
    toast.success("Interview updated successfully");
  };

  const handleCancelInterview = (interviewId: string) => {
    setInterviews(
      interviews.map((int) =>
        int.id === interviewId ? { ...int, status: "cancelled" } : int
      )
    );
    toast.success("Interview cancelled");
  };

  const openEditDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormData({ ...interview });
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: "",
      time: "",
      type: "phone",
      interviewer: "",
      interviewerEmail: "",
      duration: 30,
      status: "scheduled",
      notes: "",
      location: "",
      meetingLink: "",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-auto p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h2 className="text-2xl font-bold">Interview Management</h2>
          <p className="text-muted-foreground mt-1">
            {candidate.firstName} {candidate.lastName} • {job.title} at{" "}
            {clientName}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          disabled={hasScheduledInterview}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {hasScheduledInterview && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Interview Already Scheduled</p>
                <p className="text-sm text-muted-foreground mt-1">
                  An interview is already scheduled for this candidate. Complete
                  or cancel the existing interview before scheduling a new one.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Interviews
                </p>
                <p className="text-2xl font-bold mt-1">{interviews.length}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold mt-1">
                  {completedInterviews.length}
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {averageRating.toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
              <div className="rounded-full bg-yellow-500/10 p-3">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold mt-1">
                  {completedInterviews.length > 0
                    ? Math.round(
                        (completedInterviews.filter(
                          (int) => int.outcome === "passed"
                        ).length /
                          completedInterviews.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <UserCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview History */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Interviews Scheduled
              </h3>
              <p className="text-muted-foreground mb-4">
                Schedule the first interview to begin the evaluation process
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((interview) => {
                  const TypeIcon = interviewTypeConfig[interview.type].icon;

                  return (
                    <Card key={interview.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`rounded-full bg-${
                                statusConfig[interview.status].color
                              }/10 p-3`}
                            >
                              <TypeIcon
                                className={`h-5 w-5 ${
                                  interviewTypeConfig[interview.type].color
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {interviewTypeConfig[interview.type].label}
                                </h3>
                                <Badge
                                  className={`${
                                    statusConfig[interview.status].color
                                  } text-white`}
                                >
                                  {statusConfig[interview.status].label}
                                </Badge>
                                {interview.outcome && (
                                  <Badge
                                    className={`${
                                      outcomeConfig[interview.outcome].color
                                    } text-white`}
                                  >
                                    {outcomeConfig[interview.outcome].label}
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1.5 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {formatDate(interview.date)} at{" "}
                                    {interview.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{interview.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{interview.interviewer}</span>
                                </div>
                                {interview.type === "video" &&
                                  interview.meetingLink && (
                                    <div className="flex items-center gap-2">
                                      <Video className="h-3.5 w-3.5" />
                                      <a
                                        href={interview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Join Meeting
                                      </a>
                                    </div>
                                  )}
                                {interview.type === "in_person" &&
                                  interview.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3.5 w-3.5" />
                                      <span>{interview.location}</span>
                                    </div>
                                  )}
                              </div>

                              {interview.rating && (
                                <div className="flex items-center gap-1 mt-3">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= interview.rating!
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {interview.rating}/5
                                  </span>
                                </div>
                              )}

                              {interview.feedback && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                  <p className="text-sm">
                                    {interview.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailDialog(interview)}
                            >
                              View
                            </Button>
                            {interview.status === "scheduled" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(interview)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelInterview(interview.id)
                                  }
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
        </CardContent>
      </Card>

      {/* Schedule Interview Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {candidate.firstName}{" "}
              {candidate.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 overflow-y-auto max-h-[calc(85vh-180px)] px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Interview Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Interview["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Interview
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Interview
                      </div>
                    </SelectItem>
                    <SelectItem value="in_person">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        In-Person
                      </div>
                    </SelectItem>
                    <SelectItem value="technical">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Technical Round
                      </div>
                    </SelectItem>
                    <SelectItem value="final">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Final Round
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 30,
                    })
                  }
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interviewer">
                  Interviewer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interviewer"
                  value={formData.interviewer}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewer: e.target.value })
                  }
                  placeholder="John Smith"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewerEmail">Interviewer Email</Label>
                <Input
                  id="interviewerEmail"
                  type="email"
                  value={formData.interviewerEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interviewerEmail: e.target.value,
                    })
                  }
                  placeholder="john@company.com"
                  className="w-full"
                />
              </div>
            </div>

            {formData.type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Meeting Link
                  </div>
                </Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  placeholder="https://zoom.us/j/123456789"
                  className="w-full"
                />
              </div>
            )}

            {formData.type === "in_person" && (
              <div className="space-y-2">
                <Label htmlFor="location">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="123 Office Street, New York, NY"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes or instructions..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleInterview}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Interview Dialog - Similar to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogDescription>Update interview details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as add dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-interviewer">Interviewer Name</Label>
                <Input
                  id="edit-interviewer"
                  value={formData.interviewer}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewer: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min={15}
                  step={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateInterview}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">
                    {interviewTypeConfig[selectedInterview.type].label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    className={`${
                      statusConfig[selectedInterview.status].color
                    } text-white`}
                  >
                    {statusConfig[selectedInterview.status].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {formatDate(selectedInterview.date)} at{" "}
                    {selectedInterview.time}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">
                    {selectedInterview.duration} minutes
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Interviewer</Label>
                <p className="font-medium">{selectedInterview.interviewer}</p>
                {selectedInterview.interviewerEmail && (
                  <p className="text-sm text-muted-foreground">
                    {selectedInterview.interviewerEmail}
                  </p>
                )}
              </div>

              {selectedInterview.rating && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= selectedInterview.rating!
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {selectedInterview.rating}/5
                      </span>
                    </div>
                  </div>
                </>
              )}

              {selectedInterview.feedback && (
                <div>
                  <Label className="text-muted-foreground">Feedback</Label>
                  <p className="mt-2 p-3 bg-muted rounded-lg">
                    {selectedInterview.feedback}
                  </p>
                </div>
              )}

              {selectedInterview.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-2 text-sm">{selectedInterview.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
