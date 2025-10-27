import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { JobDetails } from "@/components/job-details";
import type { Candidate } from "@/types/candidate";
import type { UpdateJobRequest } from "@/types/job";
import { useJobs, useClients, useCandidates, useAppSelector } from "@/store/hooks/index";
import { selectJobById, selectClients, selectCandidates } from "@/store/selectors";

export default function JobDetailPage() {
  const { jobId, clientId } = useParams<{ jobId: string; clientId?: string }>();
  const navigate = useNavigate();
  
  // Redux hooks
  const { fetchJobs, fetchJobById, updateJob } = useJobs();
  const { fetchClients } = useClients();
  const { fetchCandidates } = useCandidates();
  
  const job = useAppSelector(state => selectJobById(jobId || '')(state));
  const clients = useAppSelector(selectClients);
  const candidates = useAppSelector(selectCandidates);

  useEffect(() => {
    if (jobId) {
      fetchJobById(jobId);
    }
    fetchJobs();
    fetchClients();
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleBack = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}`);
    } else {
      navigate("/dashboard/jobs");
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidate.id}`);
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidate.id}`);
    }
  };

  const handleEditJob = async (jobIdParam: string, data: UpdateJobRequest) => {
    try {
      await updateJob(jobIdParam, data);
      // Refresh the job details after update
      await fetchJobById(jobIdParam);
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  // Get client name
  const client = clients.find(c => c.id === job?.clientId);
  const clientName = client?.companyName || "Unknown Client";

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  return (
    <JobDetails
      job={job}
      clients={clients}
      candidates={candidates}
      clientName={clientName}
      onBack={handleBack}
      onCandidateClick={handleCandidateClick}
      onEditJob={handleEditJob}
    />
  );
}
