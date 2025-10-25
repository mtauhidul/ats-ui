import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Edit2,
  Shield,
  Activity,
} from "lucide-react";
import teamData from "@/lib/mock-data/team.json";
import jobsData from "@/lib/mock-data/jobs.json";
import candidatesData from "@/lib/mock-data/candidates.json";

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

  const member = teamData.find((m) => m.id === memberId);

  if (!member) {
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

  // Get assigned jobs and candidates - filtered by assignedRecruiterId
  const assignedJobs = jobsData.filter((job: any) => job.assignedRecruiterId === member.id);
  const assignedCandidates = candidatesData.filter((candidate: any) => candidate.assignedRecruiterId === member.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard/team")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold">Team Member Details</h2>
                  <p className="text-muted-foreground">
                    View and manage team member information
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`mailto:${member.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/dashboard/team', { state: { editMemberId: member.id } })}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="text-2xl">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(member.role)}
                    >
                      {formatRoleName(member.role)}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {member.title}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:underline"
                        >
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:underline"
                          >
                            {member.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{member.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Joined{" "}
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Last active:{" "}
                        {new Date(member.lastLoginAt).toLocaleString()}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          member.status === "active"
                            ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20 ml-2"
                            : "bg-muted text-muted-foreground border ml-2"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {member.statistics.activeJobs}
                  </div>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {member.statistics.placedCandidates}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Placed Candidates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {member.statistics.pendingReviews}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pending Reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {member.statistics.emailsSent}
                  </div>
                  <p className="text-xs text-muted-foreground">Emails Sent</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(member.permissions).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-sm">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim()}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              value
                                ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                            }
                          >
                            {value ? "Allowed" : "Denied"}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Assigned Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                              {typeof job.location === 'string'
                                ? job.location
                                : `${job.location?.city || ''}, ${job.location?.country || ''}`}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="ml-2 flex-shrink-0"
                          >
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
                  Recent Candidates
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
                            <p className="text-sm text-muted-foreground truncate">
                              {candidate.currentTitle} •{" "}
                              {candidate.yearsOfExperience} years exp
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline">
                            {candidate.skills?.[0]?.name || "N/A"}
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

            {/* Activity Timeline (placeholder) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Reviewed application",
                      candidate: "Sarah Johnson",
                      time: "2 hours ago",
                    },
                    {
                      action: "Sent email to client",
                      candidate: "Tech Corp",
                      time: "5 hours ago",
                    },
                    {
                      action: "Updated job posting",
                      candidate: "Senior Developer",
                      time: "1 day ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.candidate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
