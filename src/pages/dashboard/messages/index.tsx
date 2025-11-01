import MessageInputAi from "@/components/message-input-ai";
import { NewMessageModal } from "@/components/modals/new-message-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { useMessages } from "@/store/hooks/useMessages";
import type { Message } from "@/store/slices/messagesSlice";
import {
  addOptimisticMessage,
  removeOptimisticMessage,
  sendMessage,
  updateMessageStatus,
} from "@/store/slices/messagesSlice";
import {
  Check,
  CheckCheck,
  Clock,
  Menu,
  MessageSquare,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Add custom keyframes for smooth animations
const messageAnimationStyles = `
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes messageFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .message-bubble-animate {
    animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  .message-group-animate {
    animation: messageFadeIn 0.3s ease-out forwards;
  }
`;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const userRole = useUserRole();
  const {
    conversations,
    setCurrentConversation,
    currentConversation,
    fetchMessages,
  } = useMessages();

  // Inject animation styles
  useEffect(() => {
    const styleId = "message-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = messageAnimationStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Admin and recruiters can always send messages
  const canSendMessages =
    userRole === "admin" ||
    userRole === "recruiter" ||
    userRole === "hiring_manager";
  const currentUserId = user?.id || "";

  // Get user display name
  const senderName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "User";
  const senderAvatar = "";

  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  };

  useEffect(() => {
    if (currentConversation) {
      scrollToBottom();
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Group messages by sender and time proximity
  const groupMessages = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((msg, index) => {
      if (index === 0) {
        currentGroup = [msg];
      } else {
        const prevMsg = messages[index - 1];
        const timeDiff =
          new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime();
        const sameUser = msg.senderId === prevMsg.senderId;

        // Group if same sender and within 5 minutes
        if (sameUser && timeDiff < 5 * 60 * 1000) {
          currentGroup.push(msg);
        } else {
          groups.push(currentGroup);
          currentGroup = [msg];
        }
      }

      if (index === messages.length - 1) {
        groups.push(currentGroup);
      }
    });

    return groups;
  };

  const handleSendMessage = async (message?: string) => {
    if (!canSendMessages) {
      toast.error(
        "You don't have permission to send messages. Please contact your administrator."
      );
      return;
    }

    // Use the provided message or the messageText state
    const textToSend = (message || messageText).trim();

    if (!textToSend || !currentConversation || textToSend.length > 1000) {
      return;
    }

    // Clear message immediately for instant feel
    setMessageText("");

    // Create temp ID for tracking
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversationId: currentConversation.id,
      senderId: currentUserId,
      senderName: senderName,
      senderRole: userRole,
      senderAvatar: senderAvatar,
      recipientId: currentConversation.participantId,
      recipientName: currentConversation.participantName,
      recipientRole: currentConversation.participantRole,
      recipientAvatar: currentConversation.participantAvatar,
      message: textToSend,
      read: false,
      sentAt: new Date().toISOString(),
      status: "sending",
    };

    // Add message immediately to UI (optimistic update)
    dispatch(addOptimisticMessage(optimisticMessage));

    // Send message to backend
    try {
      // Dispatch the sendMessage thunk and unwrap the result
      const resultAction = await dispatch(
        sendMessage({
          conversationId: currentConversation.id,
          senderId: currentUserId,
          senderName: senderName,
          senderRole: userRole,
          senderAvatar: senderAvatar,
          recipientId: currentConversation.participantId,
          recipientName: currentConversation.participantName,
          recipientRole: currentConversation.participantRole,
          recipientAvatar: currentConversation.participantAvatar,
          message: textToSend,
          read: false,
        })
      );

      // Check if the action was fulfilled using Redux Toolkit's matcher
      if (sendMessage.fulfilled.match(resultAction)) {
        const messageData = resultAction.payload;
        console.log("✅ Message sent successfully:", messageData);

        // Update status to 'sent' with real ID
        dispatch(
          updateMessageStatus({
            tempId,
            status: "sent",
            realId: messageData.id || messageData._id || tempId,
          })
        );

        toast.success("Message sent");
      } else {
        throw new Error("Message sending failed");
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      // Mark as failed
      dispatch(
        updateMessageStatus({
          tempId,
          status: "failed",
        })
      );
      toast.error("Failed to send message");
    }
  };

  const handleRetryMessage = async (msg: Message) => {
    if (!msg.tempId) return;

    // Remove failed message
    dispatch(removeOptimisticMessage(msg.tempId));

    // Re-send with new temp ID
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const retryMessage: Message = {
      ...msg,
      id: tempId,
      tempId,
      sentAt: new Date().toISOString(),
      status: "sending",
    };

    dispatch(addOptimisticMessage(retryMessage));

    try {
      const resultAction = await dispatch(
        sendMessage({
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          senderAvatar: msg.senderAvatar,
          recipientId: msg.recipientId,
          recipientName: msg.recipientName,
          recipientRole: msg.recipientRole,
          recipientAvatar: msg.recipientAvatar,
          message: msg.message,
          read: false,
        })
      );

      if (sendMessage.fulfilled.match(resultAction)) {
        const messageData = resultAction.payload;
        console.log("✅ Message retry successful:", messageData);

        dispatch(
          updateMessageStatus({
            tempId,
            status: "sent",
            realId: messageData.id || messageData._id || tempId,
          })
        );

        toast.success("Message sent");
      } else {
        throw new Error("Message retry failed");
      }
    } catch (error) {
      console.error("❌ Failed to retry message:", error);
      dispatch(
        updateMessageStatus({
          tempId,
          status: "failed",
        })
      );
      toast.error("Failed to send message");
    }
  };

  if (!canSendMessages) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You don't have permission to access messages. Please
                      contact your administrator.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 md:gap-4 py-2 md:py-4 lg:py-6">
          <div className="px-2 md:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-4 md:mb-6 hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">
                    Messages
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Communicate with your team members
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 h-[85vh] md:h-[calc(100vh-240px)] min-h-[500px] relative">
              {/* Mobile Toggle Button - Only show when conversation is selected */}
              {currentConversation && (
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden absolute top-2 left-2 z-10 bg-card shadow-lg"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Conversations
                  {conversations.filter((c) => c.unreadCount > 0).length >
                    0 && (
                    <span className="ml-2 h-5 min-w-5 px-1.5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversations.filter((c) => c.unreadCount > 0).length}
                    </span>
                  )}
                </Button>
              )}

              {/* Conversations Sidebar */}
              <div
                className={`flex flex-col border rounded-lg bg-card overflow-hidden w-full lg:w-[380px] transition-all duration-300 ${
                  isSidebarOpen
                    ? "h-full absolute inset-0 z-20 lg:relative"
                    : currentConversation
                    ? "hidden lg:flex lg:h-full"
                    : "h-full lg:h-full"
                }`}
              >
                {/* Sidebar Header */}
                <div className="p-3 md:p-4 border-b bg-card space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-semibold">
                      Conversations
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsNewMessageModalOpen(true)}
                        className="h-8 px-2 md:px-3"
                      >
                        <Plus className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">New</span>
                      </Button>
                      {/* Close button on mobile */}
                      {isSidebarOpen && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="lg:hidden h-8 w-8 p-0"
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium mb-1">No conversations yet</p>
                      <p className="text-xs">
                        Start a new conversation to begin messaging
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation, index) => (
                      <div
                        key={conversation.id}
                        className={`p-3 md:p-4 border-b cursor-pointer transition-all hover:bg-muted/70 animate-in fade-in slide-in-from-left-4 duration-300 ${
                          currentConversation?.id === conversation.id
                            ? "bg-muted border-l-4 border-l-primary"
                            : "border-l-4 border-l-transparent"
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => {
                          setCurrentConversation(conversation);
                          setIsSidebarOpen(false); // Close sidebar on mobile when conversation is selected
                        }}
                      >
                        <div className="flex gap-2 md:gap-3">
                          <div className="relative shrink-0">
                            <Avatar className="h-9 w-9 md:h-11 md:w-11 ring-2 ring-background">
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs md:text-sm">
                                {getInitials(conversation.participantName)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:min-w-5 px-1 md:px-1.5 bg-primary text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                {conversation.unreadCount > 9
                                  ? "9+"
                                  : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span
                                className={`font-semibold text-xs md:text-sm truncate ${
                                  conversation.unreadCount > 0
                                    ? "text-foreground"
                                    : "text-foreground/90"
                                }`}
                              >
                                {conversation.participantName}
                              </span>
                              <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5 capitalize">
                              {conversation.participantRole.replace(/_/g, " ")}
                            </p>
                            <p
                              className={`text-xs md:text-sm truncate leading-tight ${
                                conversation.unreadCount > 0
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <Card className="flex flex-col overflow-hidden flex-1">
                {currentConversation ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="p-2 md:p-3 md:py-1.5 border-b shrink-0 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-1 ring-background">
                            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary font-semibold text-[10px] md:text-xs">
                              {getInitials(currentConversation.participantName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xs md:text-sm font-semibold">
                              {currentConversation.participantName}
                            </CardTitle>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground capitalize leading-tight">
                              {currentConversation.participantRole.replace(
                                /_/g,
                                " "
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <div
                      className="flex-1 overflow-y-auto py-2 md:py-3 space-y-1"
                      style={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                    >
                      {currentConversation.messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                              No messages yet
                            </p>
                            <p className="text-xs">
                              Send a message to start the conversation
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {groupMessages(currentConversation.messages).map(
                            (group, groupIndex) => {
                              const isCurrentUser =
                                group[0].senderId === currentUserId;
                              return (
                                <div
                                  key={groupIndex}
                                  className={`flex ${
                                    isCurrentUser
                                      ? "justify-end"
                                      : "justify-start"
                                  } mb-3 px-2 message-group-animate`}
                                  style={{
                                    animationDelay: `${groupIndex * 30}ms`,
                                    opacity: 0,
                                    animationFillMode: "forwards",
                                  }}
                                >
                                  <div
                                    className={`flex gap-1 max-w-[95%] md:max-w-[85%] ${
                                      isCurrentUser
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                    }`}
                                  >
                                    {/* Avatar - only show for first message in group */}
                                    <Avatar className="h-6 w-6 md:h-7 md:w-7 shrink-0">
                                      <AvatarFallback className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-semibold">
                                        {getInitials(group[0].senderName)}
                                      </AvatarFallback>
                                    </Avatar>

                                    {/* Messages group */}
                                    <div
                                      className={`flex flex-col gap-2 md:gap-3 ${
                                        isCurrentUser
                                          ? "items-end"
                                          : "items-start"
                                      }`}
                                    >
                                      {/* Sender name - only for received messages */}
                                      {!isCurrentUser && (
                                        <span className="text-[10px] md:text-xs font-medium text-muted-foreground px-2 md:px-3">
                                          {group[0].senderName}
                                        </span>
                                      )}

                                      {/* Message bubbles */}
                                      {group.map((msg, msgIndex) => (
                                        <TooltipProvider key={msg.id}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div
                                                className={`group relative ${
                                                  isCurrentUser
                                                    ? "text-right"
                                                    : "text-left"
                                                } message-bubble-animate`}
                                                style={{
                                                  animationDelay: `${
                                                    groupIndex * 30 +
                                                    msgIndex * 80
                                                  }ms`,
                                                  opacity: 0,
                                                  animationFillMode: "forwards",
                                                }}
                                              >
                                                <div
                                                  className={`inline-block rounded-2xl px-2.5 py-1.5 md:px-3 md:py-2 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                                                    isCurrentUser
                                                      ? "bg-primary rounded-tr-md"
                                                      : "bg-card border rounded-tl-md"
                                                  } ${
                                                    msgIndex === 0
                                                      ? ""
                                                      : isCurrentUser
                                                      ? "rounded-tr-2xl"
                                                      : "rounded-tl-2xl"
                                                  }`}
                                                >
                                                  <p
                                                    className={`text-xs md:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                                                      isCurrentUser
                                                        ? "text-white"
                                                        : ""
                                                    }`}
                                                  >
                                                    {msg.message}
                                                  </p>
                                                </div>

                                                {/* Status and time - outside bubble */}
                                                <div
                                                  className={`flex items-center gap-1 md:gap-1.5 mt-0.5 md:mt-1 px-1.5 md:px-2 ${
                                                    isCurrentUser
                                                      ? "justify-end"
                                                      : "justify-start"
                                                  }`}
                                                >
                                                  <span className="text-[10px] md:text-xs text-muted-foreground">
                                                    {formatTime(msg.sentAt)}
                                                  </span>
                                                  {isCurrentUser && (
                                                    <>
                                                      {msg.status ===
                                                        "sending" && (
                                                        <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                                                      )}
                                                      {msg.status === "sent" &&
                                                        !msg.read && (
                                                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                      {msg.read && (
                                                        <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                                      )}
                                                      {msg.status ===
                                                        "failed" && (
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-5 w-5 p-0 hover:bg-transparent"
                                                          onClick={() =>
                                                            handleRetryMessage(
                                                              msg
                                                            )
                                                          }
                                                          title="Retry sending"
                                                        >
                                                          <RotateCcw className="h-3.5 w-3.5 text-destructive" />
                                                        </Button>
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              side={
                                                isCurrentUser ? "left" : "right"
                                              }
                                              sideOffset={8}
                                            >
                                              <p className="text-xs font-medium">
                                                {formatFullTimestamp(
                                                  msg.sentAt
                                                )}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="px-1.5 py-1.5 md:px-2 md:py-2 border-t shrink-0">
                      <MessageInputAi
                        onSendMessage={(message) => {
                          handleSendMessage(message);
                        }}
                        disabled={!canSendMessages}
                        placeholder="Type your message..."
                        maxLength={1000}
                        autoFocus={true}
                      />
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-semibold mb-2">
                        Select a conversation
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Choose from your existing conversations or start a new
                        one
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setIsNewMessageModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Conversation
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        open={isNewMessageModalOpen}
        onOpenChange={setIsNewMessageModalOpen}
        onSuccess={() => {
          fetchMessages();
        }}
      />
    </div>
  );
}
