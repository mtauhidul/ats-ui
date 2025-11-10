import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ClientDetails } from "@/components/client-details";
import { Loader } from "@/components/ui/loader";
import type { Client } from "@/types/client";
import type { CreateJobRequest } from "@/types/job";
import { useClient } from "@/hooks/firestore";
import { useJobs, useCandidates, useClients } from "@/store/hooks/index";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  // Get realtime data from Firestore
  const { client, loading: clientLoading } = useClient(clientId);
  const { jobs: allJobs, createJob } = useJobs();
  const { candidates: allCandidates } = useCandidates();
  
  // Get write operations from Redux hooks
  const { deleteClient, updateClient, addCommunicationNote } = useClients();
  
  // Filter jobs for this client
  const jobs = useMemo(() => 
    allJobs.filter(j => j.clientId === clientId),
    [allJobs, clientId]
  );
  
  // Filter candidates by checking if their jobIds include any of the client's jobs
  const candidates = useMemo(() => 
    allCandidates.filter(c => {
      const jobIdsList = c.jobIds || [];
      return jobIdsList.some((id: string | {toString(): string}) => {
        const idString = typeof id === 'string' ? id : id?.toString();
        return jobs.some(j => j.id === idString);
      });
    }),
    [allCandidates, jobs]
  );
  
  // Calculate real-time statistics from jobs and candidates data
  const clientWithStats = useMemo(() => {
    if (!client) return null;
    
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'open').length;
    const closedJobs = jobs.filter(job => job.status === 'closed').length;
    const draftJobs = jobs.filter(job => job.status === 'draft').length;
    
    const totalCandidates = candidates.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeCandidates = candidates.filter((c: any) => 
      c.status === 'active' || c.status === 'interviewing' || c.status === 'offered'
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rejectedCandidates = candidates.filter((c: any) => 
      c.status === 'rejected'
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hiredCandidates = candidates.filter((c: any) => 
      c.status === 'hired'
    ).length;
    
    const successRate = totalCandidates > 0 
      ? Math.round((hiredCandidates / totalCandidates) * 100) 
      : 0;
    
    return {
      ...client,
      statistics: {
        totalJobs,
        activeJobs,
        closedJobs,
        draftJobs,
        totalCandidates,
        activeCandidates,
        rejectedCandidates,
        hiredCandidates,
        successRate,
      }
    };
  }, [client, jobs, candidates]);

  // No useEffect needed - all data comes from Firestore realtime subscriptions!

  const handleBack = () => {
    navigate("/dashboard/clients");
  };

  const handleAddJob = async (data: CreateJobRequest) => {
    try {
      await createJob(data);
      // Firestore will automatically update the jobs list in realtime
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
      
      console.log('Update successful - Firestore will update in realtime');
      // No need to fetch - Firestore will automatically update the client data
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
      // Firestore will automatically update the client data in realtime
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

  // Show loading state while fetching from Firestore
  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" text="Loading client..." />
      </div>
    );
  }

  // Check if client exists in Firestore
  if (!client || !clientWithStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <ClientDetails
      client={clientWithStats}
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
