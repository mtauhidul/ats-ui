import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ClientDetails } from "@/components/client-details";
import type { Client } from "@/types/client";
import type { CreateJobRequest } from "@/types/job";
import { useClients, useJobs, useCandidates, useAppSelector } from "@/store/hooks/index";
import { selectClientById, selectJobs, selectCandidates } from "@/store/selectors";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const { fetchClients, fetchClientById } = useClients();
  const { fetchJobs } = useJobs();
  const { fetchCandidates } = useCandidates();
  
  const client = useAppSelector(state => selectClientById(clientId || '')(state));
  const allJobs = useAppSelector(selectJobs);
  const allCandidates = useAppSelector(selectCandidates);
  
  const jobs = allJobs.filter(j => j.clientId === clientId);
  const candidates = allCandidates.filter(c => 
    c.jobApplications.some(app => jobs.some(j => j.id === app.jobId))
  );

  useEffect(() => {
    if (clientId) {
      fetchClientById(clientId);
    }
    fetchClients();
    fetchJobs();
    fetchCandidates();
  }, [clientId, fetchClients, fetchClientById, fetchJobs, fetchCandidates]);

  const handleBack = () => {
    navigate("/dashboard/clients");
  };

  const handleAddJob = (data: CreateJobRequest) => {
    // Implementation for adding job
    console.log("Add job:", data);
  };

  const handleUpdate = (clientId: string, updates: Partial<Client>) => {
    // Implementation for updating client
    console.log("Update client:", clientId, updates);
  };

  const handleDelete = (clientId: string) => {
    // Implementation for deleting client
    console.log("Delete client:", clientId);
    navigate("/dashboard/clients");
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/dashboard/clients/${clientId}/jobs/${jobId}`);
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <ClientDetails
      client={client}
      jobs={jobs}
      candidates={candidates}
      onBack={handleBack}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onAddJob={handleAddJob}
      onJobClick={handleJobClick}
    />
  );
}
