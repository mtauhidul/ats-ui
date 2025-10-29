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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Building2, Briefcase } from "lucide-react";

interface Job {
  _id?: string;
  id?: string; // Some APIs use id instead of _id
  title: string;
  clientId: string | {
    _id?: string;
    id?: string;
    companyName: string;
  };
}

interface JobSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (jobId: string, clientId: string) => void;
  jobs: Job[];
  currentJobId?: string;
  applicationName?: string;
}

export function JobSelectionModal({
  open,
  onClose,
  onConfirm,
  jobs,
  currentJobId,
  applicationName = "this application",
}: JobSelectionModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Helper function to get job ID (handles both _id and id)
  const getJobId = (job: Job) => job._id || job.id || "";

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedJobId(currentJobId || "");
      console.log('Modal opened with jobs:', JSON.stringify(jobs, null, 2));
      console.log('Job IDs:', jobs.map(j => ({ _id: j._id, id: j.id, title: j.title })));
      console.log('Current job ID:', currentJobId);
    }
  }, [open, currentJobId, jobs]);

  const selectedJob = jobs.find((job) => getJobId(job) === selectedJobId);
  
  console.log('Selected job ID:', selectedJobId);
  console.log('Found selected job:', selectedJob);
  console.log('Selected job clientId:', selectedJob?.clientId);
  
  const clientId = selectedJob?.clientId 
    ? (typeof selectedJob.clientId === 'string' 
        ? selectedJob.clientId 
        : (selectedJob.clientId._id || selectedJob.clientId.id || ''))
    : '';
  
  console.log('Extracted client ID:', clientId);
  console.log('Button disabled:', !selectedJobId || !clientId);

  const handleConfirm = () => {
    if (selectedJobId && clientId) {
      onConfirm(selectedJobId, clientId);
      setSelectedJobId(""); // Reset after confirm
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedJobId(""); // Reset on close
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Job for Application</DialogTitle>
          <DialogDescription>
            Choose which job {applicationName} is applying for. The client will be
            automatically assigned based on the job selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="job-select">Job Position *</Label>
            <Select 
              value={selectedJobId} 
              onValueChange={(value) => {
                console.log('Value changed to:', value);
                console.log('Job object:', jobs.find(j => getJobId(j) === value));
                setSelectedJobId(value);
              }}
            >
              <SelectTrigger id="job-select" className="w-full">
                {selectedJobId && selectedJob ? (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span className="font-medium truncate">{selectedJob.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {typeof selectedJob.clientId === 'object' 
                        ? selectedJob.clientId.companyName 
                        : 'Unknown Client'}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select a job position</span>
                )}
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[300px]">
                {jobs.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No jobs available
                  </div>
                ) : (
                  jobs.map((job) => {
                    const jobId = getJobId(job);
                    const clientName = typeof job.clientId === 'object' 
                      ? job.clientId.companyName 
                      : 'Unknown Client';
                    console.log('Rendering job:', jobId, job.title);
                    return (
                      <SelectItem key={jobId} value={jobId} className="cursor-pointer">
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="font-medium truncate">{job.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{clientName}</span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedJob && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="font-medium">Client</span>
                </div>
                <p className="text-sm pl-5 break-words">
                  {typeof selectedJob.clientId === 'object' 
                    ? selectedJob.clientId.companyName 
                    : 'Unknown Client'}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-medium">Position</span>
                </div>
                <p className="text-sm pl-5 break-words">
                  {selectedJob.title}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedJobId || !clientId}
          >
            Confirm & Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
