import { useNavigate, useParams } from "react-router-dom";
import { CandidateEmailCommunication } from "@/components/candidate-email-communication";
import candidatesData from "@/lib/mock-data/candidates.json";
import jobsData from "@/lib/mock-data/jobs.json";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function JobCandidateCommunicationPage() {
  const navigate = useNavigate();
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId: string }>();

  // Find the job and candidate
  const job = jobsData.find((j) => j.id === jobId) as Job | undefined;
  const candidate = candidatesData.find((c) => c.id === candidateId) as Candidate | undefined;

  if (!job || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {!job ? "Job not found" : "Candidate not found"}
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
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <CandidateEmailCommunication
              candidate={candidate}
              job={job}
              onBack={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
