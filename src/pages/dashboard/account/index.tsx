import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User as UserIcon, Mail, Phone, Building, Shield, Bell, Lock, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/lib/auth";
import { authService } from "@/services/auth.service";

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

  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
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

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicationAlerts: true,
    jobAlerts: false,
    weeklyReports: true,
    candidateUpdates: true,
    systemUpdates: false,
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    
    try {
      if (!accessToken) {
        throw new Error('Not authenticated');
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
        throw new Error('Not authenticated');
      }

      // Call API to change password
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, accessToken);

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

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification preferences updated!");
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
    if (!file.type.startsWith('image/')) {
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

          await authService.updateProfile({ avatar: base64String }, accessToken);
          
          // Update local state only after successful save
          setProfilePhoto(base64String);
          toast.success("Profile photo updated!");
        } catch (error) {
          console.error('Photo upload error:', error);
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
      console.error('Photo upload error:', error);
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
        return <Badge className="bg-purple-600"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case "recruiter":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Recruiter</Badge>;
      case "hiring_manager":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hiring Manager</Badge>;
      case "viewer":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
                  <p className="text-muted-foreground">
                    Manage your profile information, security settings, and preferences
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePhoto} alt={profileData.firstName} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profileData.firstName, profileData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      {userRole && getRoleBadge(userRole)}
                    </div>
                    <p className="text-muted-foreground mb-3">{profileData.title || 'No title set'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {profileData.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {profileData.phone || 'No phone set'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {profileData.department || 'No department set'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Jobs</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Placed Candidates</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending Reviews</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Emails Sent</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 p-1 bg-card border border-border w-fit">
                <TabsTrigger
                  value="profile"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Permissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Profile Photo</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={profilePhoto} alt={profileData.firstName} />
                            <AvatarFallback className="text-xl">
                              {getInitials(profileData.firstName, profileData.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Label htmlFor="photo-upload" className="cursor-pointer">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                asChild
                                disabled={isPhotoUploading}
                              >
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  {isPhotoUploading ? 'Uploading...' : 'Change Photo'}
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
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG or GIF. Max size 2MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed here. Contact your administrator to update.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={profileData.department}
                            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            value={profileData.title}
                            onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" disabled={isProfileLoading}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isProfileLoading}>
                          {isProfileLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
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

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
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
                        <Button type="submit" disabled={isPasswordLoading}>
                          {isPasswordLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
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

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notifications.emailNotifications}
                        onCheckedChange={() => handleNotificationChange('emailNotifications')}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="applicationAlerts">Application Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when new applications are received
                        </p>
                      </div>
                      <Switch
                        id="applicationAlerts"
                        checked={notifications.applicationAlerts}
                        onCheckedChange={() => handleNotificationChange('applicationAlerts')}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="jobAlerts">Job Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications about job postings and updates
                        </p>
                      </div>
                      <Switch
                        id="jobAlerts"
                        checked={notifications.jobAlerts}
                        onCheckedChange={() => handleNotificationChange('jobAlerts')}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weeklyReports">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly summary of your activities
                        </p>
                      </div>
                      <Switch
                        id="weeklyReports"
                        checked={notifications.weeklyReports}
                        onCheckedChange={() => handleNotificationChange('weeklyReports')}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="candidateUpdates">Candidate Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about candidate status changes
                        </p>
                      </div>
                      <Switch
                        id="candidateUpdates"
                        checked={notifications.candidateUpdates}
                        onCheckedChange={() => handleNotificationChange('candidateUpdates')}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemUpdates">System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Important system and feature updates
                        </p>
                      </div>
                      <Switch
                        id="systemUpdates"
                        checked={notifications.systemUpdates}
                        onCheckedChange={() => handleNotificationChange('systemUpdates')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Permissions</CardTitle>
                    <CardDescription>
                      Your current role and permissions in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium">Your Role:</span>
                      {userRole && getRoleBadge(userRole)}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Your Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Always enabled base permissions */}
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          View Dashboard
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Manage Profile
                        </div>
                        
                        {/* Dynamic permissions from backend */}
                        {user?.permissions?.canManageClients && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Manage Clients
                          </div>
                        )}
                        {user?.permissions?.canManageJobs && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Manage Jobs
                          </div>
                        )}
                        {user?.permissions?.canReviewApplications && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Review Applications
                          </div>
                        )}
                        {user?.permissions?.canManageCandidates && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Manage Candidates
                          </div>
                        )}
                        {user?.permissions?.canSendEmails && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Send Emails
                          </div>
                        )}
                        {user?.permissions?.canManageTeam && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Manage Team
                          </div>
                        )}
                        {user?.permissions?.canAccessAnalytics && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Access Analytics
                          </div>
                        )}
                      </div>
                      
                      {userRole === 'admin' && (
                        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-primary font-medium">
                            🎉 As an admin, you have full access to all system features and permissions.
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-4">
                        Your specific permissions are determined by your role and can be customized by your administrator.
                      </p>
                    </div>

                    {userRole !== 'admin' && (
                      <>
                        <Separator />

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <Bell className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-900">
                                Need Additional Access?
                              </p>
                              <p className="text-sm text-amber-700 mt-1">
                                Contact your administrator if you need additional permissions or role changes.
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
