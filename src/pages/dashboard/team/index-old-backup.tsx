import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconUserPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconShield,
  IconBriefcase,
  IconUsers,
  IconTrophy,
  IconUpload,
} from "@tabler/icons-react";
import teamData from "@/lib/mock-data/team.json";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  title: string;
  status: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  statistics: {
    activeJobs: number;
    placedCandidates: number;
    pendingReviews: number;
    emailsSent: number;
  };
  permissions: {
    canManageJobs: boolean;
    canReviewApplications: boolean;
    canManageCandidates: boolean;
    canManageTeam: boolean;
    canAccessAnalytics: boolean;
    canManageClients: boolean;
    canSendEmails: boolean;
  };
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  recruiter: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  hiring_manager: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  viewer: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: "Admin",
    recruiter: "Recruiter",
    hiring_manager: "Hiring Manager",
    viewer: "Viewer",
  };
  return labels[role] || role;
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(teamData as TeamMember[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    title: "",
    status: "active",
    avatar: "",
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = () => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      role: formData.role || "",
      department: formData.department || "",
      title: formData.title || "",
      status: formData.status || "active",
      createdAt: new Date().toISOString(),
      avatar: formData.avatar,
      statistics: {
        activeJobs: 0,
        placedCandidates: 0,
        pendingReviews: 0,
        emailsSent: 0,
      },
      permissions: formData.permissions || {
        canManageJobs: false,
        canReviewApplications: false,
        canManageCandidates: false,
        canManageTeam: false,
        canAccessAnalytics: false,
        canManageClients: false,
        canSendEmails: false,
      },
    };
    setMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditMember = () => {
    if (!selectedMember) return;
    setMembers(
      members.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              firstName: formData.firstName || m.firstName,
              lastName: formData.lastName || m.lastName,
              email: formData.email || m.email,
              role: formData.role || m.role,
              department: formData.department || m.department,
              title: formData.title || m.title,
              status: formData.status || m.status,
              avatar: formData.avatar !== undefined ? formData.avatar : m.avatar,
            }
          : m
      )
    );
    setIsEditDialogOpen(false);
    setSelectedMember(null);
    resetForm();
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    setMembers(members.filter((m) => m.id !== selectedMember.id));
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const handleUpdatePermissions = () => {
    if (!selectedMember) return;
    setMembers(
      members.map((m) =>
        m.id === selectedMember.id
          ? { ...m, permissions: formData.permissions || m.permissions }
          : m
      )
    );
    setIsPermissionsDialogOpen(false);
    setSelectedMember(null);
    resetForm();
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      department: member.department,
      title: member.title,
      status: member.status,
      avatar: member.avatar,
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

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      department: "",
      title: "",
      status: "active",
      avatar: "",
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
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalStats = members.reduce(
    (acc, member) => ({
      activeJobs: acc.activeJobs + member.statistics.activeJobs,
      totalReviews: acc.totalReviews + member.statistics.pendingReviews,
      placedCandidates: acc.placedCandidates + member.statistics.placedCandidates,
    }),
    { activeJobs: 0, totalReviews: 0, placedCandidates: 0 }
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Team Management</h2>
              <p className="text-muted-foreground">
                Manage team members, roles, permissions, and performance
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconUsers className="h-5 w-5 text-blue-500" />
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                </div>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconBriefcase className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                </div>
                <p className="text-2xl font-bold">{totalStats.activeJobs}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconUsers className="h-5 w-5 text-purple-500" />
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                </div>
                <p className="text-2xl font-bold">{totalStats.totalReviews}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconTrophy className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-medium text-muted-foreground">Placements</p>
                </div>
                <p className="text-2xl font-bold">{totalStats.placedCandidates}</p>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <IconUserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to your team with specific roles and permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={formData.avatar} />
                        <AvatarFallback>
                          {formData.firstName && formData.lastName ? getInitials(`${formData.firstName} ${formData.lastName}`) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="photo" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                            <IconUpload className="h-4 w-4" />
                            Upload Photo
                          </div>
                        </Label>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF (max 2MB)
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Smith"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Senior Recruiter"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                          }
                          placeholder="Recruiting"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-3 block">Permissions</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "canManageJobs", label: "Manage Jobs" },
                          { key: "canReviewApplications", label: "Review Applications" },
                          { key: "canManageCandidates", label: "Manage Candidates" },
                          { key: "canManageTeam", label: "Manage Team" },
                          { key: "canAccessAnalytics", label: "Access Analytics" },
                          { key: "canManageClients", label: "Manage Clients" },
                          { key: "canSendEmails", label: "Send Emails" },
                        ].map((permission) => (
                          <div key={permission.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.key}
                              checked={
                                formData.permissions?.[
                                  permission.key as keyof typeof formData.permissions
                                ] || false
                              }
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  permissions: {
                                    ...formData.permissions,
                                    [permission.key]: checked,
                                  } as typeof formData.permissions,
                                })
                              }
                            />
                            <Label htmlFor={permission.key} className="text-sm font-normal">
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
            </div>

            {/* Team Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Pending Reviews</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Emails Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No team members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{getInitials(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={roleColors[member.role] || ""}
                          >
                            {getRoleLabel(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <Badge
                            variant={member.status === "active" ? "default" : "secondary"}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.statistics.activeJobs}</TableCell>
                        <TableCell>{member.statistics.pendingReviews}</TableCell>
                        <TableCell>{member.statistics.placedCandidates}</TableCell>
                        <TableCell>{member.statistics.emailsSent}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPermissionsDialog(member)}
                            >
                              <IconShield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(member)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(member)}
                            >
                              <IconTrash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback>
                  {formData.firstName && formData.lastName ? getInitials(`${formData.firstName} ${formData.lastName}`) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="edit-photo" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <IconUpload className="h-4 w-4" />
                    Upload New Photo
                  </div>
                </Label>
                <Input
                  id="edit-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.firstName} {selectedMember?.lastName} from the team? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Configure access permissions for {selectedMember?.firstName} {selectedMember?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { key: "canManageJobs", label: "Manage Jobs", desc: "Create, edit, and delete job postings" },
              { key: "canReviewApplications", label: "Review Applications", desc: "Review and process applications" },
              { key: "canManageCandidates", label: "Manage Candidates", desc: "Manage candidate profiles and status" },
              { key: "canManageTeam", label: "Manage Team", desc: "Add, edit, and remove team members" },
              { key: "canAccessAnalytics", label: "Access Analytics", desc: "Access reports and analytics" },
              { key: "canManageClients", label: "Manage Clients", desc: "Manage client relationships" },
              { key: "canSendEmails", label: "Send Emails", desc: "Send emails to candidates and clients" },
            ].map((permission) => (
              <div key={permission.key} className="flex items-start space-x-3 rounded-lg border p-3">
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
                        ...formData.permissions,
                        [permission.key]: checked,
                      } as typeof formData.permissions,
                    })
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={`perm-${permission.key}`} className="font-medium">
                    {permission.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{permission.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
