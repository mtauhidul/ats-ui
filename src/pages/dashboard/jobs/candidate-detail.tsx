import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { JobCandidateDetails } from "@/components/job-candidate-details";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useJobs } from "@/store/hooks/useJobs";

export default function JobCandidateDetailPage() {
  const { jobId, candidateId, clientId } = useParams<{ jobId: string; candidateId: string; clientId?: string }>();
  const navigate = useNavigate();
  const { currentCandidate, fetchCandidateById } = useCandidates();
  const { currentJob, fetchJobById } = useJobs();

  useEffect(() => {
    if (candidateId) fetchCandidateById(candidateId);
    if (jobId) fetchJobById(jobId);
  }, [candidateId, jobId, fetchCandidateById, fetchJobById]);

  const handleBack = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}`);
    } else {
      navigate(`/dashboard/jobs/${jobId}`);
    }
  };

  const handleStatusChange = (candidateIdParam: string, jobIdParam: string, newStatus: string) => {
    console.log("Update candidate status:", candidateIdParam, jobIdParam, newStatus);
  };

  const handleInterviewClick = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}/interviews`);
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidateId}/interviews`);
    }
  };

  const handleEmailClick = () => {
    // TODO: Implement email communication route when ready
    console.log("Email communication clicked");
  };

  if (!currentCandidate || !currentJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {!currentCandidate ? "Candidate not found" : "Job not found"}
        </p>
      </div>
    );
  }

  return (
    <JobCandidateDetails
      candidate={currentCandidate}
      job={currentJob}
      onBack={handleBack}
      onStatusChange={handleStatusChange}
      onInterviewClick={handleInterviewClick}
      onEmailClick={handleEmailClick}
    />
  );
}
