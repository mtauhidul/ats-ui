import { DataTable } from "@/components/data-table";
import candidatesData from "@/lib/mock-data/candidates.json";

export default function CandidatesPage() {
  const transformedData = candidatesData.map((candidate, index) => {
    // Get the most prominent status from all job applications
    const primaryApplication = candidate.jobApplications.reduce((prev, curr) => {
      const statusPriority = {
        offer_extended: 7,
        interviewing: 6,
        testing: 5,
        reference_check: 4,
        screening: 3,
        new: 2,
        hired: 1,
        rejected: 0,
        withdrawn: 0,
      };
      return statusPriority[curr.status as keyof typeof statusPriority] > 
             statusPriority[prev.status as keyof typeof statusPriority]
        ? curr
        : prev;
    }, candidate.jobApplications[0]);

    // Count active applications
    const activeApplications = candidate.jobApplications.filter((app) =>
      ["new", "screening", "interviewing", "testing", "reference_check", "offer_extended"].includes(app.status)
    ).length;

    return {
      id: index + 1,
      header: `${candidate.firstName} ${candidate.lastName}`, // Candidate name
      type: candidate.source === "linkedin" ? "LinkedIn" : 
            candidate.source === "job_board" ? "Job Board" :
            candidate.source === "referral" ? "Referral" :
            candidate.source === "recruiter" ? "Recruiter" :
            candidate.source === "website" ? "Website" :
            candidate.source, // Source of candidate
      status:
        primaryApplication.status === "hired"
          ? "Done"
          : primaryApplication.status === "rejected"
          ? "Rejected"
          : primaryApplication.status === "withdrawn"
          ? "Withdrawn"
          : "In Process",
      target: candidate.yearsOfExperience || 0, // Years of experience for sorting
      limit: candidate.jobApplications.length, // Total applications for sorting
      reviewer: candidate.currentCompany || "Seeking Opportunity",
      // Display data
      dateApplied: new Date(candidate.createdAt).toLocaleDateString(),
      jobIdDisplay: `${candidate.jobApplications.length} Application${candidate.jobApplications.length > 1 ? 's' : ''}`,
      // Candidate details
      photo: candidate.avatar || undefined,
      email: candidate.email,
      phone: candidate.phone,
      currentTitle: candidate.currentTitle,
      currentCompany: candidate.currentCompany,
      yearsOfExperience: candidate.yearsOfExperience,
      skills: candidate.skills?.map(s => s.name),
      coverLetter: undefined, // Not applicable for candidates view
      resumeText: undefined,
      resumeFilename: undefined, // Resume attached to candidate profile
      resumeFileSize: undefined,
      // Personal details
      location: candidate.address ? `${candidate.address.city}, ${candidate.address.country}` : undefined,
      linkedinUrl: undefined,
      portfolioUrl: undefined,
      educationLevel: candidate.education?.[0]?.degree,
      expectedSalary: undefined,
      languages: candidate.languages?.map(l => `${l.name} (${l.proficiency})`) || [],
      notes: undefined,
      // Additional candidate-specific info
      totalApplications: candidate.jobApplications.length,
      activeApplications: activeApplications,
      primaryStatus: primaryApplication.status,
      primaryJobId: primaryApplication.jobId,
      certifications: candidate.certifications?.join(", "),
      preferredWorkMode: undefined,
      willingToRelocate: undefined,
      availableStartDate: undefined,
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
                Manage all candidates across all jobs and track their complete journey
              </p>
            </div>
          </div>
          <DataTable data={transformedData} />
        </div>
      </div>
    </div>
  );
}
