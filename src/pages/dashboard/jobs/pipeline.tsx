import { JobKanbanBoard } from "@/components/job-kanban-board";
import { PipelineBuilder } from "@/components/pipeline-builder";
import { PipelineEmptyState } from "@/components/pipeline-empty-state";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import type { PipelineStage } from "@/types/pipeline";
import { DEFAULT_PIPELINE_TEMPLATES } from "@/types/pipeline";
import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useJobs, useCandidates, usePipelines, useAppSelector } from "@/store/hooks/index";
import { selectJobById, selectCandidates, selectCurrentJob } from "@/store/selectors";

export default function JobPipelinePage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const kanbanContainerRef = useRef<HTMLDivElement>(null);

  // Redux hooks
  const { fetchJobById, fetchJobs, updateJob, isLoading: jobsLoading } = useJobs();
  const { fetchCandidates } = useCandidates();
  const { 
    fetchPipelineById, 
    createPipeline, 
    updatePipeline,
    currentPipeline,
    setCurrentPipeline
  } = usePipelines();
  
  // Try to get job from jobs array first, fallback to currentJob
  const jobFromArray = useAppSelector(state => selectJobById(jobId || '')(state));
  const currentJob = useAppSelector(selectCurrentJob);
  const job = (jobFromArray || currentJob) as Job | undefined;
  
  const allCandidates = useAppSelector(selectCandidates);
  
  // Filter candidates for this job
  const candidates = allCandidates.filter(c => 
    c.jobApplications.some(app => app.jobId === jobId)
  );

  // State
  const [isBuilding, setIsBuilding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasFetchedJob, setHasFetchedJob] = useState(false);
  const [isFetchingPipeline, setIsFetchingPipeline] = useState(false);

  // Fetch job, candidates, and pipeline if job has pipelineId
  useEffect(() => {
    const loadData = async () => {
      if (jobId && !hasFetchedJob) {
        // Check if job already exists in state
        const existingJob = jobFromArray || currentJob;
        
        if (!existingJob || existingJob.id !== jobId) {
          // Only fetch if not already in state or different job
          console.log("Fetching job:", jobId);
          await fetchJobById(jobId);
          setHasFetchedJob(true);
        } else {
          console.log("Job already in state, skipping fetch");
          setHasFetchedJob(true);
        }
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);
  
  // Fetch candidates and jobs list only once on mount
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear pipeline when navigating to a different job
  useEffect(() => {
    // Clear the current pipeline when jobId changes
    setCurrentPipeline(null);
    setIsFetchingPipeline(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Fetch pipeline when job is loaded and has pipelineId
  useEffect(() => {
    console.log("Job loaded:", job);
    console.log("Job pipelineId:", job?.pipelineId);
    
    if (job?.pipelineId) {
      console.log("Fetching pipeline with ID:", job.pipelineId);
      setIsFetchingPipeline(true);
      fetchPipelineById(job.pipelineId).finally(() => {
        setIsFetchingPipeline(false);
      });
    } else {
      console.log("No pipelineId found on job");
      setIsFetchingPipeline(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.pipelineId]);

  // Show loading state while fetching job
  if (jobsLoading && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching pipeline for a job that has pipelineId
  if (job?.pipelineId && (isFetchingPipeline || !currentPipeline)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <Button onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateCustom = () => {
    setIsBuilding(true);
  };

  const handleSelectTemplate = async (templateKey: string) => {
    const template =
      DEFAULT_PIPELINE_TEMPLATES[
        templateKey as keyof typeof DEFAULT_PIPELINE_TEMPLATES
      ];
    if (template && job) {
      try {
        // Create pipeline in the backend
        const result = await createPipeline({
          name: `${job.title} - ${template.name}`,
          description: template.description,
          type: 'candidate',
          stages: template.stages.map((stage) => ({
            name: stage.name,
            description: stage.description,
            color: stage.color,
            order: stage.order,
            isActive: true,
          })),
        });

        console.log("Create pipeline result:", result);

        // Update job with the new pipeline ID
        if (result.payload && 'id' in result.payload) {
          const pipelineId = result.payload.id;
          console.log("Pipeline ID:", pipelineId);
          console.log("Updating job:", job.id, "with pipelineId:", pipelineId);
          
          const updateResult = await updateJob(job.id, { pipelineId });
          console.log("Update job result:", updateResult);
          
          // Refetch job to get updated data
          const fetchResult = await fetchJobById(job.id);
          console.log("Fetched job:", fetchResult);
          
          // Fetch the newly created pipeline
          await fetchPipelineById(pipelineId);
        } else {
          console.error("Failed to get pipeline ID from result:", result);
          toast.error("Failed to get pipeline ID");
        }
      } catch (error) {
        console.error("Failed to create pipeline:", error);
        toast.error("Failed to create pipeline");
      }
    }
  };

  const handleSavePipeline = async (stages: PipelineStage[]) => {
    if (!job) return;

    try {
      if (currentPipeline?.id) {
        // Update existing pipeline
        await updatePipeline(currentPipeline.id, {
          name: currentPipeline.name,
          description: currentPipeline.description,
          stages: stages.map((stage) => ({
            name: stage.name,
            description: stage.description,
            color: stage.color,
            order: stage.order,
            isActive: true,
          })),
        });
      } else {
        // Create new pipeline
        const result = await createPipeline({
          name: `${job.title} Pipeline`,
          description: `Custom pipeline for ${job.title}`,
          type: 'candidate',
          stages: stages.map((stage) => ({
            name: stage.name,
            description: stage.description,
            color: stage.color,
            order: stage.order,
            isActive: true,
          })),
        });

        // Update job with the new pipeline ID
        if (result.payload && 'id' in result.payload) {
          const pipelineId = result.payload.id;
          await updateJob(job.id, { pipelineId });
          // Refetch job to get updated data
          await fetchJobById(job.id);
          // Fetch the newly created pipeline
          await fetchPipelineById(pipelineId);
        }
      }

      setIsBuilding(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save pipeline:", error);
      toast.error("Failed to save pipeline");
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    // Navigate to candidate details
    navigate(`/dashboard/candidates/${candidate.id}`);
  };

  const handleStatusChange = (candidateId: string, newStageId: string) => {
    console.log("Status change:", { candidateId, newStageId });
    // TODO: Implement application status update
    toast.success("Candidate moved to new stage!");
  };

  const handleStageUpdate = async (stage: PipelineStage) => {
    if (!currentPipeline) return;

    try {
      const updatedStages = currentPipeline.stages.map((s) =>
        s.id === stage.id ? stage : s
      );

      await updatePipeline(currentPipeline.id, {
        stages: updatedStages.map((s) => ({
          name: s.name,
          description: s.description,
          color: s.color,
          order: s.order,
          isActive: true,
        })),
      });
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast.error("Failed to update stage");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header - Fixed */}
      <div className="border-b bg-card">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1 ">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="text-xl font-bold truncate">{job.title}</h1>
                <p className="text-xs text-muted-foreground truncate">
                  {currentPipeline
                    ? "Manage your hiring pipeline"
                    : "Setup your hiring pipeline"}
                </p>
              </div>
            </div>
            {currentPipeline && !isBuilding && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Pipeline
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          {!currentPipeline && !isBuilding ? (
            <div className="px-6 py-6 overflow-auto h-full">
              <PipelineEmptyState
                onCreateCustom={handleCreateCustom}
                onSelectTemplate={handleSelectTemplate}
              />
            </div>
          ) : isBuilding || isEditing ? (
            <div className="px-6 py-6 overflow-auto h-full">
              <div className="max-w-7xl mx-auto">
                <PipelineBuilder
                  initialStages={currentPipeline?.stages || []}
                  onSave={handleSavePipeline}
                  onCancel={() => {
                    setIsBuilding(false);
                    setIsEditing(false);
                  }}
                />
              </div>
            </div>
          ) : (
            currentPipeline && jobId && (
              <div ref={kanbanContainerRef} className="h-full overflow-hidden">
                <JobKanbanBoard
                  pipeline={currentPipeline}
                  jobId={jobId}
                  candidates={candidates}
                  onCandidateClick={handleCandidateClick}
                  onStatusChange={handleStatusChange}
                  onStageUpdate={handleStageUpdate}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
