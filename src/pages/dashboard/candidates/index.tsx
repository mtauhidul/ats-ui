import { CandidatesDataTable } from "@/components/candidates-data-table";
import candidatesData from "@/lib/mock-data/candidates.json";
import jobsData from "@/lib/mock-data/jobs.json";
import clientsData from "@/lib/mock-data/clients.json";

// Mock stages and clients for demonstration
const stages = ["New Application", "Screening", "Interview", "Assessment", "Offer", "Hired"];

// Mock team members pool
const teamMembersPool = ["John Smith", "Sarah Wilson", "Mike Johnson", "Lisa Brown", "Tom Davis", "Emma Davis", "Alex Chen"];

export default function CandidatesPage() {
  const transformedData = candidatesData.map((candidate, index) => {
    // Randomly assign 0-3 team members
    const teamMemberCount = Math.floor(Math.random() * 4);
    const shuffled = [...teamMembersPool].sort(() => 0.5 - Math.random());
    const selectedTeamMembers = teamMemberCount > 0 ? shuffled.slice(0, teamMemberCount) : [];
    
    // Get first job application details
    const firstJobApp = candidate.jobApplications[0];
    const job = jobsData.find(j => j.id === firstJobApp?.jobId);
    const client = clientsData.find(c => c.id === job?.clientId);
    
    // Map candidate status to display status
    const getDisplayStatus = (status: string) => {
      switch(status) {
        case "new": return "In Process";
        case "screening": return "In Process";
        case "interviewing": return "In Process";
        case "offer_extended": return "In Process";
        case "hired": return "Hired";
        case "rejected": return "Rejected";
        case "withdrawn": return "Rejected";
        default: return "In Process";
      }
    };
    
    return {
      id: parseInt(candidate.id.replace(/\D/g, '')) || Math.abs(candidate.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
      candidateId: candidate.id, // Actual candidate ID
      header: `${candidate.firstName} ${candidate.lastName}`, // Candidate name
      type: job?.title || "General Applicant", // Job title they applied for
      status: getDisplayStatus(firstJobApp?.status || "new"),
      target: new Date(candidate.createdAt).getTime(), // Timestamp for sorting
      limit: candidate.yearsOfExperience || 0, // For sorting
      reviewer: "Team", // Could be derived from job assignments
      // Properly mapped display data
      dateApplied: firstJobApp?.appliedAt ? new Date(firstJobApp.appliedAt).toLocaleDateString() : new Date(candidate.createdAt).toLocaleDateString(), // Actual application date
      currentStage: stages[index % stages.length], // Current pipeline stage
      jobIdDisplay: job?.id || "N/A", // Actual job ID
      jobTitle: job?.title || "General Applicant", // Job title
      clientName: client?.companyName || "Unknown Client", // Client name
      clientLogo: client?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${client?.companyName || 'C'}`, // Client logo
      teamMembers: selectedTeamMembers, // Assigned team members
      // Additional candidate details
      photo: candidate.avatar || undefined,
      email: candidate.email,
      phone: candidate.phone,
      currentTitle: candidate.currentTitle,
      currentCompany: candidate.currentCompany,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills?.map(s => s.name) || [],
      coverLetter: undefined,
      resumeText: undefined,
      resumeFilename: undefined,
      resumeFileSize: undefined,
      // Personal details
      location: candidate.address ? `${candidate.address.city}, ${candidate.address.country}` : undefined,
      linkedinUrl: undefined,
      portfolioUrl: undefined,
      educationLevel: candidate.education?.[0]?.level || undefined,
      expectedSalary: undefined,
      languages: candidate.languages?.map(l => l.name) || undefined,
      notes: undefined,
      // Video introduction (demo data for first applicant)
      videoIntroUrl: index === 0 ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined,
      videoIntroFilename: index === 0 ? "sarah_johnson_intro.mp4" : undefined,
      videoIntroFileSize: index === 0 ? "15.2 MB" : undefined,
      videoIntroDuration: index === 0 ? "2:30" : undefined,
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Candidates
              </h2>
              <p className="text-muted-foreground">
                Track and manage candidates across all job applications
              </p>
            </div>
          </div>
          <CandidatesDataTable data={transformedData} />
        </div>
      </div>
    </div>
  );
}
