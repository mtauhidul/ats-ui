import type { Client } from "@/types/client";
import type { Job } from "@/types/job";
import type { Candidate } from "@/types/candidate";

export function addJobToClient(client: Client, jobId: string): Client {
  if (!client.jobIds.includes(jobId)) {
    return { ...client, jobIds: [...client.jobIds, jobId] };
  }
  return client;
}

export function addCandidateToJob(job: Job, candidateId: string): Job {
  if (!job.candidateIds.includes(candidateId)) {
    return { ...job, candidateIds: [...job.candidateIds, candidateId] };
  }
  return job;
}

export function addJobToCandidate(candidate: Candidate, jobId: string): Candidate {
  if (!candidate.jobIds.includes(jobId)) {
    return { ...candidate, jobIds: [...candidate.jobIds, jobId] };
  }
  return candidate;
}

export function removeJobFromClient(client: Client, jobId: string): Client {
  return { ...client, jobIds: client.jobIds.filter(id => id !== jobId) };
}

export function removeCandidateFromJob(job: Job, candidateId: string): Job {
  return { ...job, candidateIds: job.candidateIds.filter(id => id !== candidateId) };
}

export function removeJobFromCandidate(candidate: Candidate, jobId: string): Candidate {
  return {
    ...candidate,
    jobIds: candidate.jobIds.filter(id => id !== jobId),
    jobApplications: candidate.jobApplications.filter(app => app.jobId !== jobId)
  };
}

export function validateRelationships(
  clients: Client[],
  jobs: Job[],
  candidates: Candidate[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check job-client relationships
  jobs.forEach(job => {
    const client = clients.find(c => c.id === job.clientId);
    if (!client) {
      errors.push(`Job ${job.id} references non-existent client ${job.clientId}`);
    } else if (!client.jobIds.includes(job.id)) {
      errors.push(`Client ${client.id} missing job ${job.id} in jobIds`);
    }
  });

  // Check candidate-job relationships
  candidates.forEach(candidate => {
    candidate.jobIds.forEach(jobId => {
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        errors.push(`Candidate ${candidate.id} references non-existent job ${jobId}`);
      } else if (!job.candidateIds.includes(candidate.id)) {
        errors.push(`Job ${jobId} missing candidate ${candidate.id} in candidateIds`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}
