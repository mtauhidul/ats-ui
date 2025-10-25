import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Briefcase,
  Users,
  Trophy,
  MoreVertical,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useTeam, useAppSelector } from "@/store/hooks/index";
import { selectTeam } from "@/store/selectors";
import type { TeamMember, TeamRole } from "@/types";

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const roleColors: Record<string, string> = {
  admin: "bg-primary",
  recruiter: "bg-primary/80",
  hiring_manager: "bg-primary/60",
  viewer: "bg-muted-foreground",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  viewer: "Viewer",
};

export default function TeamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { fetchTeam, createTeamMember, updateTeamMember, deleteTeamMember } = useTeam();
  const members = useAppSelector(selectTeam) as TeamMember[];

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

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
      const memberToEdit = members.find(m => m.id === state.editMemberId);
      if (memberToEdit) {
        openEditDialog(memberToEdit);
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, members]);
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

  const handleAddMember = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTeamMember(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditMember = () => {
    if (!selectedMember) return;

    updateTeamMember(selectedMember.id, formData);
    setIsEditDialogOpen(false);
    setSelectedMember(null);
    resetForm();
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;

    deleteTeamMember(selectedMember.id);
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
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
    setFormData({ ...member });
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

  const toggleMemberStatus = (member: TeamMember) => {
    const newStatus = member.status === "active" ? "inactive" : "active";
    updateTeamMember(member.id, { status: newStatus });
    toast.success(
      `${member.firstName} ${member.lastName} is now ${newStatus}`
    );
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
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalStats = members.reduce(
    (acc, member) => ({
      activeJobs: acc.activeJobs + (member.statistics?.activeJobs || 0),
      totalReviews: acc.totalReviews + (member.statistics?.pendingReviews || 0),
      placedCandidates: acc.placedCandidates + (member.statistics?.placedCandidates || 0),
    }),
    { activeJobs: 0, totalReviews: 0, placedCandidates: 0 }
  );

  const activeMembers = members.filter((m) => m.status === "active").length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Team Management</h2>
                  <p className="text-muted-foreground">
                    Manage team members, roles, and permissions
                  </p>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                      <p className="text-2xl font-bold mt-1">{members.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeMembers} active
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                      <p className="text-2xl font-bold mt-1">{totalStats.activeJobs}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all members
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                      <p className="text-2xl font-bold mt-1">{totalStats.totalReviews}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requires attention
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                      <p className="text-2xl font-bold mt-1">{totalStats.placedCandidates}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Successful hires
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                  <SelectItem value="interviewer">Interviewer</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/team/${member.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          {member.avatar && !member.avatar.includes('dicebear.com') && !member.avatar.includes('api.dicebear') ? (
                            <AvatarImage src={member.avatar} />
                          ) : null}
                          <AvatarFallback className={`${roleColors[member.role]} text-white font-semibold text-base`}>
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{member.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {roleLabels[member.role]}
                            </Badge>
                            {member.status === "active" ? (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
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
                            className="flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEditDialog(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPermissionsDialog(member)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleMemberStatus(member)}>
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

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{member.department}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{member.statistics?.activeJobs || 0}</p>
                        <p className="text-xs text-muted-foreground">Jobs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{member.statistics?.pendingReviews || 0}</p>
                        <p className="text-xs text-muted-foreground">Reviews</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{member.statistics?.placedCandidates || 0}</p>
                        <p className="text-xs text-muted-foreground">Placements</p>
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
                  <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add Member Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to your team with specific roles and permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-firstName">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-lastName">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input
                        id="add-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-title">Job Title</Label>
                      <Input
                        id="add-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Senior Recruiter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-department">Department</Label>
                      <Input
                        id="add-department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Talent Acquisition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as TeamRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                        <SelectItem value="interviewer">Interviewer</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block text-base font-semibold">Permissions</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "canManageJobs", label: "Manage Jobs" },
                        { key: "canReviewApplications", label: "Review Applications" },
                        { key: "canManageCandidates", label: "Manage Candidates" },
                        { key: "canManageClients", label: "Manage Clients" },
                        { key: "canAccessAnalytics", label: "Access Analytics" },
                        { key: "canSendEmails", label: "Send Emails" },
                        { key: "canManageTeam", label: "Manage Team" },
                      ].map((permission) => (
                        <div key={permission.key} className="flex items-center space-x-2">
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
                          <Label htmlFor={`add-${permission.key}`} className="text-sm font-normal cursor-pointer">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Member Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Team Member</DialogTitle>
                  <DialogDescription>
                    Update member information and role
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Job Title</Label>
                      <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-department">Department</Label>
                      <Input
                        id="edit-department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as TeamRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                        <SelectItem value="interviewer">Interviewer</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditMember}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Permissions Dialog */}
            <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Permissions</DialogTitle>
                  <DialogDescription>
                    {selectedMember && `Set permissions for ${selectedMember.firstName} ${selectedMember.lastName}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {[
                    { key: "canManageJobs", label: "Manage Jobs", icon: Briefcase },
                    { key: "canReviewApplications", label: "Review Applications", icon: CheckCircle2 },
                    { key: "canManageCandidates", label: "Manage Candidates", icon: Users },
                    { key: "canManageClients", label: "Manage Clients", icon: Building2 },
                    { key: "canAccessAnalytics", label: "Access Analytics", icon: Trophy },
                    { key: "canSendEmails", label: "Send Emails", icon: Mail },
                    { key: "canManageTeam", label: "Manage Team", icon: Shield },
                  ].map((permission) => {
                    const Icon = permission.icon;
                    return (
                      <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`perm-${permission.key}`} className="text-sm font-normal cursor-pointer">
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePermissions}>Update Permissions</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Remove Team Member</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove{" "}
                    {selectedMember && `${selectedMember.firstName} ${selectedMember.lastName}`} from the team?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteMember}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Member
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
