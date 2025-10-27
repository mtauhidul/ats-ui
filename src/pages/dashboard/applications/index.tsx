import { useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { useApplications, useJobs, useClients, useAppSelector } from "@/store/hooks/index";
import { selectApplications, selectJobs, selectClients } from "@/store/selectors";
import type { Application } from "@/types/application";
import type { Job } from "@/types/job";
import type { Client } from "@/types/client";

const teamMembersPool = ["John Smith", "Sarah Wilson", "Mike Johnson", "Lisa Brown", "Tom Davis"];

export default function ApplicationsPage() {
  const { fetchApplications, isLoading: applicationsLoading } = useApplications();
  const { fetchJobs, isLoading: jobsLoading } = useJobs();
  const { fetchClients, isLoading: clientsLoading } = useClients();
  
  const applications = useAppSelector(selectApplications);
  const jobs = useAppSelector(selectJobs);
  const clients = useAppSelector(selectClients);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
    fetchClients();
  }, [fetchApplications, fetchJobs, fetchClients]);

  // Log applications data
  console.log('Applications data:', applications);
  console.log('Jobs data:', jobs);
  console.log('Clients data:', clients);

  const transformedData = applications.map((app: Application, index: number) => {
    const job = jobs.find((j: Job) => j.id === app.targetJobId);
    const client = clients.find((c: Client) => c.id === job?.clientId);
    
    // Type assertion to access backend-specific fields
    const backendApp = app as Application & {
      resumeUrl?: string;
      resumeOriginalName?: string;
      parsedData?: {
        summary?: string;
        skills?: string[];
        experience?: Array<{ company: string; title: string; duration: string; description?: string }>;
        education?: Array<{ institution: string; degree: string; field?: string; year?: string }>;
        certifications?: string[];
        languages?: string[];
      };
      notes?: string;
      internalNotes?: string;
    };

    // Calculate years of experience from experience array
    const calculateYearsOfExperience = () => {
      if (!backendApp.parsedData?.experience || backendApp.parsedData.experience.length === 0) {
        return undefined;
      }
      
      let totalMonths = 0;
      
      backendApp.parsedData.experience.forEach(exp => {
        const duration = exp.duration;
        
        // Try to extract years from text like "2 years", "3+ years"
        const yearMatch = duration.match(/(\d+)\+?\s*years?/i);
        if (yearMatch) {
          totalMonths += parseInt(yearMatch[1]) * 12;
          return;
        }
        
        // Try to parse date ranges like "July 2023 - October 2025" or "Nov 2020 - Jun 2023"
        const dateRangeMatch = duration.match(/([a-z]+)\s+(\d{4})\s*[-–—]\s*([a-z]+)?\s*(\d{4}|present|current)/i);
        if (dateRangeMatch) {
          const [, startMonth, startYear, endMonth, endYear] = dateRangeMatch;
          
          const monthMap: { [key: string]: number } = {
            jan: 0, january: 0,
            feb: 1, february: 1,
            mar: 2, march: 2,
            apr: 3, april: 3,
            may: 4,
            jun: 5, june: 5,
            jul: 6, july: 6,
            aug: 7, august: 7,
            sep: 8, sept: 8, september: 8,
            oct: 9, october: 9,
            nov: 10, november: 10,
            dec: 11, december: 11
          };
          
          const startMonthNum = monthMap[startMonth.toLowerCase()] ?? 0;
          const startYearNum = parseInt(startYear);
          
          let endMonthNum: number;
          let endYearNum: number;
          
          if (endYear.toLowerCase() === 'present' || endYear.toLowerCase() === 'current') {
            // Use current date
            const now = new Date();
            endMonthNum = now.getMonth();
            endYearNum = now.getFullYear();
          } else {
            endMonthNum = endMonth ? (monthMap[endMonth.toLowerCase()] ?? 11) : 11;
            endYearNum = parseInt(endYear);
          }
          
          // Calculate total months
          const months = (endYearNum - startYearNum) * 12 + (endMonthNum - startMonthNum);
          totalMonths += Math.max(0, months);
          return;
        }
        
        // If contains "present" or "current", assume at least 1 year
        if (duration.toLowerCase().includes('present') || duration.toLowerCase().includes('current')) {
          totalMonths += 12;
        }
      });
      
      // Convert months to years (round to nearest integer)
      const years = Math.round(totalMonths / 12);
      return years > 0 ? years : undefined;
    };

    // Format education
    const formatEducation = () => {
      const edu = backendApp.parsedData?.education?.[0];
      if (!edu) return undefined;
      
      let formatted = edu.degree || 'Degree';
      if (edu.field) {
        formatted += ` in ${edu.field}`;
      }
      if (edu.institution) {
        formatted += ` - ${edu.institution}`;
      }
      if (edu.year) {
        formatted += ` (${edu.year})`;
      }
      return formatted;
    };

    // Build full resume text from parsed data
    const buildResumeText = () => {
      if (!backendApp.parsedData) return undefined;
      
      let text = '';
      
      // Summary
      if (backendApp.parsedData.summary) {
        text += 'PROFESSIONAL SUMMARY\n\n' + backendApp.parsedData.summary + '\n\n';
      }
      
      // Skills
      if (backendApp.parsedData.skills && backendApp.parsedData.skills.length > 0) {
        text += 'TECHNICAL SKILLS\n\n' + backendApp.parsedData.skills.join(', ') + '\n\n';
      }
      
      // Experience
      if (backendApp.parsedData.experience && backendApp.parsedData.experience.length > 0) {
        text += 'PROFESSIONAL EXPERIENCE\n\n';
        backendApp.parsedData.experience.forEach(exp => {
          text += `${exp.title} | ${exp.company} | ${exp.duration}\n`;
          if (exp.description) {
            text += exp.description + '\n';
          }
          text += '\n';
        });
      }
      
      // Education
      if (backendApp.parsedData.education && backendApp.parsedData.education.length > 0) {
        text += 'EDUCATION\n\n';
        backendApp.parsedData.education.forEach(edu => {
          text += `${edu.degree}`;
          if (edu.field) text += ` in ${edu.field}`;
          text += ` | ${edu.institution}`;
          if (edu.year) text += ` | ${edu.year}`;
          text += '\n';
        });
        text += '\n';
      }
      
      // Certifications
      if (backendApp.parsedData.certifications && backendApp.parsedData.certifications.length > 0) {
        text += 'CERTIFICATIONS\n\n';
        backendApp.parsedData.certifications.forEach(cert => {
          text += '• ' + cert + '\n';
        });
      }
      
      return text.trim() || undefined;
    };

    return {
    id: app.id, // Use actual application ID from backend
    header: `${app.firstName} ${app.lastName}`, // Application name
    type: backendApp.isValidResume === true ? "valid" : backendApp.isValidResume === false ? "invalid" : "pending", // AI status (kept for compatibility)
    status:
      app.status === "pending"
        ? "In Process"
        : app.status === "approved"
        ? "Done"
        : app.status === "rejected"
        ? "Rejected"
        : "In Process",
    target: new Date(app.submittedAt).getDate(), // Day number for sorting but we'll override display
    limit: app.id, // Show actual application ID
    reviewer: app.reviewedByName || "Unassigned",
    source: app.source || "direct_application", // Application source (manual/email/direct apply)
    // Add original data for display
    dateApplied: new Date(app.submittedAt).toLocaleDateString(),
    jobIdDisplay: app.id, // Show application ID instead of job ID
    clientName: client?.companyName || "Unknown Client",
    clientLogo: client?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${client?.companyName || 'C'}`,
    teamMembers: index % 3 === 0 ? [] : teamMembersPool.slice(0, Math.floor(Math.random() * 3) + 1),
    // Additional applicant details
    photo: app.photo || undefined,
    email: app.email,
    phone: app.phone,
    currentTitle: backendApp.parsedData?.experience?.[0]?.title || app.currentTitle,
    currentCompany: backendApp.parsedData?.experience?.[0]?.company || app.currentCompany,
    yearsOfExperience: calculateYearsOfExperience() || app.yearsOfExperience,
    skills: backendApp.parsedData?.skills || app.skills || [],
    coverLetter: app.coverLetter,
    resumeText: buildResumeText(),
    resumeFilename: backendApp.resumeOriginalName || undefined,
    resumeFileSize: undefined, // Size not stored in backend
    resumeUrl: backendApp.resumeUrl || undefined,
    // Personal details
    location: app.address || undefined,
    linkedinUrl: app.linkedInUrl || undefined,
    portfolioUrl: app.portfolioUrl || undefined,
    githubUrl: app.githubUrl || undefined,
    educationLevel: formatEducation(),
    expectedSalary: app.expectedSalary 
      ? `${app.expectedSalary.currency} ${app.expectedSalary.min.toLocaleString()} - ${app.expectedSalary.max.toLocaleString()} / ${app.expectedSalary.period}`
      : undefined,
    languages: backendApp.parsedData?.languages && backendApp.parsedData.languages.length > 0 
      ? backendApp.parsedData.languages 
      : undefined,
    notes: backendApp.internalNotes || backendApp.notes || app.reviewNotes || undefined,
    // Additional documents
    additionalDocuments: app.additionalDocuments || [],
    // Availability
    availableStartDate: app.availableStartDate ? new Date(app.availableStartDate).toLocaleDateString() : undefined,
    preferredWorkMode: app.preferredWorkMode,
    willingToRelocate: app.willingToRelocate,
    // Video introduction (only if available)
    videoIntroUrl: backendApp.videoIntroUrl || undefined,
    videoIntroFilename: undefined,
    videoIntroFileSize: undefined,
    videoIntroDuration: undefined,
    // Parsed data for experience calculation fallback
    parsedData: backendApp.parsedData || undefined,
    // AI Resume Validation
    isValidResume: backendApp.isValidResume,
    validationScore: backendApp.validationScore,
    validationReason: backendApp.validationReason,
    // Raw text for preview
    resumeRawText: backendApp.resumeRawText || undefined,
  };
  });

  const isLoading = applicationsLoading || jobsLoading || clientsLoading;

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading applications...</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Applications
              </h2>
              <p className="text-muted-foreground">
                Track and manage job applications and their status
              </p>
            </div>
          </div>
          <DataTable data={transformedData} />
        </div>
      </div>
    </div>
  );
}
