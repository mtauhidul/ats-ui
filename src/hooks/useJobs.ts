import type { Job } from "@/types";
import type { DocumentData } from "firebase/firestore";
import { useMemo } from "react";
import {
  useFirestoreCollection,
  where,
  type UseFirestoreCollectionResult,
} from "./useFirestore";

/**
 * Transform Firestore document to Job type
 * Handles backend data structure differences
 */
function transformJobDocument(doc: DocumentData): Job {
  // Parse location string to Address object
  let locationObj: { city?: string; country?: string } | undefined;
  if (typeof doc.location === "string") {
    const parts = doc.location.split(",").map((p: string) => p.trim());
    locationObj = {
      city: parts[0] || "",
      country: parts[1] || "",
    };
  } else if (doc.location && typeof doc.location === "object") {
    locationObj = doc.location as { city?: string; country?: string };
  }

  // Transform requirements and skills
  // Handle BOTH formats:
  // 1. Old format: requirements: string[], skills: string[]
  // 2. New format: requirements: {experience: string, skills: {...}}, skills: string[]

  let requirementsObj;

  if (
    doc.requirements &&
    typeof doc.requirements === "object" &&
    !Array.isArray(doc.requirements)
  ) {
    // New format: requirements is already an object
    requirementsObj = doc.requirements as {
      experience: string;
      skills: { required: string[]; preferred: string[] };
    };
  } else {
    // Old format: requirements is an array of strings
    const backendRequirements = Array.isArray(doc.requirements)
      ? (doc.requirements as string[])
      : [];
    const backendSkills = Array.isArray(doc.skills)
      ? (doc.skills as string[])
      : [];

    // Try to find experience requirement
    const experienceReq =
      backendRequirements.find(
        (req) =>
          req.toLowerCase().includes("year") ||
          req.toLowerCase().includes("experience") ||
          /\d+/.test(req)
      ) ||
      backendRequirements[0] ||
      "";

    requirementsObj = {
      experience: experienceReq,
      skills: {
        required: backendSkills,
        preferred: [],
      },
    };
  }

  // Extract IDs from populated objects if needed
  let clientId = doc.clientId;
  if (clientId && typeof clientId === "object") {
    clientId = clientId.id || clientId._id;
  }

  let pipelineId = doc.pipelineId;
  if (pipelineId && typeof pipelineId === "object") {
    pipelineId = pipelineId.id || pipelineId._id;
  }

  return {
    ...doc,
    id: doc.id,
    clientId,
    pipelineId,
    location: locationObj,
    workMode: (doc.locationType as "remote" | "onsite" | "hybrid") || "hybrid",
    requirements: requirementsObj,
    type: doc.jobType || doc.type,
    // Ensure arrays are properly typed
    categoryIds: Array.isArray(doc.categoryIds) ? doc.categoryIds : [],
    tagIds: Array.isArray(doc.tagIds) ? doc.tagIds : [],
  } as unknown as Job;
}

/**
 * Hook to subscribe to all jobs with realtime updates
 */
export function useJobs(options?: {
  enabled?: boolean;
  status?: string;
  clientId?: string;
}): UseFirestoreCollectionResult<Job> {
  const { enabled = true, status, clientId } = options || {};

  // Build query constraints
  const queryConstraints = useMemo(() => {
    const constraints = [];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    if (clientId) {
      constraints.push(where("clientId", "==", clientId));
    }

    // Ordering removed to avoid index requirements - sort in frontend if needed

    return constraints;
  }, [status, clientId]);

  const result = useFirestoreCollection<Job>({
    collectionPath: "jobs", // Root level collection
    queryConstraints,
    enabled,
    transform: transformJobDocument,
  });

  console.log("🔍 useJobs hook result:", {
    jobsCount: result.data.length,
    loading: result.loading,
    error: result.error,
    enabled,
    status,
    clientId,
  });

  return result;
}

/**
 * Hook to subscribe to a single job with realtime updates
 */
export function useJob(jobId: string | null | undefined): {
  job: Job | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
} {
  const enabled = !!jobId;

  // Get all jobs and filter (simpler than document subscription for now)
  const { data: jobs, loading, error } = useJobs({ enabled });

  const job = useMemo(() => {
    if (!jobId || !jobs.length) return null;
    return jobs.find((j) => j.id === jobId) || null;
  }, [jobId, jobs]);

  return {
    job,
    loading,
    error: error as Error | null,
    exists: !!job,
  };
}

/**
 * Hook to get jobs by status with realtime updates
 */
export function useJobsByStatus(
  status: string,
  enabled = true
): UseFirestoreCollectionResult<Job> {
  return useJobs({ enabled, status });
}

/**
 * Hook to get jobs by client with realtime updates
 */
export function useJobsByClient(
  clientId: string | null,
  enabled = true
): UseFirestoreCollectionResult<Job> {
  const shouldEnable = enabled && !!clientId;
  return useJobs({ enabled: shouldEnable, clientId: clientId || undefined });
}
