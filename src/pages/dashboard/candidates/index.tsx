import { CandidatesDataTable } from "@/components/candidates-data-table";
import { Loader } from "@/components/ui/loader";
import {
  useCandidates,
  useClients,
  useJobs,
  usePipelines,
} from "@/store/hooks/index";

// Mock team members pool
const teamMembersPool = [
  "John Smith",
  "Sarah Wilson",
  "Mike Johnson",
  "Lisa Brown",
  "Tom Davis",
  "Emma Davis",
  "Alex Chen",
];

export default function CandidatesPage() {
  // 🔥 REALTIME: Get data directly from Firestore hooks - auto-updates in realtime!
  const {
    candidates,
    deleteCandidate,
    invalidateCache,
    isLoading: candidatesLoading,
  } = useCandidates();
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { clients, isLoading: clientsLoading } = useClients();
  const { pipelines, isLoading: pipelinesLoading } = usePipelines();

  // No useEffect needed - Firestore provides realtime data automatically via Redux hooks!
  // Removed: fetchCandidatesIfNeeded, fetchJobsIfNeeded, fetchClientsIfNeeded calls
  // Removed: refetchCandidates event listener (data updates automatically)

  // DISABLED: Excessive refetching causes performance issues and API spam
  // Only refetch on user action (delete, update) or manual page refresh
  //
  // // Refetch candidates when window regains focus (for real-time sync)
  // useEffect(() => {
  //   const handleFocus = () => {
  //     //     fetchCandidates();
  //   };
  //
  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [fetchCandidates]);

  // // Poll for updates every 30 seconds when tab is visible
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (document.visibilityState === 'visible') {
  //       //       fetchCandidates();
  //     }
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [fetchCandidates]);

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
      // Firestore will automatically update the list after deletion
      invalidateCache();
    } catch (error) {
      }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = candidates.map((candidate: any, index) => {
    // Debug: Log candidate resume data
    if (index === 0) {
      }

    // Randomly assign 0-3 team members
    const teamMemberCount = Math.floor(Math.random() * 4);
    const shuffled = [...teamMembersPool].sort(() => 0.5 - Math.random());
    const selectedTeamMembers =
      teamMemberCount > 0 ? shuffled.slice(0, teamMemberCount) : [];

    // Get first job details - jobIds can be populated objects or strings
    const firstJobId = candidate.jobIds?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let job: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let client: any = null;

    if (firstJobId) {
      // Check if it's already a populated object
      if (typeof firstJobId === "object" && "title" in firstJobId) {
        // Create a mutable copy since backend objects are frozen
        job = { ...firstJobId, id: firstJobId.id || firstJobId._id };

        // Check if clientId is populated within the job (this is the key fix!)
        if (
          job.clientId &&
          typeof job.clientId === "object" &&
          "companyName" in job.clientId
        ) {
          // Client is already populated within the job - create mutable copy
          client = { ...job.clientId, id: job.clientId.id || job.clientId._id };
        } else if (job.clientId) {
          // Client is just an ID, look it up in clients array (fallback)
          const clientIdStr =
            typeof job.clientId === "object"
              ? job.clientId._id || job.clientId.id
              : job.clientId;
          client = clients.find((c) => c.id === clientIdStr);
        }
      } else {
        // It's just an ID string, find in jobs array (shouldn't happen with our backend setup)
        job = jobs.find((j) => j.id === firstJobId);
        if (job) {
          client = clients.find((c) => c.id === job.clientId);
        }
      }
    }

    // Map candidate status to display status
    const getDisplayStatus = (status: string) => {
      switch (status) {
        case "active":
          return "In Process";
        case "interviewing":
          return "In Process";
        case "offered":
          return "In Process";
        case "hired":
          return "Hired";
        case "rejected":
          return "Rejected";
        case "withdrawn":
          return "Rejected";
        default:
          return "In Process";
      }
    };

    // Use normalized id field (backend now returns both id and _id)
    const candidateId = candidate.id || candidate._id || "";

    // Get current stage from backend (can be string or object)
    // Check both currentPipelineStageId (new field) and currentStage (legacy field)
    let currentStage = "Not Started";

    // Get the stage ID from either field
    const stageId =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (candidate as any).currentPipelineStageId || candidate.currentStage;

    if (typeof stageId === "object" && stageId?.name) {
      // Already populated with stage object
      currentStage = stageId.name;
    } else if (stageId && typeof stageId === "string") {
      // It's a stage ID, look it up in pipelines
      // Find the pipeline for this job
      const jobPipeline = pipelines.find((p) => p.jobId === job?.id);

      if (jobPipeline) {
        // Find the stage in this pipeline
        const stage = jobPipeline.stages?.find((s) => s.id === stageId);
        if (stage) {
          currentStage = stage.name;
        } else {
          // Stage ID not found in pipeline, show the ID
          currentStage = stageId;
        }
      } else {
        // No pipeline found, show the stage ID
        currentStage = stageId;
      }
    }

    return {
      id: candidateId, // Use the normalized candidate ID (string)
      candidateId: candidateId, // Actual candidate ID for API calls
      header: `${candidate.firstName} ${candidate.lastName}`, // Candidate name
      type: job?.title || "General Applicant", // Job title they applied for
      status: getDisplayStatus(candidate.status || "active"),
      target: new Date(candidate.createdAt).getTime(), // Timestamp for sorting
      limit: candidate.yearsOfExperience || 0, // For sorting
      reviewer: "Team", // Could be derived from job assignments
      // Properly mapped display data
      dateApplied: new Date(candidate.createdAt).toLocaleDateString(), // Candidate creation date
      currentStage: currentStage, // Current pipeline stage from backend
      jobIdDisplay: job?.id || "N/A", // Actual job ID
      jobTitle: job?.title || "General Applicant", // Job title
      clientName: client?.companyName || "Unknown Client", // Client name
      clientLogo:
        client?.logo ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${
          client?.companyName || "C"
        }`, // Client logo
      teamMembers: selectedTeamMembers, // Assigned team members
      assignedTo: candidate.assignedTo, // Assigned team member (can be ID or populated User object)
      // Additional candidate details
      photo: candidate.avatar || undefined,
      email: candidate.email,
      phone: candidate.phone,
      currentTitle: candidate.currentTitle,
      currentCompany: candidate.currentCompany,
      yearsOfExperience: candidate.yearsOfExperience,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skills: candidate.skills?.map((s: any) => s.name) || [],
      coverLetter: candidate.coverLetter?.url || undefined,
      resumeText: undefined,
      // Check multiple possible resume field locations (Cloudinary)
      resumeFilename: candidate.resume?.name || candidate.resume?.originalName || candidate.resumeFileName || undefined,
      resumeFileSize: candidate.resume?.size || candidate.resumeFileSize || undefined,
      resumeUrl: candidate.resume?.url || candidate.resumeUrl || candidate.resume?.secure_url || undefined,
      // Personal details
      location: candidate.address
        ? `${candidate.address.city}, ${candidate.address.country}`
        : undefined,
      linkedinUrl: undefined,
      portfolioUrl: undefined,
      educationLevel: candidate.education?.[0]?.level || undefined,
      expectedSalary: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      languages: candidate.languages?.map((l: any) => l.name) || undefined,
      notes: undefined,
      // Video introduction (demo data for first applicant)
      videoIntroUrl:
        index === 0
          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          : undefined,
      videoIntroFilename: index === 0 ? "sarah_johnson_intro.mp4" : undefined,
      videoIntroFileSize: index === 0 ? "15.2 MB" : undefined,
      videoIntroDuration: index === 0 ? "2:30" : undefined,
    };
  });

  const isLoading =
    candidatesLoading || jobsLoading || clientsLoading || pipelinesLoading;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" text="Loading candidates..." />
      </div>
    );

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
          <CandidatesDataTable
            data={transformedData}
            onDeleteCandidate={handleDeleteCandidate}
          />
        </div>
      </div>
    </div>
  );
}
