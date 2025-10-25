import { JobKanbanBoard } from "@/components/job-kanban-board";
import { PipelineBuilder } from "@/components/pipeline-builder";
import { PipelineEmptyState } from "@/components/pipeline-empty-state";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/types/candidate";
import type { Job } from "@/types/job";
import type { Pipeline, PipelineStage } from "@/types/pipeline";
import { DEFAULT_PIPELINE_TEMPLATES } from "@/types/pipeline";
import { ArrowLeft, Edit } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Mock data - replace with actual data fetching
import candidatesData from "@/lib/mock-data/candidates.json";
import jobsData from "@/lib/mock-data/jobs.json";

export default function JobPipelinePage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const kanbanContainerRef = useRef<HTMLDivElement>(null);

  // Find the job
  const job = jobsData.find((j) => j.id === jobId) as Job | undefined;
  const candidates = candidatesData as unknown as Candidate[];

  // State
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSelectTemplate = (templateKey: string) => {
    const template =
      DEFAULT_PIPELINE_TEMPLATES[
        templateKey as keyof typeof DEFAULT_PIPELINE_TEMPLATES
      ];
    if (template) {
      const newPipeline: Pipeline = {
        id: Date.now().toString(),
        name: template.name,
        description: template.description,
        jobId: job.id,
        stages: template.stages.map((stage, index) => ({
          ...stage,
          id: `${Date.now()}-${index}`,
        })),
        isTemplate: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPipeline(newPipeline);
      toast.success(`${template.name} created successfully!`);
    }
  };

  const handleSavePipeline = (stages: PipelineStage[]) => {
    const newPipeline: Pipeline = {
      id: pipeline?.id || Date.now().toString(),
      name: `${job.title} Pipeline`,
      description: `Custom pipeline for ${job.title}`,
      jobId: job.id,
      stages,
      isTemplate: false,
      isActive: true,
      createdAt: pipeline?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    setPipeline(newPipeline);
    setIsBuilding(false);
    setIsEditing(false);
    toast.success("Pipeline saved successfully!");
  };

  const handleCandidateClick = (candidate: Candidate) => {
    // Navigate to candidate details or open modal
    console.log("Candidate clicked:", candidate);
  };

  const handleStatusChange = (candidateId: string, newStageId: string) => {
    console.log("Status change:", { candidateId, newStageId });
    toast.success("Candidate moved to new stage!");
  };

  const handleStageUpdate = (stage: PipelineStage) => {
    if (!pipeline) return;

    const updatedStages = pipeline.stages.map((s) =>
      s.id === stage.id ? stage : s
    );

    setPipeline({
      ...pipeline,
      stages: updatedStages,
      updatedAt: new Date(),
    });

    toast.success("Stage updated successfully!");
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
                  {pipeline
                    ? "Manage your hiring pipeline"
                    : "Setup your hiring pipeline"}
                </p>
              </div>
            </div>
            {pipeline && !isBuilding && !isEditing && (
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
          {!pipeline && !isBuilding ? (
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
                  initialStages={pipeline?.stages || []}
                  onSave={handleSavePipeline}
                  onCancel={() => {
                    setIsBuilding(false);
                    setIsEditing(false);
                  }}
                />
              </div>
            </div>
          ) : (
            pipeline && (
              <div ref={kanbanContainerRef} className="h-full overflow-hidden">
                <JobKanbanBoard
                  pipeline={pipeline}
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
