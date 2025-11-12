import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Mail,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Server,
  Shield,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";
import { useAutomationStatus } from "@/hooks/useAutomationStatus";
import { EmailConnectionDialog } from "./email-connection-dialog";

export function EmailMonitoringSettings() {
  // 🔥 REALTIME: Get data from Firestore with real-time updates
  const { data: emailAccounts = [], loading: accountsLoading, error: accountsError } = useEmailAccounts();
  const { data: automationStatus, loading: statusLoading, error: statusError, exists: statusExists } = useAutomationStatus();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);

  const loading = accountsLoading || statusLoading;
  
  // Default automation status if document doesn't exist
  const defaultAutomationStatus = {
    enabled: false,
    running: false,
    lastRunAt: null,
    lastRunDuration: 0,
    cronIntervalMinutes: 1,
    stats: {
      totalEmailsProcessed: 0,
      totalCandidatesCreated: 0,
      totalRepliesStored: 0,
      totalErrors: 0,
    },
    updatedAt: new Date(),
  };
  
  const currentAutomationStatus = automationStatus || defaultAutomationStatus;

  // Status indicator component
  const StatusIndicator = ({
    status,
  }: {
    status: "running" | "stopped" | "error";
  }) => {
    const config = {
      running: {
        color: "bg-emerald-500",
        label: "Active",
      },
      stopped: {
        color: "bg-gray-400",
        label: "Stopped",
      },
      error: {
        color: "bg-amber-500",
        label: "Error",
      },
    };

    const currentConfig = config[status];

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`h-2 w-2 rounded-full ${currentConfig.color} ${
              status === "running" ? "animate-pulse" : ""
            }`}
          />
        </div>
        <span className="text-sm font-medium">{currentConfig.label}</span>
      </div>
    );
  };

  // Provider badge component
  const ProviderBadge = ({ provider }: { provider: string }) => {
    const providerConfig: Record<string, { icon: string; color: string }> = {
      gmail: { icon: "📧", color: "bg-blue-50 text-blue-700 border-blue-200" },
      outlook: {
        icon: "📮",
        color: "bg-orange-50 text-orange-700 border-orange-200",
      },
      imap: { icon: "⚙️", color: "bg-gray-50 text-gray-700 border-gray-200" },
      pop3: {
        icon: "📬",
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      other: { icon: "📧", color: "bg-gray-50 text-gray-700 border-gray-200" },
    };

    const config =
      providerConfig[provider.toLowerCase()] || providerConfig.other;

    return (
      <Badge variant="outline" className={`font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {provider.toUpperCase()}
      </Badge>
    );
  };

  // 🔥 REALTIME: No need for fetchData, Firestore hooks handle everything automatically!

  // Start automation
  const startAutomation = async () => {
    setActionLoading("start");
    try {
      const response = await authenticatedFetch("/emails/automation/enable", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Email monitoring started successfully");
        // 🔥 REALTIME: Firestore hook will auto-update, no need to refetch!
      } else {
        throw new Error("Failed to start automation");
      }
    } catch (err) {
      toast.error("Failed to start email monitoring");
    } finally {
      setActionLoading(null);
    }
  };

  // Stop automation
  const stopAutomation = async () => {
    setActionLoading("stop");
    try {
      const response = await authenticatedFetch("/emails/automation/disable", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Email monitoring stopped");
        // 🔥 REALTIME: Firestore hook will auto-update!
        setShowStopDialog(false);
      } else {
        throw new Error("Failed to stop automation");
      }
    } catch (err) {
      toast.error("Failed to stop email monitoring");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle account automation
  const toggleAccountAutomation = async (
    accountId: string,
    enabled: boolean
  ) => {
    setActionLoading(`toggle-${accountId}`);
    try {
      const response = await authenticatedFetch(
        `/email-accounts/${accountId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ autoProcessResumes: enabled }),
        }
      );

      if (response.ok) {
        toast.success(
          `Automation ${enabled ? "enabled" : "disabled"} for account`
        );
        // 🔥 REALTIME: Firestore hook will auto-update!
      } else {
        throw new Error("Failed to update account");
      }
    } catch (err) {
      toast.error("Failed to update account automation");
    } finally {
      setActionLoading(null);
    }
  };

  // Force check all accounts - triggers email automation job manually
  const forceCheckAllAccounts = async () => {
    setActionLoading("check-all");
    try {
      const response = await authenticatedFetch("/emails/automation/trigger", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Email check triggered successfully");
        // 🔥 REALTIME: Firestore hook will show updates automatically!
      } else {
        throw new Error("Failed to trigger email check");
      }
    } catch (err) {
      toast.error("Failed to trigger email check");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete account
  const deleteAccount = async (accountId: string) => {
    setActionLoading(`delete-${accountId}`);
    try {
      const response = await authenticatedFetch(
        `/email-accounts/${accountId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Email account removed successfully");
        // 🔥 REALTIME: Firestore hook will auto-update!
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setActionLoading(null);
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date | string) => {
    const lastCheck = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastCheck.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return lastCheck.toLocaleDateString();
  };

  // 🔥 REALTIME: No need for polling or useEffect! Firestore hooks handle everything automatically

  // Show errors if any
  if (accountsError || statusError) {
    return (
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-semibold">Connection Error</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {accountsError?.message || statusError?.message || "Failed to connect to Firestore"}
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <RefreshCw className="animate-spin h-6 w-6 md:h-8 md:w-8 text-primary" />
          <p className="text-xs md:text-sm text-muted-foreground">
            Loading email monitoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  System Status
                </p>
                <StatusIndicator
                  status={automationStatus?.enabled ? "running" : "stopped"}
                />
                {automationStatus?.enabled && (
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    Monitoring emails automatically
                  </p>
                )}
              </div>
              <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Connected Accounts
                </p>
                <div className="flex items-baseline gap-1.5 md:gap-2">
                  <span className="text-xl md:text-2xl font-bold">
                    {emailAccounts.length}
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {
                      emailAccounts.filter((acc) => acc.autoProcessResumes)
                        .length
                    }{" "}
                    active
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-2 md:p-3 shrink-0">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Info */}
      {automationStatus?.enabled && emailAccounts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="rounded-full bg-blue-100 p-1.5 md:p-2 shrink-0">
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-blue-900 mb-1 text-xs md:text-sm">
                  Email Monitoring Active
                </h4>
                <p className="text-xs md:text-sm text-blue-700">
                  The system is automatically checking your email accounts for
                  new candidate applications. When a new email with a resume is
                  detected, it will be automatically processed and added to your
                  applications list.
                </p>
                <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-blue-600 space-y-0.5 md:space-y-1">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-blue-700">
                      Emails are checked automatically on a scheduled interval
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-blue-700">
                      Last checked times are displayed below for each account
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-blue-700">
                      Use "Check Now" button to trigger immediate email check
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Stats */}
      {automationStatus?.stats && (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Automation Statistics
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Performance metrics for email automation engine
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              {/* Emails Processed */}
              <div className="rounded-lg border bg-card p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Emails Processed
                    </p>
                    <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1 truncate">
                      {currentAutomationStatus.stats.totalEmailsProcessed}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-2 md:p-3 shrink-0">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Candidates Created */}
              <div className="rounded-lg border bg-card p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Applications Created
                    </p>
                    <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1 text-emerald-600 truncate">
                      {currentAutomationStatus.stats.totalCandidatesCreated}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 p-2 md:p-3 shrink-0">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Errors */}
              <div className="rounded-lg border bg-card p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Errors
                    </p>
                    <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1 text-amber-600 truncate">
                      {currentAutomationStatus.stats.totalErrors}
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-500/10 p-2 md:p-3 shrink-0">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Last Run */}
              <div className="rounded-lg border bg-card p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Last Run
                    </p>
                    <p className="text-xs md:text-sm font-bold mt-0.5 md:mt-1 truncate">
                      {currentAutomationStatus.lastRunAt
                        ? new Date(currentAutomationStatus.lastRunAt).toLocaleTimeString()
                        : "Never"}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                      {currentAutomationStatus.lastRunDuration
                        ? `${currentAutomationStatus.lastRunDuration}s duration`
                        : "No data"}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-500/10 p-2 md:p-3 shrink-0">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cron Interval Configuration */}
      {automationStatus && (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Check Interval
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure how often to check for new emails
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-4">
            {/* Current Interval Display */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Current Interval</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                Every {currentAutomationStatus.cronIntervalMinutes} minute{currentAutomationStatus.cronIntervalMinutes > 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Quick Select
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 5, 10, 15, 30].map((minutes) => (
                  <Button
                    key={minutes}
                    size="sm"
                    variant={currentAutomationStatus.cronIntervalMinutes === minutes ? "primary" : "outline"}
                    onClick={async () => {
                      try {
                        const response = await authenticatedFetch("/emails/automation/interval", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ intervalMinutes: minutes }),
                        });
                        if (response.ok) {
                          toast.success(`Check interval updated to ${minutes} minute${minutes > 1 ? 's' : ''}`);
                        } else {
                          throw new Error("Failed to update interval");
                        }
                      } catch (err) {
                        toast.error("Failed to update check interval");
                      }
                    }}
                    disabled={actionLoading !== null}
                    className="text-xs"
                  >
                    {minutes}m
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Interval Input */}
            <div>
              <label htmlFor="cronInterval" className="text-xs font-medium text-muted-foreground mb-2 block">
                Custom Interval (1-60 minutes)
              </label>
              <div className="flex gap-2">
                <input
                  id="cronInterval"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="Enter minutes..."
                  className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={actionLoading !== null}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      const newInterval = parseInt(input.value) || 1;
                      if (newInterval >= 1 && newInterval <= 60) {
                        try {
                          const response = await authenticatedFetch("/emails/automation/interval", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ intervalMinutes: newInterval }),
                          });
                          if (response.ok) {
                            toast.success(`Check interval updated to ${newInterval} minute${newInterval > 1 ? 's' : ''}`);
                            input.value = '';
                          } else {
                            throw new Error("Failed to update interval");
                          }
                        } catch (err) {
                          toast.error("Failed to update check interval");
                        }
                      } else {
                        toast.error("Please enter a value between 1 and 60 minutes");
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    const input = document.getElementById('cronInterval') as HTMLInputElement;
                    const newInterval = parseInt(input.value) || 1;
                    if (newInterval >= 1 && newInterval <= 60) {
                      try {
                        const response = await authenticatedFetch("/emails/automation/interval", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ intervalMinutes: newInterval }),
                        });
                        if (response.ok) {
                          toast.success(`Check interval updated to ${newInterval} minute${newInterval > 1 ? 's' : ''}`);
                          input.value = '';
                        } else {
                          throw new Error("Failed to update interval");
                        }
                      } catch (err) {
                        toast.error("Failed to update check interval");
                      }
                    } else {
                      toast.error("Please enter a value between 1 and 60 minutes");
                    }
                  }}
                  disabled={actionLoading !== null}
                >
                  Apply
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Press Enter or click Apply to set custom interval
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
                <Server className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Monitoring Control
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Start or stop automatic email monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Data updates automatically in real-time!")}
                disabled={loading}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <RefreshCw
                  className={`h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>

              {automationStatus?.enabled ? (
                <AlertDialog
                  open={showStopDialog}
                  onOpenChange={setShowStopDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 md:h-9 text-xs md:text-sm"
                    >
                      <Pause className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      <span className="hidden sm:inline">Stop Monitoring</span>
                      <span className="sm:hidden">Stop</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                        Stop Email Monitoring
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs md:text-sm">
                        This will stop all active email monitoring processes.
                        You can restart monitoring at any time, but ongoing
                        imports may be interrupted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={stopAutomation}
                        disabled={actionLoading === "stop"}
                        className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {actionLoading === "stop" ? (
                          <>
                            <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                            Stopping...
                          </>
                        ) : (
                          "Stop Monitoring"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  size="sm"
                  onClick={startAutomation}
                  disabled={actionLoading === "start"}
                  className="h-8 md:h-9 text-xs md:text-sm"
                >
                  <Play className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                  {actionLoading === "start" ? (
                    "Starting..."
                  ) : (
                    <>
                      <span className="hidden sm:inline">Start Monitoring</span>
                      <span className="sm:hidden">Start</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Email Accounts */}
      <Card>
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Connected Email Accounts
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage email accounts for automated candidate monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => forceCheckAllAccounts()}
                disabled={actionLoading === "check-all"}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <RefreshCw
                  className={`h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 ${
                    actionLoading === "check-all" ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">Check Now</span>
                <span className="sm:hidden">Check</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddAccountDialog(true)}
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                <span className="hidden sm:inline">Add Account</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-6 pt-0">
          {emailAccounts.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-muted rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">
                No Email Accounts Connected
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto px-4">
                Connect your first email account to start automated candidate
                monitoring and resume processing.
              </p>
              <Button
                onClick={() => setShowAddAccountDialog(true)}
                className="h-9 md:h-10 text-sm"
              >
                <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Connect Email Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {emailAccounts.map((account) => (
                <Card key={account.id} className="border-2">
                  <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                      <div className="flex items-start gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="rounded-full bg-primary/10 p-2 md:p-3 shrink-0">
                          <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm md:text-base truncate">
                              {account.email}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                              <ProviderBadge provider={account.provider} />
                              {account.autoProcessResumes && (
                                <Badge className="bg-emerald-500 text-[10px] md:text-xs">
                                  <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                                  Auto-Enabled
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                              <span className="truncate">
                                Last checked:{" "}
                                {account.lastChecked
                                  ? formatTimeAgo(account.lastChecked)
                                  : "Never"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 md:gap-2 shrink-0 self-end sm:self-start">
                        <Switch
                          checked={account.autoProcessResumes}
                          disabled={actionLoading === `toggle-${account.id}`}
                          onCheckedChange={(checked) =>
                            toggleAccountAutomation(account.id, checked)
                          }
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => forceCheckAllAccounts()}
                          disabled={actionLoading === "check-all"}
                          title="Force check all email accounts now"
                          className="h-8 w-8 md:h-9 md:w-9"
                        >
                          <RefreshCw
                            className={`h-3 w-3 md:h-4 md:w-4 ${
                              actionLoading === "check-all"
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 md:h-9 md:w-9"
                            >
                              <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive text-xs md:text-sm"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
                                    <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                                    Remove Email Account
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs md:text-sm">
                                    Are you sure you want to remove{" "}
                                    <strong>{account.email}</strong>? This will
                                    stop all automation for this account and
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                                  <AlertDialogCancel className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteAccount(account.id)}
                                    disabled={
                                      actionLoading === `delete-${account.id}`
                                    }
                                    className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {actionLoading ===
                                    `delete-${account.id}` ? (
                                      <>
                                        <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                                        Removing...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                                        Remove Account
                                      </>
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Connection Dialog */}
      <EmailConnectionDialog
        isOpen={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
        onConnectionSuccess={() => {
          // 🔥 REALTIME: Firestore hook will auto-update!
          toast.success("Account added successfully");
          setShowAddAccountDialog(false);
        }}
      />
    </div>
  );
}
