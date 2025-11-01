import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/hooks/useAuth";
import { registerUser } from "@/services/auth.service";
import { useAppDispatch, useAppSelector, useTeam } from "@/store/hooks/index";
import { deleteUser, fetchUsers, updateUser } from "@/store/slices/usersSlice";
import type { TeamMember, TeamRole, User } from "@/types";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MoreVertical,
  Phone,
  Search,
  Shield,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Type helper for backend User which uses isActive instead of status and title instead of position
type BackendUser = User & {
  _id?: string; // MongoDB _id field
  isActive?: boolean;
  title?: string;
  permissions?: {
    canManageClients?: boolean;
    canManageJobs?: boolean;
    canReviewApplications?: boolean;
    canManageCandidates?: boolean;
    canSendEmails?: boolean;
    canManageTeam?: boolean;
    canAccessAnalytics?: boolean;
  };
};

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName || !lastName) return "?";
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const roleColors: Record<string, string> = {
  admin: "bg-red-500",
  recruiter: "bg-primary",
  hiring_manager: "bg-primary/80",
  interviewer: "bg-primary/60",
  coordinator: "bg-muted-foreground",
  viewer: "bg-muted-foreground",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  interviewer: "Interviewer",
  coordinator: "Coordinator",
  viewer: "Viewer",
};

export default function TeamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user: currentUser, accessToken } = useAuth();

  const { updateTeamMember } = useTeam();
  // Fetch all users instead of just team members to show admins too
  const users = useAppSelector(
    (state: { users: { users: BackendUser[] } }) => state.users.users || []
  );

  // Convert users to display format (like team members but with all users including admins)
  const members = users.map(
    (user: BackendUser) =>
      ({
        id: user._id || user.id, // Backend uses _id, frontend expects id
        userId: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.isActive ? "active" : "inactive", // Backend uses isActive boolean
        avatar: user.avatar,
        department: user.department,
        title: user.title, // Backend User model uses 'title', not 'position'
        permissions: user.permissions || {
          // Fallback to role-based permissions if not set
          canManageClients: user.role === "admin",
          canManageJobs: user.role === "admin",
          canReviewApplications: true,
          canManageCandidates:
            user.role === "admin" || user.role === "recruiter",
          canSendEmails: true,
          canManageTeam: user.role === "admin",
          canAccessAnalytics: user.role === "admin",
        },
        statistics: {
          activeJobs: 0,
          placedCandidates: 0,
          pendingReviews: 0,
          emailsSent: 0,
        },
        lastLoginAt: user.lastLoginAt,
      } as TeamMember)
  );

  useEffect(() => {
    // Fetch all users to display in the team page
    dispatch(fetchUsers());
  }, [dispatch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Check if we need to open edit dialog from navigation state
  useEffect(() => {
    const state = location.state as { editMemberId?: string } | null;
    if (state?.editMemberId) {
      const memberToEdit = members.find((m) => m.id === state.editMemberId);
      if (memberToEdit) {
        openEditDialog(memberToEdit);
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, members]);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "recruiter" as TeamRole,
    department: "",
    title: "",
    phone: "",
    status: "active",
    permissions: {
      canManageJobs: false,
      canReviewApplications: false,
      canManageCandidates: false,
      canManageTeam: false,
      canAccessAnalytics: false,
      canManageClients: false,
      canSendEmails: false,
    },
  });

  const handleAddMember = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!accessToken) {
      toast.error("You must be logged in to add team members");
      return;
    }

    try {
      // Use the auth/register endpoint which automatically sends invitation email
      await registerUser(
        {
          email: formData.email!,
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          role: formData.role,
          department: formData.department,
          title: formData.title,
          phone: formData.phone,
          permissions: formData.permissions,
        },
        accessToken
      );

      toast.success(`Invitation email sent to ${formData.email}`);

      // Refresh the users list
      dispatch(fetchUsers());

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add team member";
      toast.error(errorMessage);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      await dispatch(
        updateUser({
          id: selectedMember.id,
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            title: formData.title,
            phone: formData.phone,
            permissions: formData.permissions,
          } as Partial<BackendUser>,
        })
      ).unwrap();
      toast.success(
        `${formData.firstName} ${formData.lastName} updated successfully`
      );
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      await dispatch(deleteUser(selectedMember.id)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      toast.success(
        `${selectedMember.firstName} ${selectedMember.lastName} has been deleted`
      );
    } catch (error: unknown) {
      console.error("Failed to delete user:", error);
      // Show the backend error message if available
      const errorMessage =
        (error as { message?: string; error?: string }).message ||
        (error as { message?: string; error?: string }).error ||
        "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const handleUpdatePermissions = () => {
    if (!selectedMember) return;

    updateTeamMember(selectedMember.id, { permissions: formData.permissions });

    setIsPermissionsDialogOpen(false);
    setSelectedMember(null);
    resetForm();
    toast.success("Permissions updated successfully");
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      department: member.department || "",
      title: member.title || "",
      status: member.status,
      permissions: { ...member.permissions },
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const openPermissionsDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({ permissions: { ...member.permissions } });
    setIsPermissionsDialogOpen(true);
  };

  const toggleMemberStatus = async (member: TeamMember) => {
    const newIsActive = member.status !== "active";
    try {
      await dispatch(
        updateUser({
          id: member.id,
          data: { isActive: newIsActive } as Partial<BackendUser>,
        })
      ).unwrap();
      toast.success(
        `${member.firstName} ${member.lastName} is now ${
          newIsActive ? "active" : "inactive"
        }`
      );
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "recruiter",
      department: "",
      title: "",
      phone: "",
      status: "active",
      permissions: {
        canManageJobs: false,
        canReviewApplications: false,
        canManageCandidates: false,
        canManageTeam: false,
        canAccessAnalytics: false,
        canManageClients: false,
        canSendEmails: false,
      },
    });
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalStats = members.reduce(
    (acc, member) => ({
      activeJobs: acc.activeJobs + (member.statistics?.activeJobs || 0),
      totalReviews: acc.totalReviews + (member.statistics?.pendingReviews || 0),
      placedCandidates:
        acc.placedCandidates + (member.statistics?.placedCandidates || 0),
    }),
    { activeJobs: 0, totalReviews: 0, placedCandidates: 0 }
  );

  const activeMembers = members.filter((m) => m.status === "active").length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
          <div className="px-3 lg:px-4">
            {/* Header */}
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                    Team Management
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage team members, roles, and permissions
                  </p>
                </div>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                  className="w-full sm:w-auto shrink-0"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4 md:mb-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        Team Members
                      </p>
                      <p className="text-xl md:text-2xl font-bold mt-1">
                        {members.length}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        {activeMembers} active
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        Active Jobs
                      </p>
                      <p className="text-xl md:text-2xl font-bold mt-1">
                        {totalStats.activeJobs}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        Across all members
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                      <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        Pending Reviews
                      </p>
                      <p className="text-xl md:text-2xl font-bold mt-1">
                        {totalStats.totalReviews}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        Requires attention
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                      <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        Total Placements
                      </p>
                      <p className="text-xl md:text-2xl font-bold mt-1">
                        {totalStats.placedCandidates}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                        Successful hires
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 mb-3 md:mb-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring_manager">
                      Hiring Manager
                    </SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/team/${member.id}`)}
                >
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                          {member.avatar &&
                          !member.avatar.includes("dicebear.com") &&
                          !member.avatar.includes("api.dicebear") ? (
                            <AvatarImage src={member.avatar} />
                          ) : null}
                          <AvatarFallback
                            className={`${
                              roleColors[member.role]
                            } text-white font-semibold text-sm md:text-base`}
                          >
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {member.title}
                          </p>
                          <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[10px] md:text-xs"
                            >
                              {roleLabels[member.role]}
                            </Badge>
                            {currentUser?.email === member.email && (
                              <Badge className="text-[10px] md:text-xs bg-blue-500 hover:bg-blue-600">
                                You
                              </Badge>
                            )}
                            {member.status === "active" ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] md:text-xs"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-[10px] md:text-xs"
                              >
                                <XCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={() => openEditDialog(member)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          {member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() => openPermissionsDialog(member)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => toggleMemberStatus(member)}
                          >
                            {member.status === "active" ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(member)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Separator className="my-2 md:my-3" />

                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                          <span className="truncate">{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                        <span className="truncate">{member.department}</span>
                      </div>
                    </div>

                    <Separator className="my-2 md:my-3" />

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-base md:text-lg font-bold">
                          {member.statistics?.activeJobs || 0}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Jobs
                        </p>
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-bold">
                          {member.statistics?.pendingReviews || 0}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Reviews
                        </p>
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-bold">
                          {member.statistics?.placedCandidates || 0}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Placements
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No team members found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add Member Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    Add New Team Member
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Add a new member to your team with specific roles and
                    permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 md:gap-4 py-3 md:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="add-firstName"
                        className="text-xs md:text-sm"
                      >
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="John"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="add-lastName"
                        className="text-xs md:text-sm"
                      >
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Smith"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="add-email" className="text-xs md:text-sm">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="add-phone" className="text-xs md:text-sm">
                        Phone
                      </Label>
                      <Input
                        id="add-phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="add-title" className="text-xs md:text-sm">
                        Job Title
                      </Label>
                      <Input
                        id="add-title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Senior Recruiter"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="add-department"
                        className="text-xs md:text-sm"
                      >
                        Department
                      </Label>
                      <Input
                        id="add-department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        placeholder="Talent Acquisition"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="add-role" className="text-xs md:text-sm">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value as TeamRole })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="hiring_manager">
                          Hiring Manager
                        </SelectItem>
                        <SelectItem value="interviewer">Interviewer</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 md:mb-3 block text-sm md:text-base font-semibold">
                      Permissions
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {[
                        { key: "canManageJobs", label: "Manage Jobs" },
                        {
                          key: "canReviewApplications",
                          label: "Review Applications",
                        },
                        {
                          key: "canManageCandidates",
                          label: "Manage Candidates",
                        },
                        { key: "canManageClients", label: "Manage Clients" },
                        {
                          key: "canAccessAnalytics",
                          label: "Access Analytics",
                        },
                        { key: "canSendEmails", label: "Send Emails" },
                        { key: "canManageTeam", label: "Manage Team" },
                      ].map((permission) => (
                        <div
                          key={permission.key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`add-${permission.key}`}
                            checked={
                              formData.permissions?.[
                                permission.key as keyof typeof formData.permissions
                              ] || false
                            }
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions!,
                                  [permission.key]: checked,
                                },
                              })
                            }
                          />
                          <Label
                            htmlFor={`add-${permission.key}`}
                            className="text-xs md:text-sm font-normal cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    className="w-full sm:w-auto"
                  >
                    Add Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Member Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    Edit Team Member
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Update member information and role
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 md:gap-4 py-3 md:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-firstName"
                        className="text-xs md:text-sm"
                      >
                        First Name
                      </Label>
                      <Input
                        id="edit-firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-lastName"
                        className="text-xs md:text-sm"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="edit-lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-email"
                        className="text-xs md:text-sm"
                      >
                        Email
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-phone"
                        className="text-xs md:text-sm"
                      >
                        Phone
                      </Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-title"
                        className="text-xs md:text-sm"
                      >
                        Job Title
                      </Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label
                        htmlFor="edit-department"
                        className="text-xs md:text-sm"
                      >
                        Department
                      </Label>
                      <Input
                        id="edit-department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="edit-role" className="text-xs md:text-sm">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value as TeamRole })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="hiring_manager">
                          Hiring Manager
                        </SelectItem>
                        <SelectItem value="interviewer">Interviewer</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditMember}
                    className="w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Permissions Dialog */}
            <Dialog
              open={isPermissionsDialogOpen}
              onOpenChange={setIsPermissionsDialogOpen}
            >
              <DialogContent className="max-w-md p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    Manage Permissions
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    {selectedMember &&
                      `Set permissions for ${selectedMember.firstName} ${selectedMember.lastName}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 md:space-y-3 py-3 md:py-4">
                  {[
                    {
                      key: "canManageJobs",
                      label: "Manage Jobs",
                      icon: Briefcase,
                    },
                    {
                      key: "canReviewApplications",
                      label: "Review Applications",
                      icon: CheckCircle2,
                    },
                    {
                      key: "canManageCandidates",
                      label: "Manage Candidates",
                      icon: Users,
                    },
                    {
                      key: "canManageClients",
                      label: "Manage Clients",
                      icon: Building2,
                    },
                    {
                      key: "canAccessAnalytics",
                      label: "Access Analytics",
                      icon: Trophy,
                    },
                    { key: "canSendEmails", label: "Send Emails", icon: Mail },
                    {
                      key: "canManageTeam",
                      label: "Manage Team",
                      icon: Shield,
                    },
                  ].map((permission) => {
                    const Icon = permission.icon;
                    return (
                      <div
                        key={permission.key}
                        className="flex items-center justify-between p-2 md:p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
                          <Label
                            htmlFor={`perm-${permission.key}`}
                            className="text-xs md:text-sm font-normal cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                        </div>
                        <Checkbox
                          id={`perm-${permission.key}`}
                          checked={
                            formData.permissions?.[
                              permission.key as keyof typeof formData.permissions
                            ] || false
                          }
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions!,
                                [permission.key]: checked,
                              },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPermissionsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdatePermissions}
                    className="w-full sm:w-auto"
                  >
                    Update Permissions
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent className="max-w-md p-4 md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    Delete Team Member
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold">
                      {selectedMember &&
                        `${selectedMember.firstName} ${selectedMember.lastName}`}
                    </span>
                    ?
                    <br />
                    <br />
                    <span className="text-red-600 font-medium">
                      This action cannot be undone.
                    </span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Note: Users with active candidates or job assignments
                      cannot be deleted.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMember}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Permanently
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
