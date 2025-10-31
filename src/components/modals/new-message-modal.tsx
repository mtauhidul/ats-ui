import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers } from "@/store/slices/usersSlice";
import { sendMessage } from "@/store/slices/messagesSlice";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/lib/auth";
import type { User } from "@/types";
import { toast } from "sonner";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Generate conversationId from two user IDs (sorted to ensure consistency)
function generateConversationId(userId1: string, userId2: string): string {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}_${ids[1]}`;
}

export function NewMessageModal({ open, onOpenChange, onSuccess }: NewMessageModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const userRole = useUserRole();
  const { users, isLoading: usersLoading } = useAppSelector((state) => state.users);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
    }
  }, [open, dispatch]);

  // Filter out current user and filter by search
  const filteredUsers = users
    .filter((u) => u.id !== user?.id)
    .filter((u) => {
      if (!searchQuery) return true;
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const email = u.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim() || !user) {
      return;
    }

    setIsSending(true);

    try {
      const conversationId = generateConversationId(user.id, selectedUser.id);
      const senderName = `${user.firstName} ${user.lastName}`.trim() || user.email;
      const recipientName = `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || selectedUser.email;

      await dispatch(
        sendMessage({
          conversationId,
          senderId: user.id,
          senderName,
          senderRole: userRole,
          senderAvatar: "",
          recipientId: selectedUser.id,
          recipientName,
          recipientRole: selectedUser.role,
          recipientAvatar: "",
          message: messageText,
          read: false,
        })
      ).unwrap();

      // Reset form
      setSelectedUser(null);
      setMessageText("");
      setSearchQuery("");

      // Close modal and notify success
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setMessageText("");
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Start a new conversation with a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Selection */}
          {!selectedUser ? (
            <div className="space-y-3">
              <Label>Select Recipient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setSelectedUser(u)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(`${u.firstName} ${u.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {u.role.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected User */}
              <div>
                <Label>To</Label>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(`${selectedUser.firstName} ${selectedUser.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Message Input */}
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  className="mt-2 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {selectedUser && (
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
