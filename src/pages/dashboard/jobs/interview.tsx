import { useParams, useNavigate } from "react-router-dom";
import { InterviewManagement } from "@/components/interview-management";
import { useCandidate, useJob, useClient } from "@/hooks/firestore";
import { Loader2 } from "lucide-react";

export default function InterviewPage() {
  const { jobId, candidateId, clientId } = useParams<{ jobId: string; candidateId: string; clientId?: string }>();
  const navigate = useNavigate();
  
  // Get realtime data from Firestore hooks
  const { candidate, loading: candidateLoading } = useCandidate(candidateId);
  const { job, loading: jobLoading } = useJob(jobId);
  
  // Get client ID from job
  const resolvedClientId = typeof job?.clientId === 'string' 
    ? job.clientId 
    : job?.clientId?.id || job?.clientId?._id || clientId;
  
  const { client } = useClient(resolvedClientId);
  const clientName = client?.companyName || "Client";

  const handleBack = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}`);
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidateId}`);
    }
  };

  // Show loading state
  if (candidateLoading || jobLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (!candidate || !job) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {!candidate ? "Candidate not found" : "Job not found"}
        </p>
      </div>
    );
  }

  return (
    <InterviewManagement
      candidate={candidate}
      job={job}
      clientName={clientName}
      onBack={handleBack}
    />
  );
}
