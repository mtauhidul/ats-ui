import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Loader2 } from "lucide-react";

interface RejectApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RejectData) => void;
  applicationName: string;
  applicationEmail: string;
}

export interface RejectData {
  reason: string;
  notes?: string;
  sendEmail: boolean;
}

const REJECTION_REASONS = [
  { value: "not_qualified", label: "Not Qualified for Position" },
  { value: "experience_mismatch", label: "Experience Level Mismatch" },
  { value: "skills_gap", label: "Required Skills Not Met" },
  { value: "location_mismatch", label: "Location Requirements Not Met" },
  { value: "salary_expectations", label: "Salary Expectations Mismatch" },
  { value: "no_video", label: "No Video Introduction Provided" },
  { value: "incomplete_application", label: "Incomplete Application" },
  { value: "spam", label: "Spam/Irrelevant Application" },
  { value: "position_filled", label: "Position Already Filled" },
  { value: "other", label: "Other Reason" },
];

export function RejectApplicationModal({
  open,
  onClose,
  onSubmit,
  applicationName,
  applicationEmail,
}: RejectApplicationModalProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        reason,
        notes: notes || undefined,
        sendEmail,
      });
      // Reset form
      setReason("");
      setNotes("");
      setSendEmail(true);
      onClose();
    } catch (error) {
      console.error("Error rejecting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setNotes("");
      setSendEmail(true);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>Reject Application</DialogTitle>
          </div>
          <DialogDescription>
            Reject <strong>{applicationName}</strong>'s application ({applicationEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={isSubmitting}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any internal notes (not sent to candidate)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              These notes are for internal use only
            </p>
          </div>

          {/* Send Email Option */}
          <div className="flex items-start space-x-2 rounded-lg border p-4">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="sendEmail" className="cursor-pointer">
                Send rejection email to candidate
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                A professional rejection email will be sent to {applicationEmail}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
