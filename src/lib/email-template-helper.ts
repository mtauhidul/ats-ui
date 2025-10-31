import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import type { Client } from "@/types/client";

export interface EmailVariables {
  // Candidate variables
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  
  // Job variables
  jobTitle?: string;
  department?: string;
  
  // Company variables
  companyName?: string;
  
  // Interview variables
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  
  // Offer variables
  startDate?: string;
  salary?: string;
  benefits?: string;
  
  // General variables
  reviewDays?: string;
  retentionPeriod?: string;
  
  // Recruiter variables
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  
  // Custom variables
  [key: string]: string | undefined;
}

/**
 * Replace template variables with actual values
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns String with variables replaced
 */
export function replaceTemplateVariables(
  template: string,
  variables: EmailVariables
): string {
  let result = template;
  
  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
  });
  
  return result;
}

/**
 * Extract variables from candidate, job, and client data
 * @param candidate - Candidate object
 * @param job - Job object (optional)
 * @param client - Client object (optional)
 * @param customVars - Additional custom variables
 * @returns EmailVariables object
 */
export function extractEmailVariables(
  candidate: Candidate,
  job?: Job,
  client?: Client,
  customVars?: Record<string, string>
): EmailVariables {
  const variables: EmailVariables = {
    // Candidate info
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    
    // Job info
    jobTitle: job?.title || "[Job Title]",
    department: job?.department || "[Department]",
    
    // Company info - handle both populated and unpopulated clientId
    companyName: client?.companyName || 
                 (typeof job?.clientId === 'object' && job?.clientId !== null 
                   ? job.clientId.companyName
                   : undefined) || 
                 "[Company Name]",
    
    // Default recruiter info (should come from user context in real app)
    recruiterName: "HR Team",
    recruiterEmail: "hr@company.com",
    recruiterPhone: "+1 (555) 123-4567",
    
    // Default values for common variables
    reviewDays: "5-7",
    retentionPeriod: "6",
    interviewDate: "[Interview Date]",
    interviewTime: "[Interview Time]",
    interviewLocation: "[Interview Location]",
    startDate: "[Start Date]",
    salary: "[Salary]",
    benefits: "[Benefits]",
    
    // Add any custom variables
    ...customVars,
  };
  
  // Add salary info if available
  if (job?.salaryRange) {
    variables.salary = `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}`;
  }
  
  return variables;
}

/**
 * Apply template to email subject and body
 * @param subject - Email subject template
 * @param body - Email body template
 * @param variables - Variables to replace
 * @returns Object with processed subject and body
 */
export function applyEmailTemplate(
  subject: string,
  body: string,
  variables: EmailVariables
): { subject: string; body: string } {
  return {
    subject: replaceTemplateVariables(subject, variables),
    body: replaceTemplateVariables(body, variables),
  };
}
