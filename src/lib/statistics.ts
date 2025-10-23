import type { ClientStatistics } from "@/types/client";
import type { Job } from "@/types/job";
import type { Candidate } from "@/types/candidate";
import type { Application } from "@/types/application";

// Calculate client statistics from related data
export function calculateClientStatistics(
  clientId: string,
  jobs: Job[],
  candidates: Candidate[]
): ClientStatistics {
  const clientJobs = jobs.filter(j => j.clientId === clientId);
  const clientJobIds = clientJobs.map(j => j.id);
  
  const clientCandidates = candidates.filter(c => 
    c.jobIds.some(jobId => clientJobIds.includes(jobId))
  );
  
  const totalJobs = clientJobs.length;
  const activeJobs = clientJobs.filter(j => j.status === "open").length;
  const closedJobs = clientJobs.filter(j => j.status === "closed").length;
  const draftJobs = clientJobs.filter(j => j.status === "draft").length;
  
  const totalCandidates = clientCandidates.length;
  const activeCandidates = clientCandidates.filter(c => 
    c.jobApplications.some(app => 
      clientJobIds.includes(app.jobId) && 
      !["hired", "rejected", "withdrawn"].includes(app.status)
    )
  ).length;
  
  const hiredCandidates = clientCandidates.filter(c =>
    c.jobApplications.some(app => 
      clientJobIds.includes(app.jobId) && app.status === "hired"
    )
  ).length;
  
  const rejectedCandidates = clientCandidates.filter(c =>
    c.jobApplications.some(app => 
      clientJobIds.includes(app.jobId) && 
      ["rejected", "withdrawn"].includes(app.status)
    )
  ).length;

  return {
    totalJobs,
    activeJobs,
    closedJobs,
    draftJobs,
    totalCandidates,
    activeCandidates,
    hiredCandidates,
    rejectedCandidates,
  };
}

// Calculate job statistics
export function calculateJobStatistics(
  jobId: string,
  candidates: Candidate[],
  applications: Application[]
) {
  const jobCandidates = candidates.filter(c => c.jobIds.includes(jobId));
  const jobApplications = applications.filter(a => 
    a.targetJobId === jobId || a.assignedJobId === jobId
  );

  const totalApplications = jobApplications.length;
  const approvedApplications = jobApplications.filter(a => a.status === "approved").length;
  const rejectedApplications = jobApplications.filter(a => a.status === "rejected").length;
  
  const totalCandidates = jobCandidates.length;
  const activeCandidates = jobCandidates.filter(c =>
    c.jobApplications.some(app => 
      app.jobId === jobId && 
      !["hired", "rejected", "withdrawn"].includes(app.status)
    )
  ).length;
  
  const hiredCandidates = jobCandidates.filter(c =>
    c.jobApplications.some(app => app.jobId === jobId && app.status === "hired")
  ).length;
  
  const rejectedCandidates = jobCandidates.filter(c =>
    c.jobApplications.some(app => 
      app.jobId === jobId && ["rejected", "withdrawn"].includes(app.status)
    )
  ).length;
  
  const interviewingCandidates = jobCandidates.filter(c =>
    c.jobApplications.some(app => app.jobId === jobId && app.status === "interviewing")
  ).length;
  
  const offerExtendedCandidates = jobCandidates.filter(c =>
    c.jobApplications.some(app => app.jobId === jobId && app.status === "offer_extended")
  ).length;
  
  const candidatesInPipeline = activeCandidates + interviewingCandidates + offerExtendedCandidates;

  return {
    totalApplications,
    approvedApplications,
    rejectedApplications,
    totalCandidates,
    activeCandidates,
    hiredCandidates,
    rejectedCandidates,
    interviewingCandidates,
    offerExtendedCandidates,
    candidatesInPipeline,
  };
}
