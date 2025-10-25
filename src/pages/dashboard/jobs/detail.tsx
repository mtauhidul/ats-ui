import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { JobDetails } from "@/components/job-details";
import type { Job, JobStatus, JobType, UpdateJobRequest } from "@/types/job";
import type { Client, ClientStatus } from "@/types/client";
import type { Candidate } from "@/types/candidate";
import jobsData from "@/lib/mock-data/jobs.json";
import clientsData from "@/lib/mock-data/clients.json";
import candidatesData from "@/lib/mock-data/candidates.json";

export default function JobDetailPage() {
  const { jobId, clientId } = useParams<{ jobId: string; clientId?: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
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

    // Transform clients data
    const transformedClients = clientsData.map((client) => ({
      ...client,
      industry: client.industry as Client["industry"],
      companySize: client.companySize as Client["companySize"],
      status: client.status as ClientStatus,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
      communicationNotes: [],
      activityHistory: [],
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

    setClients(transformedClients);
    setCandidates(transformedCandidates);

    // Find the specific job
    const foundJob = transformedJobs.find(j => j.id === jobId);
    setJob(foundJob || null);
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

  const handleEditJob = (jobIdParam: string, data: UpdateJobRequest) => {
    console.log("Edit job:", jobIdParam, data);
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
