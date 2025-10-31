import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import {
  extractEmailVariables,
  replaceTemplateVariables,
} from "@/lib/email-template-helper";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import {
  Archive,
  ArrowLeft,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Forward,
  Image,
  Inbox,
  Mail,
  MoreVertical,
  Paperclip,
  Reply,
  Send,
  SendHorizontal,
  Star,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface CandidateEmailCommunicationProps {
  candidate: Candidate;
  job: Job;
  onBack: () => void;
}

interface EmailThread {
  id: string;
  _id?: string;
  subject: string;
  from: string;
  to: string[];
  timestamp: Date;
  sentAt?: Date;
  receivedAt?: Date;
  createdAt?: Date;
  body: string;
  bodyHtml?: string;
  isRead?: boolean;
  isStarred?: boolean;
  direction: "outbound" | "inbound";
  status: string;
  sentBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  candidateId?: string;
  jobId?: string;
  attachments?: {
    filename: string;
    url: string;
    contentType: string;
    size: number;
  }[];
}

// Mock email templates (should come from settings in real app)
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "tmpl-1",
    name: "Interview Invitation",
    subject: "Interview Invitation - {{jobTitle}}",
    body: "Dear {{firstName}} {{lastName}},\n\nWe are pleased to inform you that after reviewing your application for the {{jobTitle}} position at {{companyName}}, we would like to invite you for an interview.\n\nPlease confirm your attendance by replying to this email.\n\nWe look forward to meeting you!\n\nBest regards,\n{{recruiterName}}\n{{companyName}}",
  },
  {
    id: "tmpl-2",
    name: "Application Received",
    subject: "Application Received - {{jobTitle}}",
    body: "Dear {{firstName}},\n\nThank you for your interest in the {{jobTitle}} position at {{companyName}}.\n\nWe have successfully received your application and our team is currently reviewing all submissions.\n\nWe appreciate your interest in joining our team!\n\nBest regards,\n{{recruiterName}}\n{{companyName}}",
  },
  {
    id: "tmpl-3",
    name: "Follow-up Email",
    subject: "Following up on {{jobTitle}} Application",
    body: "Hi {{firstName}},\n\nI wanted to follow up on your application for the {{jobTitle}} position.\n\nWe're impressed with your background and would love to learn more about you.\n\nAre you available for a brief call this week?\n\nBest regards,\n{{recruiterName}}",
  },
];

export function CandidateEmailCommunication({
  candidate,
  job,
  onBack,
}: CandidateEmailCommunicationProps) {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailThread | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Compose email state
  const [composeData, setComposeData] = useState({
    to: candidate.email,
    subject: "",
    content: "",
  });

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const initials =
    `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();

  // Fetch emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/emails?candidateId=${candidate.id}&jobId=${job.id}&sortBy=createdAt&sortOrder=desc&limit=100`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }

        const data = await response.json();
        const emailsData = data.emails || [];

        // Transform emails to match our interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedEmails = emailsData.map((email: any) => ({
          ...email,
          id: email._id || email.id,
          timestamp: new Date(
            email.sentAt || email.receivedAt || email.createdAt
          ),
        }));

        setEmails(transformedEmails);
      } catch (error) {
        console.error("Error fetching emails:", error);
        toast.error("Failed to load emails");
      }
    };

    fetchEmails();
  }, [candidate.id, job.id]);

  const sentEmails = emails.filter((e) => e.direction === "outbound");
  const receivedEmails = emails.filter((e) => e.direction === "inbound");
  const allEmails = [...emails].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleSendEmail = () => {
    if (!composeData.subject || !composeData.content) {
      toast.error("Please fill in subject and content");
      return;
    }

    // Extract variables from candidate and job data
    const variables = extractEmailVariables(candidate, job);

    // Replace template variables with actual values
    const processedSubject = replaceTemplateVariables(
      composeData.subject,
      variables
    );
    const processedContent = replaceTemplateVariables(
      composeData.content,
      variables
    );

    const newEmail: EmailThread = {
      id: `email-${Date.now()}`,
      subject: processedSubject,
      from: "HR Team",
      to: [composeData.to],
      timestamp: new Date(),
      body: processedContent,
      isRead: true,
      isStarred: false,
      direction: "outbound",
      status: "sent",
    };

    setEmails([newEmail, ...emails]);
    setComposeData({
      to: candidate.email,
      subject: "",
      content: "",
    });
    setIsComposing(false);
    toast.success("Email sent successfully");
  };

  const handleReply = (email: EmailThread) => {
    setComposeData({
      to: email.direction === "outbound" ? email.to[0] : email.from,
      subject: `Re: ${email.subject}`,
      content: `\n\n---\nOn ${email.timestamp.toLocaleString()}, ${
        email.from
      } wrote:\n${email.body}`,
    });
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const filteredEmails = allEmails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDisplayEmails = () => {
    switch (activeTab) {
      case "sent":
        return sentEmails;
      case "received":
        return receivedEmails;
      default:
        return filteredEmails;
    }
  };

  const displayEmails = getDisplayEmails();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={candidate.avatar} alt={fullName} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                Email Communication
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {fullName} • {candidate.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Regarding: {job.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => {
              setIsComposing(true);
              setSelectedEmail(null);
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            New Email
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Email List */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Emails</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {displayEmails.length} total
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6 pt-4 pb-3">
                  <TabsList className="h-11 p-1 bg-card border border-border w-fit">
                    <TabsTrigger
                      value="inbox"
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
                    >
                      <Inbox className="h-4 w-4 mr-2" />
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="sent"
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
                    >
                      <SendHorizontal className="h-4 w-4 mr-2" />
                      Sent
                    </TabsTrigger>
                    <TabsTrigger
                      value="received"
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:text-white! data-[state=inactive]:text-muted-foreground"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Received
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="max-h-[600px] overflow-y-auto border-t">
                  {displayEmails.length > 0 ? (
                    displayEmails.map((email, index) => (
                      <div key={email.id}>
                        <div
                          className={cn(
                            "px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedEmail?.id === email.id && "bg-muted",
                            !email.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                          )}
                          onClick={() => {
                            setSelectedEmail(email);
                            setIsComposing(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-1">
                              {email.direction === "outbound" ? (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <SendHorizontal className="h-4 w-4 text-primary" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p
                                  className={cn(
                                    "text-sm truncate",
                                    !email.isRead
                                      ? "font-semibold"
                                      : "font-medium"
                                  )}
                                >
                                  {email.direction === "outbound"
                                    ? email.to[0]
                                    : email.from}
                                </p>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatTimestamp(email.timestamp)}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  "text-sm mb-1 truncate",
                                  !email.isRead
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {email.subject}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {email.body}
                              </p>
                            </div>
                            {email.isStarred && (
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                            )}
                          </div>
                        </div>
                        {index < displayEmails.length - 1 && <Separator />}
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No emails found" : "No emails yet"}
                      </p>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Email Content / Compose */}
        <div className="lg:col-span-7">
          {isComposing ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Compose Email</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsComposing(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSendEmail}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label htmlFor="template">Use Template (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      if (value === "none") return;
                      const template = emailTemplates.find(
                        (t) => t.id === value
                      );
                      if (template) {
                        // Extract variables and apply template
                        const variables = extractEmailVariables(candidate, job);
                        const processedSubject = replaceTemplateVariables(
                          template.subject,
                          variables
                        );
                        const processedBody = replaceTemplateVariables(
                          template.body,
                          variables
                        );

                        setComposeData({
                          ...composeData,
                          subject: processedSubject,
                          content: processedBody,
                        });
                        toast.success(`Template "${template.name}" applied`);
                      }
                    }}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>No template</span>
                        </div>
                      </SelectItem>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To */}
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={composeData.to}
                    onChange={(e) =>
                      setComposeData({ ...composeData, to: e.target.value })
                    }
                    placeholder="recipient@email.com"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Email subject..."
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <textarea
                    id="content"
                    value={composeData.content}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write your message..."
                    className="w-full min-h-[300px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>

                {/* Compose Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button variant="outline" size="sm">
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                  <Button variant="outline" size="sm">
                    <Type className="h-4 w-4 mr-2" />
                    Format
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedEmail ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {selectedEmail.direction === "outbound" ? "You" : initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {selectedEmail.direction === "outbound"
                            ? "You"
                            : selectedEmail.from}
                        </span>
                      </div>
                      <span>→</span>
                      <span>
                        {selectedEmail.direction === "outbound"
                          ? selectedEmail.to[0]
                          : "You"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleReply(selectedEmail)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{selectedEmail.timestamp.toLocaleString()}</span>
                  {selectedEmail.direction === "outbound" && (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">
                        Sent
                      </span>
                    </>
                  )}
                </div>

                <Separator />

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedEmail.body}
                  </p>
                </div>

                {selectedEmail.attachments &&
                  selectedEmail.attachments.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Attachments
                        </Label>
                        <div className="grid gap-2">
                          {selectedEmail.attachments.map(
                            (attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                              >
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {attachment.filename}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.size}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={() => handleReply(selectedEmail)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No email selected
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Select an email to view or compose a new one
                </p>
                <Button onClick={() => setIsComposing(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Compose Email
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
