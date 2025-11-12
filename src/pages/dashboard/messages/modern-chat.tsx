import { NewMessageModal } from "@/components/modals/new-message-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  chatService,
  type ChatMessage,
  type Conversation,
} from "@/services/chat.service";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (date: Date | string): string => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function ModernChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to conversations
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatService.subscribeToUserConversations(
      user.id,
      (convs) => {
        setConversations(convs);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Subscribe to selected conversation messages
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeToConversation(
      selectedConversation.id,
      (msgs) => {
        // Replace all messages with fresh data from Firestore
        // This will automatically include newly sent messages
        setMessages(msgs);
        }
    );

    // Mark conversation as read when opened
    if (user?.id) {
      chatService
        .markConversationAsRead(selectedConversation.id, user.id)
        .catch(() => {
          // Silently handle errors
        });
    }

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    const messageText = messageInput.trim();
    setMessageInput(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      await chatService.sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        senderAvatar: user.avatar || "",
        recipientId: selectedConversation.participantId,
        recipientName: selectedConversation.participantName,
        recipientAvatar: selectedConversation.participantAvatar || "",
        message: messageText,
      });

      } catch {
      toast.error("Failed to send message");
      setMessageInput(messageText); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowMobileSidebar(false);
  };

  const handleBackToList = () => {
    setShowMobileSidebar(true);
    setSelectedConversation(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar - Conversations List */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col bg-card",
          showMobileSidebar ? "flex" : "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewMessageModal(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewMessageModal(true)}
                className="mt-2"
              >
                Start a new conversation
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left",
                    selectedConversation?.id === conv.id && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(conv.participantName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {conv.participantName}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <Badge
                      variant="primary"
                      className="ml-2 h-5 min-w-5 flex items-center justify-center px-1.5"
                    >
                      {conv.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background",
          !showMobileSidebar ? "flex" : "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b px-4 flex items-center gap-3 bg-card">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden -ml-2"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(selectedConversation.participantName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {selectedConversation.participantName}
                </p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2",
                          isOwn ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {!isOwn && (
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {getInitials(msg.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "flex flex-col max-w-[70%]",
                            isOwn ? "items-end" : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 wrap-break-word",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>

                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 px-2",
                              isOwn ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.sentAt)}
                            </span>
                            {isOwn && (
                              <span className="text-muted-foreground">
                                {msg.read ? (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4 bg-card">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">
                Choose from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        open={showNewMessageModal}
        onOpenChange={setShowNewMessageModal}
        onSuccess={() => {
          setShowNewMessageModal(false);
          // The new conversation will appear automatically via real-time subscription
        }}
      />
    </div>
  );
}
