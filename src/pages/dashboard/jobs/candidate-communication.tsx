import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { CandidateEmailCommunication } from "@/components/candidate-email-communication";
import { useCandidates } from "@/store/hooks/useCandidates";
import { useJobs } from "@/store/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function JobCandidateCommunicationPage() {
  const navigate = useNavigate();
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId: string }>();
  const { currentCandidate, fetchCandidateById } = useCandidates();
  const { currentJob, fetchJobById } = useJobs();

  useEffect(() => {
    if (jobId) fetchJobById(jobId);
    if (candidateId) fetchCandidateById(candidateId);
  }, [jobId, candidateId, fetchJobById, fetchCandidateById]);

  if (!currentJob || !currentCandidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {!currentJob ? "Job not found" : "Candidate not found"}
          </h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 py-2 md:gap-3 md:py-3">
          <div className="px-2 lg:px-3">
            <CandidateEmailCommunication
              candidate={currentCandidate}
              job={currentJob}
              onBack={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
