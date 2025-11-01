import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useJobs } from "@/store/hooks/useJobs";
import { useTeam } from "@/store/hooks/useTeam";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Calendar,
  FileText,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Activity {
  _id: string;
  action: string;
  resourceType?: string;
  resourceName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20";
    case "recruiter":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20";
    case "hiring_manager":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20";
    case "interviewer":
      return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
    case "coordinator":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20";
    default:
      return "bg-muted text-muted-foreground border";
  }
};

const formatRoleName = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function TeamMemberDetailPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { currentMember, isLoading, fetchTeamMemberById } = useTeam();
  const { jobs, fetchJobsIfNeeded } = useJobs(); // Smart fetch
  const { candidates, fetchCandidatesIfNeeded } = useCandidates(); // Smart fetch
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const fetchActivities = useCallback(async (userId: string) => {
    try {
      setIsLoadingActivities(true);
      const response = await authenticatedFetch(
        `${API_BASE_URL}/activities/user/${userId}`
      );
      if (response.ok) {
        const result = await response.json();
        setActivities(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  useEffect(() => {
    if (memberId) {
      fetchTeamMemberById(memberId);
      fetchActivities(memberId);
    }
    fetchJobsIfNeeded(); // Smart fetch - checks cache
    fetchCandidatesIfNeeded(); // Smart fetch - checks cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]); // Only memberId in deps - callbacks are stable

  // Stable callback for handling refetch events
  const handleRefetch = useCallback(() => {
    console.log("🔔 Team detail page: Received refetchCandidates event!");
    console.log("🔔 Team detail page: memberId:", memberId);
    if (memberId) {
      console.log("🔔 Team detail page: Fetching team member data...");
      fetchTeamMemberById(memberId);
      fetchActivities(memberId);
    }
    console.log("🔔 Team detail page: Fetching all candidates...");
    fetchCandidatesIfNeeded(); // Smart fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]); // Simplified deps

  // Listen for refetchCandidates event (triggered when candidate is assigned)
  useEffect(() => {
    console.log(
      "👂 Team detail page: Adding event listener for refetchCandidates"
    );
    window.addEventListener("refetchCandidates", handleRefetch);
    return () => {
      console.log(
        "🚫 Team detail page: Removing event listener for refetchCandidates"
      );
      window.removeEventListener("refetchCandidates", handleRefetch);
    };
  }, [handleRefetch]);

  const formatActivityAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      login: "Logged in",
      logout: "Logged out",
      reviewed_candidate: "Reviewed candidate",
      updated_job: "Updated job",
      created_job: "Created job",
      sent_email: "Sent email",
      reviewed_application: "Reviewed application",
      updated_candidate: "Updated candidate",
      created_candidate: "Created candidate",
      completed_interview: "Completed interview",
      scheduled_interview: "Scheduled interview",
      created_zoom_meeting: "Created Zoom meeting",
    };
    return actionMap[action] || action.replace(/_/g, " ");
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - activityDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return activityDate.toLocaleDateString();
  };

  // Show loading state while fetching
  if (isLoading && !currentMember) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard/team")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <Loader size="md" text="Fetching team member details..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard/team")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold">Team Member Not Found</h2>
              </div>
              <p className="text-muted-foreground">
                The team member you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const assignedJobs = jobs.filter(
    (job: Job) => job.assignedRecruiterId === currentMember.id
  );

  // assignedTo references User ID (currentMember.userId), not TeamMember ID (currentMember.id)
  // assignedTo can be either a string (User ID) or a populated user object
  const userIdToMatch = currentMember.userId || currentMember.id;
  const assignedCandidates = candidates.filter((candidate: Candidate) => {
    if (typeof candidate.assignedTo === "string") {
      // assignedTo is a User ID string
      return candidate.assignedTo === userIdToMatch;
    } else if (
      candidate.assignedTo &&
      typeof candidate.assignedTo === "object"
    ) {
      // assignedTo is a populated User object - check both id and _id fields
      return (
        candidate.assignedTo.id === userIdToMatch ||
        candidate.assignedTo._id === userIdToMatch
      );
    }
    return false;
  });

  console.log("Team detail - currentMember.id:", currentMember.id);
  console.log("Team detail - currentMember.userId:", currentMember.userId);
  console.log("Team detail - userIdToMatch:", userIdToMatch);
  console.log("Team detail - Total candidates:", candidates.length);
  console.log("Team detail - Assigned candidates:", assignedCandidates.length);
  console.log(
    "Team detail - Sample candidate assignedTo values:",
    candidates.slice(0, 3).map((c) => ({ id: c.id, assignedTo: c.assignedTo }))
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
          <div className="px-3 lg:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/team")}
                className="self-start"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold">
                  Team Member Details
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  View and manage team member information
                </p>
              </div>
            </div>

            {/* Profile Card */}
            <Card className="mb-4 md:mb-6">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-3 md:mb-4">
                      {currentMember.avatar &&
                        !currentMember.avatar.includes("dicebear.com") &&
                        !currentMember.avatar.includes("api.dicebear") && (
                          <AvatarImage
                            src={currentMember.avatar}
                            alt={`${currentMember.firstName} ${currentMember.lastName}`}
                          />
                        )}
                      <AvatarFallback className="text-xl md:text-2xl">
                        {getInitials(
                          currentMember.firstName,
                          currentMember.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="outline"
                      className={`${getRoleBadgeColor(
                        currentMember.role
                      )} text-xs md:text-sm`}
                    >
                      {formatRoleName(currentMember.role)}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-3 md:mb-4">
                      <h3 className="text-xl md:text-2xl font-bold mb-1">
                        {currentMember.firstName} {currentMember.lastName}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground">
                        {currentMember.title}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`mailto:${currentMember.email}`}
                          className="hover:underline truncate"
                        >
                          {currentMember.email}
                        </a>
                      </div>
                      {currentMember.phone && (
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                          <a
                            href={`tel:${currentMember.phone}`}
                            className="hover:underline"
                          >
                            {currentMember.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {currentMember.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                        <span>
                          Joined{" "}
                          {new Date(
                            currentMember.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs md:text-sm text-muted-foreground">
                          Last active:{" "}
                          {currentMember.lastLoginAt
                            ? new Date(
                                currentMember.lastLoginAt
                              ).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          currentMember.status === "active"
                            ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                            : "bg-muted text-muted-foreground border"
                        } text-xs`}
                      >
                        {currentMember.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {currentMember.statistics?.activeJobs || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Active Jobs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {currentMember.statistics?.placedCandidates || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Placed Candidates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-500" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {currentMember.statistics?.pendingReviews || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Pending Reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    {currentMember.statistics?.emailsSent || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Emails Sent
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Permissions */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Shield className="h-4 w-4 md:h-5 md:w-5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-2 md:space-y-3">
                    {Object.entries(currentMember.permissions)
                      .filter(([key]) => key !== "_id" && key !== "id")
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-xs md:text-sm">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim()}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${
                              value
                                ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                            } text-[10px] md:text-xs`}
                          >
                            {value ? "Allowed" : "Denied"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Jobs */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5" />
                    Assigned Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  {assignedJobs.length > 0 ? (
                    <div className="space-y-3">
                      {assignedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/dashboard/jobs/pipeline/${job.id}`)
                          }
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{job.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {typeof job.location === "string"
                                ? job.location
                                : `${job.location?.city || ""}, ${
                                    job.location?.country || ""
                                  }`}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2 shrink-0">
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No active jobs assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Assigned Candidates */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedCandidates.length > 0 ? (
                  <div className="space-y-3">
                    {assignedCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(`/dashboard/candidates/${candidate.id}`)
                        }
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10">
                            {candidate.avatar &&
                              !candidate.avatar.includes("dicebear.com") &&
                              !candidate.avatar.includes("api.dicebear") && (
                                <AvatarImage
                                  src={candidate.avatar}
                                  alt={`${candidate.firstName} ${candidate.lastName}`}
                                />
                              )}
                            <AvatarFallback>
                              {getInitials(
                                candidate.firstName,
                                candidate.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {candidate.firstName} {candidate.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              ID: {candidate.id}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {/* eslint-disable @typescript-eslint/no-explicit-any */}
                              {candidate.jobIds &&
                              candidate.jobIds.length > 0 ? (
                                <>
                                  {typeof candidate.jobIds[0] === "object" &&
                                  (candidate.jobIds[0] as any).title
                                    ? (candidate.jobIds[0] as any).title
                                    : "No job"}
                                  {typeof candidate.jobIds[0] === "object" &&
                                    (candidate.jobIds[0] as any).clientId &&
                                    typeof (candidate.jobIds[0] as any)
                                      .clientId === "object" &&
                                    (candidate.jobIds[0] as any).clientId
                                      .companyName && (
                                      <>
                                        {" "}
                                        •{" "}
                                        {
                                          (candidate.jobIds[0] as any).clientId
                                            .companyName
                                        }
                                      </>
                                    )}
                                </>
                              ) : (
                                "No job assigned"
                              )}
                              {/* eslint-enable @typescript-eslint/no-explicit-any */}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline">
                            {candidate.status || "Active"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No candidates assigned
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingActivities ? (
                  <div className="py-8">
                    <Loader size="md" text="Loading activities..." />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-start gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {formatActivityAction(activity.action)}
                          </p>
                          {activity.resourceName && (
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.resourceName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No recent activity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Activities will appear here as the user interacts with the
                      system
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
