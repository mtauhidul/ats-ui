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
  const { fetchTeam } = useTeam();
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
    } catch {
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
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="rounded-lg bg-blue-600/10 p-1.5 md:p-2 shrink-0">
                    <Bell className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-foreground">Notifications</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Stay updated with your latest activities
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto">
                    <CheckCheck className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
              <Card>
                <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">Total</p>
                      <p className="text-lg md:text-2xl font-bold">{notifications.length}</p>
                    </div>
                    <Bell className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">Unread</p>
                      <p className="text-lg md:text-2xl font-bold text-blue-600">{unreadCount}</p>
                    </div>
                    <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-bold text-xs md:text-sm">{unreadCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">Important</p>
                      <p className="text-lg md:text-2xl font-bold text-primary">{importantCount}</p>
                    </div>
                    <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">Applications</p>
                      <p className="text-lg md:text-2xl font-bold">{notificationsByType.application || 0}</p>
                    </div>
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">Interviews</p>
                      <p className="text-lg md:text-2xl font-bold">{notificationsByType.interview || 0}</p>
                    </div>
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-3 md:mb-4">
                <TabsList className="h-9 md:h-11 p-1 bg-card border border-border w-full md:w-fit inline-flex">
                  <TabsTrigger
                    value="all"
                    className="flex-1 md:flex-initial px-2 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
                    onClick={() => setFilterType("all")}
                  >
                    <Bell className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">All ({notifications.length})</span>
                    <span className="md:hidden ml-1">({notifications.length})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="flex-1 md:flex-initial px-2 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
                    onClick={() => setFilterType("unread")}
                  >
                    <AlertCircle className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Unread ({unreadCount})</span>
                    <span className="md:hidden ml-1">({unreadCount})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="read"
                    className="flex-1 md:flex-initial px-2 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
                    onClick={() => setFilterType("read")}
                  >
                    <CheckCheck className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Read ({notifications.length - unreadCount})</span>
                    <span className="md:hidden ml-1">({notifications.length - unreadCount})</span>
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger
                      value="admin"
                      className="flex-1 md:flex-initial px-2 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground whitespace-nowrap text-xs md:text-sm"
                    >
                      <Shield className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Admin</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-2 md:space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 md:py-12">
                      <div className="text-center">
                        <Bell className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 md:mb-3" />
                        <p className="text-sm md:text-base text-muted-foreground">No notifications</p>
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
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-4">
                          <div className="mt-0.5 md:mt-1 shrink-0">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-1.5 md:p-2">
                                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="[&>svg]:h-4 [&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap min-w-0">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-[10px] md:text-xs shrink-0">
                                    <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold text-sm md:text-base ${notification.isImportant ? 'text-primary' : 'text-foreground'} wrap-break-word`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-[10px] md:text-xs shrink-0">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] md:text-xs whitespace-nowrap shrink-0 ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-xs md:text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'} wrap-break-word`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-[10px] md:text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-1 md:gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                    <span className="hidden md:inline">Mark as read</span>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 md:h-8 px-2 md:px-3"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
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

              <TabsContent value="unread" className="space-y-2 md:space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 md:py-12">
                      <div className="text-center">
                        <Bell className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 md:mb-3" />
                        <p className="text-sm md:text-base text-muted-foreground">No unread notifications</p>
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
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-4">
                          <div className="mt-0.5 md:mt-1 shrink-0">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-1.5 md:p-2">
                                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="[&>svg]:h-4 [&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap min-w-0">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-[10px] md:text-xs shrink-0">
                                    <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold text-sm md:text-base ${notification.isImportant ? 'text-primary' : 'text-foreground'} wrap-break-word`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-[10px] md:text-xs shrink-0">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] md:text-xs whitespace-nowrap shrink-0 ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-xs md:text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'} wrap-break-word`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-[10px] md:text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-1 md:gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                    <span className="hidden md:inline">Mark as read</span>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 md:h-8 px-2 md:px-3"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
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

              <TabsContent value="read" className="space-y-2 md:space-y-3">
                {sortedNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 md:py-12">
                      <div className="text-center">
                        <Bell className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 md:mb-3" />
                        <p className="text-sm md:text-base text-muted-foreground">No read notifications</p>
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
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-4">
                          <div className="mt-0.5 md:mt-1 shrink-0">
                            {notification.isImportant ? (
                              <div className="rounded-full bg-primary/10 p-1.5 md:p-2">
                                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                              </div>
                            ) : (
                              <div className="[&>svg]:h-4 [&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap min-w-0">
                                {notification.isImportant && (
                                  <Badge className="bg-primary text-primary-foreground text-[10px] md:text-xs shrink-0">
                                    <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                    IMPORTANT
                                  </Badge>
                                )}
                                <h4 className={`font-semibold text-sm md:text-base ${notification.isImportant ? 'text-primary' : 'text-foreground'} wrap-break-word`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && !notification.isImportant && (
                                  <Badge className="bg-blue-600 text-white text-[10px] md:text-xs shrink-0">New</Badge>
                                )}
                                {notification.priority && getPriorityBadge(notification.priority)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] md:text-xs whitespace-nowrap shrink-0 ${getTypeBadgeColor(notification.type)}`}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className={`text-xs md:text-sm mb-2 ${notification.isImportant ? 'text-foreground font-medium' : 'text-muted-foreground'} wrap-break-word`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-[10px] md:text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-1 md:gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                    <span className="hidden md:inline">Mark as read</span>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 md:h-8 px-2 md:px-3"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
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
                <TabsContent value="admin" className="space-y-4 md:space-y-6">
                  {/* Important Notice Section */}
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary text-base md:text-lg">
                        <Shield className="h-4 w-4 md:h-5 md:w-5" />
                        Broadcast Important Notice
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Send a high-priority important notice to all team members. This will be highlighted prominently in their notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="important-type" className="text-xs md:text-sm">Notice Type</Label>
                          <Select
                            value={importantNotice.type}
                            onValueChange={(value) =>
                              setImportantNotice({ ...importantNotice, type: value as NotificationType })
                            }
                          >
                            <SelectTrigger id="important-type" className="h-9 md:h-10 text-xs md:text-sm">
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
                          <Label htmlFor="important-priority" className="text-xs md:text-sm">Priority Level</Label>
                          <Select
                            value={importantNotice.priority}
                            onValueChange={(value) =>
                              setImportantNotice({ ...importantNotice, priority: value as 'low' | 'medium' | 'high' | 'urgent' })
                            }
                          >
                            <SelectTrigger id="important-priority" className="h-9 md:h-10 text-xs md:text-sm">
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
                        <Label htmlFor="important-title" className="text-xs md:text-sm">Title *</Label>
                        <Input
                          id="important-title"
                          className="h-9 md:h-10 text-xs md:text-sm"
                          placeholder="e.g., System Maintenance Scheduled"
                          value={importantNotice.title}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="important-message" className="text-xs md:text-sm">Message *</Label>
                        <Textarea
                          id="important-message"
                          className="text-xs md:text-sm"
                          placeholder="Enter detailed message for all team members..."
                          rows={4}
                          value={importantNotice.message}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="important-expires" className="text-xs md:text-sm">Expiration Date (Optional)</Label>
                        <Input
                          id="important-expires"
                          type="datetime-local"
                          className="h-9 md:h-10 text-xs md:text-sm"
                          value={importantNotice.expiresAt}
                          onChange={(e) =>
                            setImportantNotice({ ...importantNotice, expiresAt: e.target.value })
                          }
                        />
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          If set, the notice will be automatically hidden after this date
                        </p>
                      </div>

                      <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-3">
                          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-700 dark:text-amber-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-amber-900 dark:text-amber-200">
                              Important Notice - High Visibility
                            </p>
                            <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300 mt-1">
                              This will be sent to ALL active team members and displayed prominently at the top of their notifications with a special badge.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleBroadcastImportantNotice} className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto">
                          <Megaphone className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                          Broadcast Important Notice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regular Notification Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Bell className="h-4 w-4 md:h-5 md:w-5" />
                        Create Regular Notification
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Send a standard notification to all users. Use this for general announcements or updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="notif-type" className="text-xs md:text-sm">Notification Type</Label>
                        <Select
                          value={newNotification.type}
                          onValueChange={(value) =>
                            setNewNotification({ ...newNotification, type: value as NotificationType })
                          }
                        >
                          <SelectTrigger id="notif-type" className="h-9 md:h-10 text-xs md:text-sm">
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
                        <Label htmlFor="notif-title" className="text-xs md:text-sm">Title</Label>
                        <Input
                          id="notif-title"
                          className="h-9 md:h-10 text-xs md:text-sm"
                          placeholder="Enter notification title"
                          value={newNotification.title}
                          onChange={(e) =>
                            setNewNotification({ ...newNotification, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notif-message" className="text-xs md:text-sm">Message</Label>
                        <Textarea
                          id="notif-message"
                          className="text-xs md:text-sm"
                          placeholder="Enter notification message"
                          rows={4}
                          value={newNotification.message}
                          onChange={(e) =>
                            setNewNotification({ ...newNotification, message: e.target.value })
                          }
                        />
                      </div>

                      <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-3">
                          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-amber-900 dark:text-amber-200">
                              Broadcasting to All Users
                            </p>
                            <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 mt-1">
                              This notification will be sent to all users in the system. Make sure your message is clear and relevant.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleCreateNotification} className="h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto">
                          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
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
