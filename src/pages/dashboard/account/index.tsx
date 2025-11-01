import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/lib/auth";
import { authService } from "@/services/auth.service";
import {
  Bell,
  Building,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, isLoading, accessToken } = useAuth();
  const userRole = useUserRole();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    title: "",
  });

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        title: user.title || "",
      });

      // Set avatar if available
      if (user.avatar) {
        setProfilePhoto(user.avatar);
      }
    }
  }, [user]);

  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      // Call API to update profile
      await authService.updateProfile(profileData, accessToken);

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    setIsPasswordLoading(true);

    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      // Call API to change password
      await authService.updatePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        accessToken
      );

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      toast.error("Failed to change password");
      console.error(error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsPhotoUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;

          // Update profile with avatar
          if (!accessToken) {
            toast.error("Not authenticated");
            setIsPhotoUploading(false);
            return;
          }

          await authService.updateProfile(
            { avatar: base64String },
            accessToken
          );

          // Update local state only after successful save
          setProfilePhoto(base64String);
          toast.success("Profile photo updated!");
        } catch (error) {
          console.error("Photo upload error:", error);
          toast.error("Failed to save profile photo");
        } finally {
          setIsPhotoUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsPhotoUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload profile photo");
      setIsPhotoUploading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-600 text-xs md:text-sm h-5 md:h-6">
            <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            Admin
          </Badge>
        );
      case "recruiter":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 text-xs md:text-sm h-5 md:h-6"
          >
            Recruiter
          </Badge>
        );
      case "hiring_manager":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 text-xs md:text-sm h-5 md:h-6"
          >
            Hiring Manager
          </Badge>
        );
      case "viewer":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 text-xs md:text-sm h-5 md:h-6"
          >
            Viewer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs md:text-sm h-5 md:h-6">
            {role}
          </Badge>
        );
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader size="md" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-1.5 md:p-2 shrink-0">
                  <UserIcon className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-foreground">
                    Account Settings
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage your profile information, security settings, and
                    preferences
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-4 md:mb-6">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 shrink-0">
                    <AvatarImage
                      src={profilePhoto}
                      alt={profileData.firstName}
                    />
                    <AvatarFallback className="text-xl md:text-2xl">
                      {getInitials(profileData.firstName, profileData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold break-word">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      {userRole && getRoleBadge(userRole)}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-3">
                      {profileData.title || "No title set"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <span className="truncate">{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <span className="truncate">
                          {profileData.phone || "No phone set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Building className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                        <span className="truncate">
                          {profileData.department || "No department set"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="h-9 md:h-11 p-1 bg-card border border-border w-full md:w-fit inline-flex">
                  <TabsTrigger
                    value="profile"
                    className="flex-1 md:flex-initial px-2 md:px-6 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap"
                  >
                    <UserIcon className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex-1 md:flex-initial px-2 md:px-6 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap"
                  >
                    <Lock className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="flex-1 md:flex-initial px-2 md:px-6 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Permissions</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Update your profile details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleProfileSubmit}
                      className="space-y-3 md:space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">
                          Profile Photo
                        </Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                          <Avatar className="h-16 w-16 md:h-20 md:w-20 shrink-0">
                            <AvatarImage
                              src={profilePhoto}
                              alt={profileData.firstName}
                            />
                            <AvatarFallback className="text-lg md:text-xl">
                              {getInitials(
                                profileData.firstName,
                                profileData.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="w-full sm:w-auto">
                            <Label
                              htmlFor="photo-upload"
                              className="cursor-pointer"
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto"
                                asChild
                                disabled={isPhotoUploading}
                              >
                                <span>
                                  <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                                  {isPhotoUploading
                                    ? "Uploading..."
                                    : "Change Photo"}
                                </span>
                              </Button>
                            </Label>
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoUpload}
                              disabled={isPhotoUploading}
                            />
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                              JPG, PNG or GIF. Max size 2MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-xs md:text-sm"
                          >
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            className="h-9 md:h-10 text-xs md:text-sm"
                            value={profileData.firstName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-xs md:text-sm"
                          >
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            className="h-9 md:h-10 text-xs md:text-sm"
                            value={profileData.lastName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs md:text-sm">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          className="h-9 md:h-10 text-xs md:text-sm bg-muted cursor-not-allowed"
                          value={profileData.email}
                          disabled
                        />
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Email cannot be changed here. Contact your
                          administrator to update.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs md:text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          className="h-9 md:h-10 text-xs md:text-sm"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="department"
                            className="text-xs md:text-sm"
                          >
                            Department
                          </Label>
                          <Input
                            id="department"
                            className="h-9 md:h-10 text-xs md:text-sm"
                            value={profileData.department}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                department: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-xs md:text-sm">
                            Job Title
                          </Label>
                          <Input
                            id="title"
                            className="h-9 md:h-10 text-xs md:text-sm"
                            value={profileData.title}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 md:pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto"
                          disabled={isProfileLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto"
                          disabled={isProfileLoading}
                        >
                          {isProfileLoading ? (
                            <>
                              <Loader size="sm" />
                              <span className="ml-2">Saving...</span>
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">
                      Change Password
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="space-y-3 md:space-y-4"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="currentPassword"
                          className="text-xs md:text-sm"
                        >
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            className="h-9 md:h-10 text-xs md:text-sm pr-10"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-9 md:h-10 px-2 md:px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="newPassword"
                          className="text-xs md:text-sm"
                        >
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            className="h-9 md:h-10 text-xs md:text-sm pr-10"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-9 md:h-10 px-2 md:px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Must be at least 8 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-xs md:text-sm"
                        >
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="h-9 md:h-10 text-xs md:text-sm pr-10"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-9 md:h-10 px-2 md:px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 md:pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto"
                          disabled={isPasswordLoading}
                          onClick={() => {
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto"
                          disabled={isPasswordLoading}
                        >
                          {isPasswordLoading ? (
                            <>
                              <Loader size="sm" />
                              <span className="ml-2">Updating...</span>
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="mt-4 md:mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">
                      Account Permissions
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Your current role and permissions in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                      <span className="text-xs md:text-sm font-medium">
                        Your Role:
                      </span>
                      {userRole && getRoleBadge(userRole)}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs md:text-sm font-medium">
                        Your Permissions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {/* Always enabled base permissions */}
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                          <span>View Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                          <span>Manage Profile</span>
                        </div>

                        {/* Dynamic permissions from backend */}
                        {user?.permissions?.canManageClients && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Manage Clients</span>
                          </div>
                        )}
                        {user?.permissions?.canManageJobs && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Manage Jobs</span>
                          </div>
                        )}
                        {user?.permissions?.canReviewApplications && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Review Applications</span>
                          </div>
                        )}
                        {user?.permissions?.canManageCandidates && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Manage Candidates</span>
                          </div>
                        )}
                        {user?.permissions?.canSendEmails && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Send Emails</span>
                          </div>
                        )}
                        {user?.permissions?.canManageTeam && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Manage Team</span>
                          </div>
                        )}
                        {user?.permissions?.canAccessAnalytics && (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span>Access Analytics</span>
                          </div>
                        )}
                      </div>

                      {userRole === "admin" && (
                        <div className="mt-3 md:mt-4 p-2.5 md:p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-xs md:text-sm text-primary font-medium">
                            🎉 As an admin, you have full access to all system
                            features and permissions.
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
                        Your specific permissions are determined by your role
                        and can be customized by your administrator.
                      </p>
                    </div>

                    {userRole !== "admin" && (
                      <>
                        <Separator />

                        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 md:p-4">
                          <div className="flex items-start gap-2 md:gap-3">
                            <Bell className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm font-medium text-amber-900 dark:text-amber-200">
                                Need Additional Access?
                              </p>
                              <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Contact your administrator if you need
                                additional permissions or role changes.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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
