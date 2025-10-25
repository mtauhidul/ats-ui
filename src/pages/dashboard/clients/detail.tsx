import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClientDetails } from "@/components/client-details";
import type { Client, CommunicationNoteType, ClientStatus } from "@/types/client";
import type { Job, CreateJobRequest, JobStatus, JobType } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import clientsData from "@/lib/mock-data/clients.json";
import jobsData from "@/lib/mock-data/jobs.json";
import candidatesData from "@/lib/mock-data/candidates.json";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    // Transform clients data
    const transformedClients = clientsData.map((client) => ({
      ...client,
      industry: client.industry as Client["industry"],
      companySize: client.companySize as Client["companySize"],
      status: client.status as ClientStatus,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
      communicationNotes: client.communicationNotes?.map((note) => ({
        ...note,
        type: note.type as CommunicationNoteType,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      })),
      activityHistory: client.activityHistory?.map((activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      })),
    }));

    // Transform jobs data
    const transformedJobs = jobsData.map((job) => ({
      ...job,
      status: job.status as JobStatus,
      type: job.type as JobType,
      experienceLevel: job.experienceLevel as Job["experienceLevel"],
      workMode: job.workMode as Job["workMode"],
      priority: job.priority as Job["priority"],
      salaryRange: job.salaryRange ? {
        ...job.salaryRange,
        period: job.salaryRange.period as "yearly" | "hourly" | "daily" | "monthly",
      } : undefined,
      applicationIds: job.applicationIds || [],
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    }));

    // Transform candidates data
    const transformedCandidates = candidatesData.map((candidate) => ({
      ...candidate,
      source: candidate.source as Candidate["source"],
      createdAt: new Date(candidate.createdAt),
      updatedAt: new Date(candidate.updatedAt),
      education: candidate.education.map((edu) => ({
        ...edu,
        level: edu.level as Candidate["education"][0]["level"],
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      })),
      skills: candidate.skills.map((skill) => ({
        ...skill,
        level: skill.level as "beginner" | "intermediate" | "advanced" | "expert",
      })),
      languages: candidate.languages.map((lang) => ({
        ...lang,
        proficiency: lang.proficiency as "basic" | "conversational" | "fluent" | "native",
      })),
      jobApplications: candidate.jobApplications.map((app) => {
        const appWithEmail = app as typeof app & { lastEmailDate?: string };
        return {
          ...app,
          status: app.status as Candidate["jobApplications"][0]["status"],
          appliedAt: new Date(app.appliedAt),
          lastStatusChange: new Date(app.lastStatusChange),
          lastEmailDate: appWithEmail.lastEmailDate ? new Date(appWithEmail.lastEmailDate) : undefined,
        };
      }),
      lastEmailDate: (candidate as typeof candidate & { lastEmailDate?: string }).lastEmailDate 
        ? new Date((candidate as typeof candidate & { lastEmailDate?: string }).lastEmailDate!) 
        : undefined,
      workExperience: [],
      categoryIds: candidate.categoryIds || [],
      tagIds: candidate.tagIds || [],
      isActive: candidate.isActive ?? true,
    }));

    setJobs(transformedJobs);
    setCandidates(transformedCandidates);

    // Find the specific client
    const foundClient = transformedClients.find(c => c.id === clientId);
    setClient(foundClient || null);
  }, [clientId]);

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
