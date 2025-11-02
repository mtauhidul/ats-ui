import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ClientDetails } from "@/components/client-details";
import { Loader } from "@/components/ui/loader";
import type { Client } from "@/types/client";
import type { CreateJobRequest } from "@/types/job";
import { useClients, useJobs, useCandidates, useAppSelector } from "@/store/hooks/index";
import { selectClientById, selectJobs, selectCandidates } from "@/store/selectors";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const { fetchClients, fetchClientById, deleteClient, updateClient, addCommunicationNote } = useClients();
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
    // Early return if no clientId to prevent undefined API calls
    if (!clientId) {
      return;
    }
    
    fetchClientById(clientId);
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
      console.log('=== HANDLE UPDATE ===');
      console.log('Client ID:', clientId);
      console.log('Updates to send:', updates);
      console.log('Contacts in updates:', updates.contacts);
      console.log('ActivityHistory in updates:', updates.activityHistory);
      console.log('====================');
      
      await updateClient(clientId, updates);
      
      console.log('Update successful, fetching updated client...');
      
      // Refresh client data after updating
      await fetchClientById(clientId);
      
      console.log('Client refreshed');
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

  const handleAddCommunicationNote = async (clientId: string, note: { type: string; subject: string; content: string }) => {
    try {
      await addCommunicationNote(clientId, note);
      // Refresh client data after adding note
      await fetchClientById(clientId);
    } catch (error) {
      console.error("Failed to add communication note:", error);
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/dashboard/clients/${clientId}/jobs/${jobId}`);
  };

  // Check if clientId is valid
  if (!clientId || clientId === 'undefined') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Invalid client ID</p>
      </div>
    );
  }

  // Check if client data is loaded
  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" text="Loading client..." />
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
      onAddCommunicationNote={handleAddCommunicationNote}
    />
  );
}
