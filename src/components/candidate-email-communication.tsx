import { useState } from "react";
import { ArrowLeft, Send, Reply, Forward, Trash2, Archive, Star, MoreVertical, Paperclip, Image, Type, Clock, CheckCheck, Mail, Inbox, SendHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CandidateEmailCommunicationProps {
  candidate: Candidate;
  job: Job;
  onBack: () => void;
}

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  toEmail: string;
  timestamp: Date;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  type: "sent" | "received";
  attachments?: { name: string; size: string; type: string }[];
}

// Mock email threads
const mockEmails: EmailThread[] = [
  {
    id: "email-1",
    subject: "Re: Interview Confirmation",
    from: "John Doe",
    fromEmail: "john.doe@email.com",
    to: "HR Team",
    toEmail: "hr@company.com",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    content: "Thank you for the interview invitation. I confirm my attendance for the interview scheduled on Friday at 2:00 PM. I look forward to meeting with you and discussing the opportunity further.",
    isRead: true,
    isStarred: false,
    type: "received",
  },
  {
    id: "email-2",
    subject: "Interview Invitation - Senior Developer Position",
    from: "HR Team",
    fromEmail: "hr@company.com",
    to: "John Doe",
    toEmail: "john.doe@email.com",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    content: "Dear John, We are pleased to invite you for an interview for the Senior Developer position. The interview will be held on Friday, October 27, 2025, at 2:00 PM at our office. Please confirm your attendance.",
    isRead: true,
    isStarred: true,
    type: "sent",
  },
  {
    id: "email-3",
    subject: "Additional Questions About the Role",
    from: "John Doe",
    fromEmail: "john.doe@email.com",
    to: "HR Team",
    toEmail: "hr@company.com",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    content: "Hi, I have a few questions about the role and the tech stack you're using. Could we schedule a brief call to discuss? I'm particularly interested in understanding the team structure and project methodologies.",
    isRead: true,
    isStarred: false,
    type: "received",
  },
];

export function CandidateEmailCommunication({ candidate, job, onBack }: CandidateEmailCommunicationProps) {
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailThread | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [emails, setEmails] = useState<EmailThread[]>(mockEmails);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Compose email state
  const [composeData, setComposeData] = useState({
    to: candidate.email,
    subject: "",
    content: "",
  });

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();

  const sentEmails = emails.filter(e => e.type === "sent");
  const receivedEmails = emails.filter(e => e.type === "received");
  const allEmails = [...emails].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleSendEmail = () => {
    if (!composeData.subject || !composeData.content) {
      toast.error("Please fill in subject and content");
      return;
    }

    const newEmail: EmailThread = {
      id: `email-${Date.now()}`,
      subject: composeData.subject,
      from: "HR Team",
      fromEmail: "hr@company.com",
      to: fullName,
      toEmail: composeData.to,
      timestamp: new Date(),
      content: composeData.content,
      isRead: true,
      isStarred: false,
      type: "sent",
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
      to: email.type === "sent" ? email.toEmail : email.fromEmail,
      subject: `Re: ${email.subject}`,
      content: `\n\n---\nOn ${email.timestamp.toLocaleString()}, ${email.from} wrote:\n${email.content}`,
    });
    setIsComposing(true);
    setSelectedEmail(null);
  };

  const filteredEmails = allEmails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={candidate.avatar} alt={fullName} />
              <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">Email Communication</h1>
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => { setIsComposing(true); setSelectedEmail(null); }}>
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
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                    >
                      <Inbox className="h-4 w-4 mr-2" />
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sent" 
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
                    >
                      <SendHorizontal className="h-4 w-4 mr-2" />
                      Sent
                    </TabsTrigger>
                    <TabsTrigger 
                      value="received" 
                      className="px-4 data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=inactive]:text-muted-foreground"
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
                            <div className="flex-shrink-0 mt-1">
                              {email.type === "sent" ? (
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
                                <p className={cn(
                                  "text-sm truncate",
                                  !email.isRead ? "font-semibold" : "font-medium"
                                )}>
                                  {email.type === "sent" ? email.to : email.from}
                                </p>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatTimestamp(email.timestamp)}
                                </span>
                              </div>
                              <p className={cn(
                                "text-sm mb-1 truncate",
                                !email.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                              )}>
                                {email.subject}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {email.content}
                              </p>
                            </div>
                            {email.isStarred && (
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500 flex-shrink-0" />
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
                    <Button variant="outline" size="sm" onClick={() => setIsComposing(false)}>
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
                {/* To Field */}
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    placeholder="recipient@email.com"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Email subject..."
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <textarea
                    id="content"
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
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
                    <h3 className="text-lg font-semibold mb-2">{selectedEmail.subject}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {selectedEmail.type === "sent" ? "You" : initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {selectedEmail.type === "sent" ? "You" : selectedEmail.from}
                        </span>
                      </div>
                      <span>→</span>
                      <span>{selectedEmail.type === "sent" ? selectedEmail.to : "You"}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleReply(selectedEmail)}>
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
                  {selectedEmail.type === "sent" && (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Sent</span>
                    </>
                  )}
                </div>

                <Separator />

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedEmail.content}
                  </p>
                </div>

                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Attachments</Label>
                      <div className="grid gap-2">
                        {selectedEmail.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
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
                <p className="text-lg font-medium text-muted-foreground mb-2">No email selected</p>
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
