import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Loader2, AlertTriangle, Info, Target } from "lucide-react";

interface ApproveApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApproveData) => void;
  applicationName: string;
  targetJobId?: string; // The job ID the candidate applied for
  targetJobTitle?: string; // For display purposes
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
  targetJobId,
  targetJobTitle,
  jobs,
}: ApproveApplicationModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Pre-select the target job when modal opens
  useEffect(() => {
    if (open && targetJobId && !selectedJobId) {
      setSelectedJobId(targetJobId);
    }
  }, [open, targetJobId, selectedJobId]);

  // Check if user selected a different job than the target
  useEffect(() => {
    if (targetJobId && selectedJobId && selectedJobId !== targetJobId) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [selectedJobId, targetJobId]);

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
          {/* Info Alert showing which job they applied for */}
          {targetJobId && targetJobTitle && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Applied for:</strong> {targetJobTitle}
                <p className="text-xs mt-1 text-blue-600 dark:text-blue-300">
                  This job is pre-selected and highlighted below
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning if different job selected */}
          {showWarning && targetJobTitle && (
            <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <strong>⚠️ Warning:</strong> This candidate applied for <strong>"{targetJobTitle}"</strong> but you're selecting a different job. 
                <p className="text-xs mt-1">Please confirm this is intentional before proceeding.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Job Selection */}
          <div className="space-y-2">
            <Label htmlFor="job">
              Assign to Job <span className="text-destructive">*</span>
              {targetJobId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline-block ml-2 h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The job marked with ✓ is the one this candidate applied for</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={isSubmitting}
            >
              <SelectTrigger id="job" className={targetJobId && selectedJobId === targetJobId ? "border-blue-500 ring-1 ring-blue-500" : ""}>
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {/* Show the applied job first with special styling */}
                {targetJobId && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
                      ✓ APPLIED FOR THIS JOB
                    </div>
                    {jobs
                      .filter((job) => job.id === targetJobId)
                      .map((job) => (
                        <SelectItem 
                          key={job.id} 
                          value={job.id} 
                          className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500 font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-blue-900 dark:text-blue-100">{job.title}</span>
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {job.clientName}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}

                {/* Show other jobs */}
                {jobs.filter((job) => !targetJobId || job.id !== targetJobId).length > 0 && (
                  <>
                    {targetJobId && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 bg-muted/50">
                        OTHER JOBS (Not Applied)
                      </div>
                    )}
                    {jobs
                      .filter((job) => !targetJobId || job.id !== targetJobId)
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
              {targetJobId 
                ? "The candidate will be added to the selected job's pipeline"
                : "Select which job position this candidate applied for"
              }
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
