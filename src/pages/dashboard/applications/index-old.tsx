import { DataTable } from "@/components/data-table";
import applicationsData from "@/lib/mock-data/applications.json";

export default function ApplicationsPage() {
  const transformedData = applicationsData.map((app, index) => ({
    id: index + 1,
    header: `${app.firstName} ${app.lastName}`, // Application name
    type: app.aiAnalysis?.isValid ? "valid" : "invalid", // AI status
    status:
      app.status === "pending"
        ? "In Process"
        : app.status === "approved"
        ? "Done"
        : app.status === "rejected"
        ? "Rejected"
        : "In Process",
    target: new Date(app.submittedAt).getDate(), // Day number for sorting but we'll override display
    limit: Number(app.targetJobId?.replace(/\D/g, "") || index + 1), // Job number for sorting but we'll override display
    reviewer: app.reviewedByName || "Unassigned",
    // Add original data for display
    dateApplied: new Date(app.submittedAt).toLocaleDateString(),
    jobIdDisplay: app.targetJobTitle || app.targetJobId || "-",
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
    linkedinUrl: app.linkedInUrl || undefined, // Note: correct case in data
    portfolioUrl: app.portfolioUrl || undefined,
    educationLevel: undefined, // Not available in current data
    expectedSalary: undefined, // Not available in current data  
    languages: undefined, // Not available in current data
    notes: undefined, // Not available in current data
    // Video introduction (demo data for first applicant)
    videoIntroUrl: index === 0 ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : undefined,
    videoIntroFilename: index === 0 ? "sarah_johnson_intro.mp4" : undefined,
    videoIntroFileSize: index === 0 ? "15.2 MB" : undefined,
    videoIntroDuration: index === 0 ? "2:30" : undefined,
  }));

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
