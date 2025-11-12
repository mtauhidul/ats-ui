// Session storage utilities for pipeline feature

const SESSION_KEYS = {
  SELECTED_JOB_ID: "pipeline_selected_job_id",
} as const;

/**
 * Save selected job ID to session storage
 */
export function saveJobSelectionToSession(jobId: string): void {
  try {
    sessionStorage.setItem(SESSION_KEYS.SELECTED_JOB_ID, jobId);
  } catch (error) {
    }
}

/**
 * Get selected job ID from session storage
 */
export function getJobSelectionFromSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEYS.SELECTED_JOB_ID);
  } catch (error) {
    return null;
  }
}

/**
 * Clear job selection from session storage
 */
export function clearJobSelectionFromSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEYS.SELECTED_JOB_ID);
  } catch (error) {
    }
}
