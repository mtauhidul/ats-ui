import type { Candidate, CandidateStatus } from "@/types/candidate";

// Map pipeline stage IDs to candidate status
const stageToStatusMap: Record<string, CandidateStatus> = {
  "new": "active",
  "screening": "active",
  "interviewing": "interviewing",
  "testing": "interviewing",
  "technical_test": "interviewing",
  "technical_interview": "interviewing",
  "behavioral": "interviewing",
  "phone_screen": "active",
  "sales_assessment": "interviewing",
  "manager_interview": "interviewing",
  "final_interview": "interviewing",
  "reference_check": "interviewing",
  "offer": "offered",
  "offer_extended": "offered",
  "hired": "hired",
  "rejected": "rejected",
  "withdrawn": "withdrawn",
};

export function mapStageToStatus(stageId: string): CandidateStatus {
  return stageToStatusMap[stageId] || "active";
}

export function updateCandidateStatus(
  candidate: Candidate,
  jobId: string,
  newStatus: CandidateStatus
): Candidate {
  return {
    ...candidate,
    jobApplications: candidate.jobApplications.map(app =>
      app.jobId === jobId
        ? { ...app, status: newStatus, lastStatusChange: new Date() }
        : app
    ),
    updatedAt: new Date(),
  };
}
