import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Search, Send, MoreVertical, Plus, Paperclip, Smile } from "lucide-react";
import messagesData from "@/lib/mock-data/messages.json";
import teamData from "@/lib/mock-data/team.json";
import { hasPermission, getRestrictedMessage } from "@/lib/rbac";
import { toast } from "sonner";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  recipientAvatar: string;
  message: string;
  read: boolean;
  sentAt: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function MessagesPage() {
  const currentUser = teamData[0];
  const canSendMessages = hasPermission(currentUser, 'canSendEmails');
  const currentUserId = currentUser.id;

  const [messages] = useState<Message[]>(messagesData.map(m => ({ ...m })));
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by conversation
  const conversations: Conversation[] = [];
  const conversationMap = new Map<string, Message[]>();

  messages.forEach(msg => {
    if (!conversationMap.has(msg.conversationId)) {
      conversationMap.set(msg.conversationId, []);
    }
    conversationMap.get(msg.conversationId)!.push(msg);
  });

  conversationMap.forEach((msgs, convId) => {
    const sortedMsgs = msgs.sort((a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );

    const lastMsg = sortedMsgs[sortedMsgs.length - 1];
    const participant = lastMsg.senderId === currentUserId
      ? { id: lastMsg.recipientId, name: lastMsg.recipientName, avatar: lastMsg.recipientAvatar, role: lastMsg.recipientRole }
      : { id: lastMsg.senderId, name: lastMsg.senderName, avatar: lastMsg.senderAvatar, role: lastMsg.senderRole };

    const unreadCount = sortedMsgs.filter(m =>
      !m.read && m.recipientId === currentUserId
    ).length;

    conversations.push({
      id: convId,
      participantId: participant.id,
      participantName: participant.name,
      participantAvatar: participant.avatar,
      participantRole: participant.role,
      lastMessage: lastMsg.message,
      lastMessageTime: lastMsg.sentAt,
      unreadCount,
      messages: sortedMsgs
    });
  });

  // Sort by most recent (newest at top)
  conversations.sort((a, b) =>
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  };

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!canSendMessages) {
      toast.error(getRestrictedMessage("send messages"));
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    toast.success("Message sent");
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
                      {getRestrictedMessage("messages")}
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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Messages</h2>
                  <p className="text-muted-foreground">
                    Communicate with your team members
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Conversations Sidebar */}
              <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-4 border-b bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Conversations</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
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
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No conversations</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(conversation.participantName)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-sm truncate">
                                {conversation.participantName}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 truncate">
                              {conversation.participantRole}
                            </p>
                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
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
              <Card className="flex flex-col overflow-hidden">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="pb-3 border-b shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(selectedConversation.participantName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {selectedConversation.participantName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {selectedConversation.participantRole}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-muted/20 flex flex-col">
                      <div className="flex-1"></div>
                      <div className="space-y-4">
                        {selectedConversation.messages.map((msg) => {
                          const isCurrentUser = msg.senderId === currentUserId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex items-start gap-2 max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8 mt-1">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(msg.senderName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                                    isCurrentUser
                                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                      : 'bg-card border rounded-tl-sm'
                                  }`}>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground px-2">
                                    {formatTime(msg.sentAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-background shrink-0">
                      <div className="flex items-end gap-2">
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pr-10 rounded-full"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          size="icon"
                          className="shrink-0"
                          disabled={!messageText.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-1">Select a conversation</p>
                      <p className="text-sm">Choose from your existing conversations or start a new one</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
