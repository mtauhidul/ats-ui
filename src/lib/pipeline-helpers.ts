import type { Candidate, CandidateStatus } from "@/types/candidate";

// Map pipeline stage IDs to candidate status
const stageToStatusMap: Record<string, CandidateStatus> = {
  "new": "new",
  "screening": "screening",
  "interviewing": "interviewing",
  "testing": "testing",
  "technical_test": "testing",
  "technical_interview": "interviewing",
  "behavioral": "interviewing",
  "phone_screen": "screening",
  "sales_assessment": "testing",
  "manager_interview": "interviewing",
  "final_interview": "interviewing",
  "reference_check": "reference_check",
  "offer": "offer_extended",
  "offer_extended": "offer_extended",
  "hired": "hired",
  "rejected": "rejected",
  "withdrawn": "withdrawn",
};

export function mapStageToStatus(stageId: string): CandidateStatus {
  return stageToStatusMap[stageId] || "new";
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
