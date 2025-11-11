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
import { Switch } from "@/components/ui/switch";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ImapSettings {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  secure: boolean;
  lastChecked?: string;
  lastSync?: string;
}

export function SmtpSettings() {
  const [settings, setSettings] = useState<ImapSettings>({
    enabled: false,
    host: "",
    port: 993,
    username: "",
    secure: true,
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/settings/smtp");

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching IMAP settings:", error);
      toast.error("Failed to load IMAP settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setTestResult(null);

      // Validate required fields when enabling
      if (settings.enabled) {
        if (
          !settings.host ||
          !settings.port ||
          !settings.username ||
          !password
        ) {
          toast.error("Please fill in all required fields");
          return;
        }
      }

      const response = await authenticatedFetch("/settings/smtp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: settings.enabled,
          host: settings.host,
          port: settings.port,
          username: settings.username,
          password: password || undefined,
          secure: settings.secure,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("IMAP settings saved successfully");
        if (data.data) {
          setSettings(data.data);
        }
        setPassword(""); // Clear password field after save
      } else {
        toast.error(data.message || "Failed to save IMAP settings");
      }
    } catch (error) {
      console.error("Error saving IMAP settings:", error);
      toast.error("Failed to save IMAP settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      if (!settings.host || !settings.port || !settings.username || !password) {
        toast.error("Please fill in all required fields");
        return;
      }

      const response = await authenticatedFetch("/settings/smtp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: settings.host,
          port: settings.port,
          username: settings.username,
          password: password,
          secure: settings.secure,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: data.message });
        toast.success("Connection test successful!");
      } else {
        setTestResult({ success: false, message: data.message || data.error });
        toast.error("Connection test failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult({ success: false, message: errorMessage });
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);

      const response = await authenticatedFetch("/settings/smtp/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Email sync completed! Processed: ${
            data.data?.emailsProcessed || 0
          }, Saved: ${data.data?.emailsSaved || 0}`
        );
        fetchSettings(); // Refresh to get updated lastSync
      } else {
        toast.error(data.message || "Failed to sync emails");
      }
    } catch (error) {
      console.error("Error syncing emails:", error);
      toast.error("Failed to sync emails");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                IMAP / Inbound Email Settings
              </CardTitle>
              <CardDescription>
                Configure IMAP settings to receive inbound emails from
                candidates (e.g., replies to your outbound emails)
              </CardDescription>
            </div>
            <Badge
              variant={settings.enabled ? "primary" : "secondary"}
              className="ml-2"
            >
              {settings.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable IMAP</Label>
              <p className="text-sm text-muted-foreground">
                Allow the system to fetch inbound emails via IMAP
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {/* IMAP Configuration */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Host */}
              <div className="space-y-2">
                <Label htmlFor="host">
                  IMAP Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="host"
                  placeholder="imap.provider.com"
                  value={settings.host}
                  onChange={(e) =>
                    setSettings({ ...settings, host: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your IMAP server hostname
                </p>
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port">
                  Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="993"
                  value={settings.port}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      port: parseInt(e.target.value) || 993,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Usually 993 for IMAP SSL
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username / Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="mail@example.com"
                  value={settings.username}
                  onChange={(e) =>
                    setSettings({ ...settings, username: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your email account username
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      settings.host && !password ? "••••••••" : "Enter password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep existing password
                </p>
              </div>
            </div>

            {/* Secure Connection Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">
                    Use Secure Connection (TLS/SSL)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recommended for secure email access
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.secure}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, secure: checked })
                }
              />
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                testResult.success
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-red-500/50 bg-red-500/10"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {testResult.success
                    ? "Connection Successful"
                    : "Connection Failed"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleTestConnection}
              disabled={testing}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save Settings"
              )}
            </Button>

            {settings.enabled && settings.host && (
              <Button
                onClick={handleSyncNow}
                disabled={syncing}
                variant="secondary"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Last Sync Info */}
          {settings.lastSync && (
            <div className="text-sm text-muted-foreground">
              Last synced: {new Date(settings.lastSync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            How it Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Configure your email provider's IMAP settings to allow this
            application to fetch inbound emails
          </p>
          <p>
            • When enabled, the system will periodically check for new emails
            sent to your configured email address (e.g., mail@example.com)
          </p>
          <p>
            • Inbound emails will appear in your application's inbox alongside
            sent emails
          </p>
          <p>
            • Emails are automatically linked to candidates when possible based
            on email address
          </p>
          <p className="font-medium text-foreground mt-4">
            📧 Recommended IMAP Settings by Provider:
          </p>
          <p>• <strong>Gmail:</strong> imap.gmail.com, Port 993, TLS/SSL Enabled</p>
          <p>• <strong>Outlook:</strong> outlook.office365.com, Port 993, TLS/SSL Enabled</p>
          <p>• <strong>Yahoo:</strong> imap.mail.yahoo.com, Port 993, TLS/SSL Enabled</p>
          <p>• <strong>Custom:</strong> Check your email provider's documentation</p>
        </CardContent>
      </Card>
    </div>
  );
}
