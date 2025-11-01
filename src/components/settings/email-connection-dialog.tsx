import { Bot, Loader2, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

// Email provider types
export type EmailProvider = "gmail" | "outlook" | "other";

// Email provider configuration
export interface EmailConfig {
  provider: EmailProvider;
  server?: string;
  port?: string;
  username: string;
  password: string;
}

interface EmailConnectionDialogProps {
  onConnectionSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function EmailConnectionDialog({
  onConnectionSuccess,
  isOpen = false,
  onOpenChange,
}: EmailConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<EmailProvider>("gmail");
  const [connectionProgress, setConnectionProgress] = useState(0);

  // IMAP server credentials
  const [imapServer, setImapServer] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapUsername, setImapUsername] = useState("");
  const [imapPassword, setImapPassword] = useState("");

  // Reset form function
  const resetForm = () => {
    setProvider("gmail");
    setImapServer("");
    setImapPort("993");
    setImapUsername("");
    setImapPassword("");
    setConnectionProgress(0);
  };

  // Connect to email provider
  const connectToProvider = async () => {
    setIsConnecting(true);
    setConnectionProgress(10);

    try {
      // Validate required fields
      if (!imapUsername || !imapPassword) {
        throw new Error("Please provide email and password");
      }

      if (provider === "other" && !imapServer) {
        throw new Error("Please provide IMAP server details");
      }

      setConnectionProgress(30);

      // Prepare the request body according to backend schema
      const requestBody = {
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Account`,
        email: imapUsername,
        provider: provider === "other" ? "custom" : provider,
        imapHost:
          imapServer ||
          (provider === "gmail"
            ? "imap.gmail.com"
            : provider === "outlook"
            ? "outlook.office365.com"
            : ""),
        imapPort: parseInt(imapPort) || 993,
        imapUser: imapUsername,
        imapPassword: imapPassword,
        imapTls: true,
        isActive: true,
      };

      // Add the account
      const addAccountResponse = await authenticatedFetch("/email-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      setConnectionProgress(80);

      if (!addAccountResponse.ok) {
        const errorData = await addAccountResponse.json();
        console.error("API Error:", errorData);

        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = (
            errorData.errors as Array<{ message?: string }>
          )
            .map((err) => err.message ?? "Unknown error")
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(
          errorData.message || errorData.error || "Failed to add email account"
        );
      }

      setConnectionProgress(100);

      toast.success("Email account connected successfully!");

      // Reset form and close dialog
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Notify parent component
      if (onConnectionSuccess) {
        onConnectionSuccess();
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect to email"
      );
    } finally {
      setIsConnecting(false);
      setConnectionProgress(0);
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!isConnecting && !open) {
      resetForm();
    }
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 md:space-y-2">
          <DialogTitle className="flex items-center gap-1.5 md:gap-2 text-base md:text-lg">
            <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Connect Email Account
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Connect your email to automatically monitor for candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Provider Selection */}
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-xs md:text-sm font-medium">
              Email Provider
            </Label>
            <RadioGroup
              value={provider}
              onValueChange={(value: string) =>
                setProvider(value as EmailProvider)
              }
              className="grid grid-cols-1 gap-1.5"
            >
              <div className="flex items-center space-x-2 p-2 md:p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="gmail" id="provider-gmail" />
                <Label
                  htmlFor="provider-gmail"
                  className="flex items-center gap-2 cursor-pointer text-xs md:text-sm flex-1"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Gmail</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] md:text-xs">
                    Popular
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 md:p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="outlook" id="provider-outlook" />
                <Label
                  htmlFor="provider-outlook"
                  className="flex items-center gap-2 cursor-pointer text-xs md:text-sm flex-1"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Outlook</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 md:p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="other" id="provider-other" />
                <Label
                  htmlFor="provider-other"
                  className="flex items-center gap-2 cursor-pointer text-xs md:text-sm flex-1"
                >
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span>Other (IMAP)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Connection Form */}
          <Card className="border-dashed">
            <CardContent className="p-2.5 md:p-3 space-y-2.5 md:space-y-3">
              {provider === "other" && (
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <Label htmlFor="imap-server" className="text-xs md:text-sm">
                      IMAP Server
                    </Label>
                    <Input
                      id="imap-server"
                      placeholder="imap.example.com"
                      value={imapServer}
                      onChange={(e) => setImapServer(e.target.value)}
                      className="mt-1 h-9 md:h-10 text-xs md:text-sm"
                      disabled={isConnecting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imap-port" className="text-xs md:text-sm">
                      Port
                    </Label>
                    <Input
                      id="imap-port"
                      placeholder="993"
                      value={imapPort}
                      onChange={(e) => setImapPort(e.target.value)}
                      className="mt-1 h-9 md:h-10 text-xs md:text-sm"
                      disabled={isConnecting}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email-username" className="text-xs md:text-sm">
                  Email Address
                </Label>
                <Input
                  id="email-username"
                  type="email"
                  placeholder="user@example.com"
                  value={imapUsername}
                  onChange={(e) => setImapUsername(e.target.value)}
                  className="mt-1 h-9 md:h-10 text-xs md:text-sm"
                  disabled={isConnecting}
                />
              </div>

              <div>
                <Label htmlFor="email-password" className="text-xs md:text-sm">
                  {provider !== "other"
                    ? "Password / App Password"
                    : "Password"}
                </Label>
                <Input
                  id="email-password"
                  type="password"
                  placeholder="Password"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                  className="mt-1 h-9 md:h-10 text-xs md:text-sm"
                  disabled={isConnecting}
                />
                {provider === "gmail" && (
                  <div className="flex items-start gap-1.5 md:gap-2 text-xs mt-2 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">Use App Password</p>
                      <p className="text-[10px] md:text-xs mt-0.5 text-amber-800 dark:text-amber-300">
                        Required for Gmail.{" "}
                        <a
                          href="https://support.google.com/accounts/answer/185833"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-amber-950 dark:hover:text-amber-100"
                        >
                          Learn how
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Progress */}
              {connectionProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] md:text-xs">
                    <span className="text-muted-foreground">
                      {connectionProgress < 30
                        ? "Preparing connection..."
                        : connectionProgress < 80
                        ? "Validating credentials..."
                        : "Setting up automation..."}
                    </span>
                    <span className="font-medium">{connectionProgress}%</span>
                  </div>
                  <Progress
                    value={connectionProgress}
                    className="h-1.5 md:h-2"
                  />
                </div>
              )}

              {/* Info about automation */}
              <div className="bg-muted/50 border rounded-lg p-2 md:p-2.5">
                <div className="flex items-start gap-1.5 md:gap-2">
                  <Bot className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="text-[10px] md:text-xs min-w-0">
                    <p className="font-medium">Auto-Monitoring Enabled</p>
                    <p className="text-muted-foreground mt-0.5">
                      Your email will be monitored for candidate emails.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isConnecting}
              className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={connectToProvider}
              disabled={isConnecting || !imapUsername || !imapPassword}
              className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { EmailConnectionDialog };
export default EmailConnectionDialog;
