import { CandidatesDataTable } from "@/components/candidates-data-table";
import applicationsData from "@/lib/mock-data/applications.json";

// Mock stages and clients for demonstration
const stages = ["New Application", "Screening", "Interview", "Assessment", "Offer", "Hired"];
const clients = [
  { name: "Tech Corp Inc.", logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC" },
  { name: "Innovation Labs", logo: "https://api.dicebear.com/7.x/initials/svg?seed=IL" },
  { name: "Global Solutions", logo: "https://api.dicebear.com/7.x/initials/svg?seed=GS" },
  { name: "StartUp Hub", logo: "https://api.dicebear.com/7.x/initials/svg?seed=SH" },
  { name: "Enterprise Co.", logo: "https://api.dicebear.com/7.x/initials/svg?seed=EC" },
];

// Mock team members pool
const teamMembersPool = ["John Smith", "Sarah Wilson", "Mike Johnson", "Lisa Brown", "Tom Davis", "Emma Davis", "Alex Chen"];

export default function CandidatesPage() {
  const transformedData = applicationsData.map((app, index) => {
    // Randomly assign 0-3 team members
    const teamMemberCount = Math.floor(Math.random() * 4);
    const shuffled = [...teamMembersPool].sort(() => 0.5 - Math.random());
    const selectedTeamMembers = teamMemberCount > 0 ? shuffled.slice(0, teamMemberCount) : [];
    
    const clientIndex = index % clients.length;
    
    return {
      id: index + 1,
      header: `${app.firstName} ${app.lastName}`, // Candidate name
      type: app.jobId || `JOB-${String(index + 1).padStart(3, '0')}`, // Job ID Applied
      status:
        app.status === "pending"
          ? "In Process"
          : app.status === "approved"
          ? "Hired"
          : "Rejected",
      target: new Date(app.submittedAt).getDate(), // For sorting
      limit: Number(app.jobId?.replace(/\D/g, "") || index + 1), // For sorting
      reviewer: app.reviewedBy || "Unassigned",
      // Display data with realistic variations
      dateApplied: stages[index % stages.length], // Current Stage
      jobIdDisplay: clients[clientIndex].name, // Client name
      clientLogo: clients[clientIndex].logo, // Client logo
      teamMembers: selectedTeamMembers, // Assigned team members
      // Additional applicant details
      photo: app.photo || undefined,
      email: app.email,
      phone: app.phone,
      currentTitle: app.currentTitle,
      currentCompany: app.currentCompany,
      yearsOfExperience: app.yearsOfExperience,
      skills: app.skills,
      coverLetter: app.coverLetter,
      resumeText: app.resumeText,
      resumeFilename: app.resume?.filename,
      resumeFileSize: app.resume?.size ? `${Math.round(app.resume.size / 1024)} KB` : undefined,
      // Personal details (using available fields or providing fallbacks)
      location: app.address || undefined,
      linkedinUrl: app.linkedInUrl || undefined,
      portfolioUrl: app.portfolioUrl || undefined,
      educationLevel: undefined,
      expectedSalary: undefined,  
      languages: undefined,
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
