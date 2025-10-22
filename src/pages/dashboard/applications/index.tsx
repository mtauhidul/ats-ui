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
        : "Rejected",
    target: new Date(app.submittedAt).getDate(), // Day number for sorting but we'll override display
    limit: Number(app.jobId?.replace(/\D/g, "") || index + 1), // Job number for sorting but we'll override display
    reviewer: app.reviewedBy || "Unassigned",
    // Add original data for display
    dateApplied: new Date(app.submittedAt).toLocaleDateString(),
    jobIdDisplay: app.jobId || "-",
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
