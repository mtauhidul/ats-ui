import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { JobCandidateDetails } from "@/components/job-candidate-details";
import type { Candidate } from "@/types/candidate";
import type { Job, JobStatus, JobType } from "@/types/job";
import candidatesData from "@/lib/mock-data/candidates.json";
import jobsData from "@/lib/mock-data/jobs.json";

export default function JobCandidateDetailPage() {
  const { jobId, candidateId, clientId } = useParams<{ jobId: string; candidateId: string; clientId?: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
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

    // Find the specific candidate and job
    const foundCandidate = transformedCandidates.find(c => c.id === candidateId);
    const foundJob = transformedJobs.find(j => j.id === jobId);
    
    setCandidate(foundCandidate || null);
    setJob(foundJob || null);
  }, [candidateId, jobId]);

  const handleBack = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}`);
    } else {
      navigate(`/dashboard/jobs/${jobId}`);
    }
  };

  const handleStatusChange = (candidateIdParam: string, jobIdParam: string, newStatus: string) => {
    console.log("Update candidate status:", candidateIdParam, jobIdParam, newStatus);
  };

  const handleInterviewClick = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}/jobs/${jobId}/candidates/${candidateId}/interviews`);
    } else {
      navigate(`/dashboard/jobs/${jobId}/candidates/${candidateId}/interviews`);
    }
  };

  const handleEmailClick = () => {
    // TODO: Implement email communication route when ready
    console.log("Email communication clicked");
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
    <JobCandidateDetails
      candidate={candidate}
      job={job}
      onBack={handleBack}
      onStatusChange={handleStatusChange}
      onInterviewClick={handleInterviewClick}
      onEmailClick={handleEmailClick}
    />
  );
}
