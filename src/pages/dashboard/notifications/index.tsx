import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell,
  Check,
  CheckCheck,
  Briefcase,
  UserPlus,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  Trash2,
  Settings,
  Shield,
  Plus,
  Megaphone
} from "lucide-react";
import { useNotifications } from "@/store/hooks/useNotifications";
import { useTeam } from "@/store/hooks/useTeam";
import { toast } from "sonner";
import type { NotificationType } from "@/store/slices/notificationsSlice";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, createNotification, broadcastImportantNotice } = useNotifications();
  const { teamMembers, fetchTeam } = useTeam();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    fetchTeam();
  }, [fetchNotifications, fetchTeam]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");

  const [newNotification, setNewNotification] = useState({
    type: "system" as NotificationType,
    title: "",
    message: "",
  });

  const [importantNotice, setImportantNotice] = useState({
    type: "system" as NotificationType,
    title: "",
    message: "",
    priority: "high" as 'low' | 'medium' | 'high' | 'urgent',
    expiresAt: "",
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "application":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "interview":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "status_change":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "job":
        return <Briefcase className="h-5 w-5 text-green-600" />;
      case "offer":
        return <CheckCheck className="h-5 w-5 text-emerald-600" />;
      case "team":
        return <Users className="h-5 w-5 text-indigo-600" />;
      case "reminder":
        return <Bell className="h-5 w-5 text-orange-600" />;
      case "client":
        return <UserPlus className="h-5 w-5 text-cyan-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: NotificationType) => {
    switch (type) {
      case "application":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "interview":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "status_change":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "job":
        return "bg-green-50 text-green-700 border-green-200";
      case "offer":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "team":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "reminder":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "client":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "system":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast.success("Notification marked as read");
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    toast.success("Notification deleted");
  };

  const handleCreateNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    createNotification({
      type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      read: false,
      createdAt: new Date().toISOString(),
      relatedEntity: null,
    });
    setNewNotification({ type: "system", title: "", message: "" });
    toast.success("Notification created and sent to all users!");
  };

  const handleBroadcastImportantNotice = async () => {
    if (!importantNotice.title.trim() || !importantNotice.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await broadcastImportantNotice({
        type: importantNotice.type,
        title: importantNotice.title,
        message: importantNotice.message,
        priority: importantNotice.priority,
        expiresAt: importantNotice.expiresAt || undefined,
      });
      setImportantNotice({ type: "system", title: "", message: "", priority: "high", expiresAt: "" });
      toast.success("Important notice broadcast to all team members!");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to broadcast important notice");
    }
  };

  // Filter out expired important notices
  const activeNotifications = notifications.filter(n => {
    // If it's an important notice with expiration date
    if (n.isImportant && n.expiresAt) {
      const expirationDate = new Date(n.expiresAt);
      const now = new Date();
      // Only show if not expired
      return expirationDate > now;
    }
    // Show all non-important or important without expiration
    return true;
  });

  const filteredNotifications = activeNotifications.filter(n => {
    if (filterType === "unread") return !n.read;
    if (filterType === "read") return n.read;
    return true;
  });

  // Sort notifications: important ones first, then by date
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const notificationsByType = activeNotifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);

  const importantCount = activeNotifications.filter(n => n.isImportant).length;

  const getPriorityBadge = (priority?: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-destructive text-white text-xs">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-600 text-white text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-amber-600 text-white text-xs">Medium Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600/10 p-2">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
                    <p className="text-muted-foreground">
                      Stay updated with your latest activities
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{notifications.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unread</p>
                      <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{unreadCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Important</p>
                      <p className="text-2xl font-bold text-primary">{importantCount}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Applications</p>
                      <p className="text-2xl font-bold">{notificationsByType.application || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Interviews</p>
                      <p className="text-2xl font-bold">{notificationsByType.interview || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-11 p-1 bg-card border border-border w-fit mb-4">
                <TabsTrigger
                  value="all"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                  onClick={() => setFilterType("all")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                  onClick={() => setFilterType("unread")}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger
                  value="read"
                  className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                  onClick={() => setFilterType("read")}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Read ({notifications.length - unreadCount})
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger
                    value="admin"
                    className="px-6 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No notifications</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  sortedNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${
                        notification.isImportant
                          ? "border-l-4 border-l-primary bg-primary/5 shadow-lg"
                          : !notification.read
                            ? "border-l-4 border-l-blue-600 bg-blue-50/30"
                            : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-2">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              getNotificationIcon(notification.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold ${notification.isImportant ? 'text-primary' : 'text-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs whitespace-nowrap ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="unread" className="space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No unread notifications</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  sortedNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${
                        notification.isImportant
                          ? "border-l-4 border-l-primary bg-primary/5 shadow-lg"
                          : !notification.read
                            ? "border-l-4 border-l-blue-600 bg-blue-50/30"
                            : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-2">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              getNotificationIcon(notification.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold ${notification.isImportant ? 'text-primary' : 'text-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs whitespace-nowrap ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No read notifications</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  sortedNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${
                        notification.isImportant
                          ? "border-l-4 border-l-primary bg-primary/5 shadow-lg"
                          : !notification.read
                            ? "border-l-4 border-l-blue-600 bg-blue-50/30"
                            : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-2">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                            ) : (
                              getNotificationIcon(notification.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold ${notification.isImportant ? 'text-primary' : 'text-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs whitespace-nowrap ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin" className="space-y-6">
                  {/* Important Notice Section */}
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Shield className="h-5 w-5" />
                        Broadcast Important Notice
                      </CardTitle>
                      <CardDescription>
                        Send a high-priority important notice to all team members. This will be highlighted prominently in their notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="important-type">Notice Type</Label>
                          <Select
                            value={importantNotice.type}
                            onValueChange={(value) =>
                              setImportantNotice({ ...importantNotice, type: value as NotificationType })
                            }
                          >
                            <SelectTrigger id="important-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="system">System Announcement</SelectItem>
                              <SelectItem value="reminder">Important Reminder</SelectItem>
                              <SelectItem value="team">Team Notice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="important-priority">Priority Level</Label>
                          <Select
                            value={importantNotice.priority}
                            onValueChange={(value) =>
                              setImportantNotice({ ...importantNotice, priority: value as 'low' | 'medium' | 'high' | 'urgent' })
                            }
                          >
                            <SelectTrigger id="important-priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="important-title">Title *</Label>
                        <Input
                          id="important-title"
                          placeholder="e.g., System Maintenance Scheduled"
                          value={importantNotice.title}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="important-message">Message *</Label>
                        <Textarea
                          id="important-message"
                          placeholder="Enter detailed message for all team members..."
                          rows={5}
                          value={importantNotice.message}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="important-expires">Expiration Date (Optional)</Label>
                        <Input
                          id="important-expires"
                          type="datetime-local"
                          value={importantNotice.expiresAt}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, expiresAt: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          If set, the notice will be automatically hidden after this date
                        </p>
                      </div>

                      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              Important Notice - High Visibility
                            </p>
                            <p className="text-sm text-amber-800 mt-1">
                              This will be sent to ALL active team members and displayed prominently at the top of their notifications with a special badge.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleBroadcastImportantNotice}>
                          <Megaphone className="h-4 w-4 mr-2" />
                          Broadcast Important Notice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regular Notification Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Create Regular Notification
                      </CardTitle>
                      <CardDescription>
                        Send a standard notification to all users. Use this for general announcements or updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="notif-type">Notification Type</Label>
                        <Select
                          value={newNotification.type}
                          onValueChange={(value) =>
                            setNewNotification({ ...newNotification, type: value as NotificationType })
                          }
                        >
                          <SelectTrigger id="notif-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="job">Job</SelectItem>
                            <SelectItem value="application">Application</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="status_change">Status Change</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notif-title">Title</Label>
                        <Input
                          id="notif-title"
                          placeholder="Enter notification title"
                          value={newNotification.title}
                          onChange={(e) =>
                            setNewNotification({ ...newNotification, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notif-message">Message</Label>
                        <Textarea
                          id="notif-message"
                          placeholder="Enter notification message"
                          rows={4}
                          value={newNotification.message}
                          onChange={(e) =>
                            setNewNotification({ ...newNotification, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              Broadcasting to All Users
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              This notification will be sent to all users in the system. Make sure your message is clear and relevant.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleCreateNotification}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create & Send Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
