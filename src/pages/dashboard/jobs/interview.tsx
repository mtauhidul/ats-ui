import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { InterviewManagement } from "@/components/interview-management";
import { useJobs, useCandidates, useClients, useAppSelector } from "@/store/hooks/index";
import { selectJobById, selectCandidateById, selectClientById } from "@/store/selectors";

export default function InterviewPage() {
  const { jobId, candidateId, clientId } = useParams<{ jobId: string; candidateId: string; clientId?: string }>();
  const navigate = useNavigate();
  
  const { fetchJobById } = useJobs();
  const { fetchCandidates } = useCandidates();
  const { fetchClients } = useClients();
  
  const candidate = useAppSelector(state => selectCandidateById(candidateId || '')(state));
  const job = useAppSelector(state => selectJobById(jobId || '')(state));
  const client = useAppSelector(state => selectClientById(job?.clientId || '')(state));
  const clientName = client?.companyName || "Client";

  useEffect(() => {
    if (jobId) fetchJobById(jobId);
    fetchCandidates();
    fetchClients();
  }, [jobId, fetchJobById, fetchCandidates, fetchClients]);

  const handleBack = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}`);
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidateId}`);
    }
  };

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
