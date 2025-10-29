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

  const { fetchClients, fetchClientById, deleteClient, updateClient } = useClients();
  const { fetchJobs, createJob } = useJobs();
  const { fetchCandidates } = useCandidates();
  
  const client = useAppSelector(state => selectClientById(clientId || '')(state));
  const allJobs = useAppSelector(selectJobs);
  const allCandidates = useAppSelector(selectCandidates);
  
  const jobs = allJobs.filter(j => j.clientId === clientId);
  
  // Filter candidates by checking if their jobIds include any of the client's jobs
  const candidates = allCandidates.filter(c => {
    const jobIdsList = c.jobIds || [];
    return jobIdsList.some((id: string | {toString(): string}) => {
      const idString = typeof id === 'string' ? id : id?.toString();
      return jobs.some(j => j.id === idString);
    });
  });

  useEffect(() => {
    if (clientId) {
      fetchClientById(clientId);
    }
    fetchClients();
    fetchJobs();
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleBack = () => {
    navigate("/dashboard/clients");
  };

  const handleAddJob = async (data: CreateJobRequest) => {
    try {
      await createJob(data);
      // Refresh jobs after creating
      fetchJobs();
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const handleUpdate = async (clientId: string, updates: Partial<Client>) => {
    try {
      await updateClient(clientId, updates);
      // Refresh client data after updating
      await fetchClientById(clientId);
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      navigate("/dashboard/clients");
    } catch (error) {
      // Error is already handled in the Redux thunk with toast notification
      console.error("Failed to delete client:", error);
    }
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
