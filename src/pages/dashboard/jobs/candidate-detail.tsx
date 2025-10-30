import { JobCandidateDetails } from "@/components/job-candidate-details";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useJobs } from "@/store/hooks/useJobs";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function JobCandidateDetailPage() {
  const { jobId, candidateId, clientId } = useParams<{
    jobId: string;
    candidateId: string;
    clientId?: string;
  }>();
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

  const handleInterviewClick = () => {
    if (clientId) {
      navigate(
        `/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}/interviews`
      );
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidateId}/interviews`);
    }
  };

  const handleEmailClick = () => {
    if (clientId) {
      navigate(
        `/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}/communication`
      );
    } else {
      navigate(
        `/dashboard/jobs/${jobId}/candidates/${candidateId}/communication`
      );
    }
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
      onInterviewClick={handleInterviewClick}
      onEmailClick={handleEmailClick}
    />
  );
}
