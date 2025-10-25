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
import { CheckCircle2, Loader2 } from "lucide-react";

interface ApproveApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApproveData) => void;
  applicationName: string;
  targetJobTitle?: string;
  jobs: Array<{ id: string; title: string; clientName: string }>;
}

export interface ApproveData {
  jobId: string;
  notes?: string;
}

export function ApproveApplicationModal({
  open,
  onClose,
  onSubmit,
  applicationName,
  targetJobTitle,
  jobs,
}: ApproveApplicationModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedJobId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        jobId: selectedJobId,
        notes: notes || undefined,
      });
      // Reset form
      setSelectedJobId("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error approving application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedJobId("");
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>Approve Application</DialogTitle>
          </div>
          <DialogDescription>
            Convert <strong>{applicationName}</strong>'s application to candidate and assign to a job
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Selection */}
          <div className="space-y-2">
            <Label htmlFor="job">
              Assign to Job <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={isSubmitting}
            >
              <SelectTrigger id="job">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {targetJobTitle && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Original Target
                  </div>
                )}
                {jobs
                  .filter((job) => targetJobTitle && job.title === targetJobTitle)
                  .map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{job.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {job.clientName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                {jobs.filter((job) => !targetJobTitle || job.title !== targetJobTitle)
                  .length > 0 && (
                  <>
                    {targetJobTitle && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                        Other Jobs
                      </div>
                    )}
                    {jobs
                      .filter((job) => !targetJobTitle || job.title !== targetJobTitle)
                      .map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{job.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {job.clientName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The candidate will be added to the selected job's pipeline
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Approval Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
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
            disabled={!selectedJobId || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve & Create Candidate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
