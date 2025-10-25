import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Mail,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  XCircle,
  Zap,
  Server,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { EmailConnectionDialog } from "./email-connection-dialog";

interface EmailAccount {
  id: string;
  provider: string;
  username: string;
  server?: string;
  port?: number;
  automationEnabled: boolean;
  isActive: boolean;
  lastChecked?: string;
  totalProcessed: number;
  totalImported: number;
  lastError?: string;
  createdAt: string;
}

interface AutomationStatus {
  isRunning: boolean;
  checkInterval: number;
  activeProcesses: Array<{
    accountId: string;
    status: string;
    totalEmails?: number;
    processedEmails?: number;
  }>;
  stats: {
    totalAccounts: number;
    activeAccounts: number;
    totalProcessed: number;
    totalImported: number;
    recentImports: number;
    recentErrors: number;
  };
}

export function EmailMonitoringSettings() {
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);

  // Polling interval refs
  const automationIntervalRef = useRef<number | null>(null);
  const importsIntervalRef = useRef<number | null>(null);

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

  // Fetch automation status and accounts
  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const apiKey = import.meta.env.VITE_API_KEY || "";

      const [statusResponse, accountsResponse] = await Promise.all([
        fetch(`${apiUrl}/email/automation/status`, {
          headers: { "X-API-KEY": apiKey },
        }),
        fetch(`${apiUrl}/email/automation/accounts`, {
          headers: { "X-API-KEY": apiKey },
        }),
      ]);

      if (statusResponse.ok && accountsResponse.ok) {
        const statusData = await statusResponse.json();
        const accountsData = await accountsResponse.json();

        setAutomationStatus(statusData.data);
        setEmailAccounts(accountsData.data);
      } else {
        if (statusResponse.status === 429 || accountsResponse.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else {
          console.error("Failed to load automation data");
        }
      }
    } catch (err) {
      console.error("Error fetching automation data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start automation
  const startAutomation = async () => {
    setActionLoading("start");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/email/automation/start`,
        {
          method: "POST",
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY || "" },
        }
      );

      if (response.ok) {
        toast.success("Email monitoring started successfully");
        fetchData();
      } else {
        throw new Error("Failed to start automation");
      }
    } catch (err) {
      console.error("Error starting automation:", err);
      toast.error("Failed to start email monitoring");
    } finally {
      setActionLoading(null);
    }
  };

  // Stop automation
  const stopAutomation = async () => {
    setActionLoading("stop");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/email/automation/stop`,
        {
          method: "POST",
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY || "" },
        }
      );

      if (response.ok) {
        toast.success("Email monitoring stopped");
        fetchData();
        setShowStopDialog(false);
      } else {
        throw new Error("Failed to stop automation");
      }
    } catch (err) {
      console.error("Error stopping automation:", err);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/email/automation/accounts/${accountId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": import.meta.env.VITE_API_KEY || "",
          },
          body: JSON.stringify({ automationEnabled: enabled }),
        }
      );

      if (response.ok) {
        toast.success(
          `Automation ${enabled ? "enabled" : "disabled"} for account`
        );
        await fetchData();
      } else {
        throw new Error("Failed to update account");
      }
    } catch (err) {
      console.error("Error updating account:", err);
      toast.error("Failed to update account automation");
    } finally {
      setActionLoading(null);
    }
  };

  // Force check account
  const forceCheckAccount = async (accountId: string) => {
    setActionLoading(`check-${accountId}`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/email/automation/accounts/${accountId}/check`,
        {
          method: "POST",
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY || "" },
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Check completed: ${result.data.imported || 0} candidates imported`
        );
        await fetchData();
      } else {
        throw new Error("Failed to check account");
      }
    } catch (err) {
      console.error("Error checking account:", err);
      toast.error("Failed to check account");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete account
  const deleteAccount = async (accountId: string) => {
    setActionLoading(`delete-${accountId}`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/email/automation/accounts/${accountId}`,
        {
          method: "DELETE",
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY || "" },
        }
      );

      if (response.ok) {
        toast.success("Email account removed successfully");
        await fetchData();
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to delete account");
    } finally {
      setActionLoading(null);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const lastCheck = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastCheck.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return lastCheck.toLocaleDateString();
  };

  // Setup intervals and initial data loading
  useEffect(() => {
    fetchData();

    // Poll automation status every 30 seconds
    const automationInterval = window.setInterval(fetchData, 30000);
    automationIntervalRef.current = automationInterval;

    // Store the current value for cleanup
    const importsInterval = importsIntervalRef.current;

    return () => {
      if (automationInterval) {
        clearInterval(automationInterval);
      }
      if (importsInterval) {
        clearInterval(importsInterval);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading email monitoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  System Status
                </p>
                <StatusIndicator
                  status={automationStatus?.isRunning ? "running" : "stopped"}
                />
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Accounts
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {automationStatus?.stats.activeAccounts || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {automationStatus?.stats.totalAccounts || 0}
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Processed
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {automationStatus?.stats.totalProcessed || 0}
                  </span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Monitoring Control
              </CardTitle>
              <CardDescription>
                Start or stop automatic email monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={actionLoading === "refresh"}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    actionLoading === "refresh" ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>

              {automationStatus?.isRunning ? (
                <AlertDialog
                  open={showStopDialog}
                  onOpenChange={setShowStopDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Monitoring
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Stop Email Monitoring
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop all active email monitoring processes.
                        You can restart monitoring at any time, but ongoing
                        imports may be interrupted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={stopAutomation}
                        disabled={actionLoading === "stop"}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {actionLoading === "stop" ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
                >
                  <Play className="h-4 w-4 mr-2" />
                  {actionLoading === "start" ? "Starting..." : "Start Monitoring"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Email Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Connected Email Accounts
              </CardTitle>
              <CardDescription>
                Manage email accounts for automated candidate monitoring
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddAccountDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {emailAccounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No Email Accounts Connected
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your first email account to start automated candidate
                monitoring and resume processing.
              </p>
              <Button onClick={() => setShowAddAccountDialog(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Connect Email Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {emailAccounts.map((account) => (
                <Card key={account.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h4 className="font-semibold text-base truncate">
                              {account.username}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <ProviderBadge provider={account.provider} />
                              {account.automationEnabled && (
                                <Badge className="bg-emerald-500">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto-Enabled
                                </Badge>
                              )}
                              {account.lastError && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Last checked:{" "}
                                {account.lastChecked
                                  ? formatTimeAgo(account.lastChecked)
                                  : "Never"}
                              </span>
                            </div>

                            {account.lastError && (
                              <div className="flex items-start gap-2 text-destructive">
                                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{account.lastError}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>
                                  <strong>{account.totalProcessed}</strong> processed
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-blue-500" />
                                <span>
                                  <strong>{account.totalImported}</strong> imported
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Switch
                          checked={account.automationEnabled}
                          disabled={actionLoading === `toggle-${account.id}`}
                          onCheckedChange={(checked) =>
                            toggleAccountAutomation(account.id, checked)
                          }
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => forceCheckAccount(account.id)}
                          disabled={actionLoading === `check-${account.id}`}
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              actionLoading === `check-${account.id}`
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                    Remove Email Account
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove{" "}
                                    <strong>{account.username}</strong>? This will
                                    stop all automation for this account and cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteAccount(account.id)}
                                    disabled={
                                      actionLoading === `delete-${account.id}`
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {actionLoading === `delete-${account.id}` ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Removing...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Active Processes */}
      {automationStatus?.activeProcesses &&
        automationStatus.activeProcesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Active Processes
              </CardTitle>
              <CardDescription>
                Real-time monitoring of email processing tasks
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {automationStatus.activeProcesses.map((process, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-amber-200 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                        <span className="font-medium truncate">
                          {emailAccounts.find(
                            (acc) => acc.id === process.accountId
                          )?.username || `Account ${process.accountId}`}
                        </span>
                        <Badge variant="outline" className="bg-white">
                          {process.status}
                        </Badge>
                      </div>

                      {process.totalEmails &&
                        process.processedEmails !== undefined && (
                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <span className="text-sm font-mono text-muted-foreground">
                              {process.processedEmails} / {process.totalEmails}
                            </span>
                            <Progress
                              value={
                                (process.processedEmails / process.totalEmails) *
                                100
                              }
                              className="w-24"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Email Connection Dialog */}
      <EmailConnectionDialog
        isOpen={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
        onConnectionSuccess={() => {
          fetchData();
          setShowAddAccountDialog(false);
        }}
      />
    </div>
  );
}
