"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as Kanban from "@/components/ui/kanban";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Candidate } from "@/types/candidate";
import type { Pipeline, PipelineStage } from "@/types/pipeline";
import { Edit, GripVertical, Mail, MoreHorizontal, Phone, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface JobKanbanBoardProps {
  pipeline: Pipeline;
  jobId: string;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onStatusChange: (candidateId: string, newStageId: string) => void;
  onStageUpdate?: (stage: PipelineStage) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

// Helper to format candidate name
const getCandidateName = (candidate: Candidate) => {
  const firstName = candidate.firstName || "";
  const lastName = candidate.lastName || "";
  return `${firstName} ${lastName}`.trim() || "Unknown Candidate";
};

// Helper to get candidate initials
const getCandidateInitials = (candidate: Candidate) => {
  const firstName = candidate.firstName || "";
  const lastName = candidate.lastName || "";
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  return first + last || "?";
};

export function JobKanbanBoard({
  pipeline,
  candidates,
  onCandidateClick,
  onStatusChange,
  onStageUpdate,
}: JobKanbanBoardProps) {
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  // Ensure stages is always an array
  const stages = useMemo(() => {
    if (pipeline?.stages && Array.isArray(pipeline.stages)) {
      return pipeline.stages;
    }
    return [];
  }, [pipeline?.stages]);

  // Group candidates by stage with type conversion
  const columnData = useMemo(() => {
    console.log("=== KANBAN BOARD: Grouping Candidates ===");
    console.log("Total candidates received:", candidates.length);
    console.log(
      "Pipeline stages:",
      stages.map((s) => ({ id: s.id, name: s.name }))
    );

    const grouped: Record<string, Candidate[]> = {};

    // Initialize all stages
    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    // Group candidates by their current stage
    candidates.forEach((candidate, index) => {
      const candidateWithStage = candidate as {
        currentPipelineStageId?: string | { toString(): string };
        currentStage?: { id: string };
      };

      console.log(`\nCandidate ${index + 1}:`, {
        name: getCandidateName(candidate),
        id: candidate.id,
        currentPipelineStageId: candidateWithStage.currentPipelineStageId,
        currentStage: candidateWithStage.currentStage,
      });

      const currentStageId =
        candidateWithStage.currentPipelineStageId?.toString() ||
        candidateWithStage.currentStage?.id;

      console.log(`  -> Current stage ID: ${currentStageId}`);
      console.log(
        `  -> Stage exists in grouped: ${!!grouped[currentStageId || ""]}`
      );

      if (currentStageId && grouped[currentStageId]) {
        grouped[currentStageId].push(candidate);
        console.log(`  -> Added to stage: ${currentStageId}`);
      } else {
        // If no stage assigned, put in first stage
        const firstStage = stages[0];
        if (firstStage) {
          grouped[firstStage.id].push(candidate);
          console.log(
            `  -> No stage assigned, added to first stage: ${firstStage.name} (${firstStage.id})`
          );
        }
      }
    });

    console.log("\n=== Final grouped candidates by stage: ===");
    Object.entries(grouped).forEach(([stageId, stageCandidates]) => {
      const stage = stages.find((s) => s.id === stageId);
      console.log(
        `${stage?.name} (${stageId}): ${stageCandidates.length} candidates`
      );
    });
    console.log("=========================================\n");

    return grouped;
  }, [candidates, stages]);

  const getCandidatesForStage = useCallback(
    (stageId: string) => columnData[stageId] || [],
    [columnData]
  );

  // Listen for real-time updates
  useEffect(() => {
    const handleRefetch = () => {
      console.log("Received refetch event in Kanban board");
    };

    window.addEventListener("refetchCandidates", handleRefetch);

    return () => {
      window.removeEventListener("refetchCandidates", handleRefetch);
    };
  }, []);

  const handleEditStage = () => {
    if (editingStage && onStageUpdate) {
      onStageUpdate(editingStage);
      setIsEditStageDialogOpen(false);
      setEditingStage(null);
    }
  };

  // Handle column value change (when items are moved between columns or reordered)
  const handleColumnsChange = (newColumns: Record<string, Candidate[]>) => {
    console.log("Columns changed:", newColumns);
    
    // Find which candidate moved and to which stage
    Object.entries(newColumns).forEach(([stageId, stageCandidates]) => {
      const oldCandidates = columnData[stageId] || [];
      
      // Check if any new candidates were added to this stage
      stageCandidates.forEach((candidate) => {
        const wasInThisStage = oldCandidates.some(c => c.id === candidate.id);
        
        if (!wasInThisStage) {
          // This candidate was moved to this stage
          console.log(`Candidate ${candidate.id} moved to stage ${stageId}`);
          onStatusChange(candidate.id, stageId);
        }
      });
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-x-auto px-6 py-6">
        <Kanban.Root
          value={columnData}
          onValueChange={handleColumnsChange}
          getItemValue={(item) => item.id}
        >
          <Kanban.Board className="grid auto-rows-fr h-full" style={{
            gridTemplateColumns: `repeat(${stages.length}, minmax(320px, 1fr))`,
            gap: "12px"
          }}>
            {[...stages]
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <Kanban.Column key={stage.id || stage._id || `stage-${index}`} value={stage.id || stage._id} className="h-full flex flex-col">
                  {/* Column Header */}
                  <div className="px-3 py-2.5 border-b border-border shrink-0 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="font-semibold text-sm truncate">
                          {stage.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="pointer-events-none rounded-sm text-xs"
                        >
                          {getCandidatesForStage(stage.id).length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Kanban.ColumnHandle asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </Kanban.ColumnHandle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingStage(stage);
                                setIsEditStageDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Stage
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
                      {getCandidatesForStage(stage.id).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm text-center">
                          <User className="h-8 w-8 mb-3 opacity-50" />
                          <div className="font-medium">No candidates yet</div>
                          <div className="text-xs mt-1">
                            Drag candidates here to get started
                          </div>
                        </div>
                      ) : (
                        getCandidatesForStage(stage.id).map((candidate, idx) => (
                          <Kanban.Item
                            key={candidate.id || candidate._id || `candidate-${stage.id}-${idx}`}
                            value={candidate.id || candidate._id}
                            asHandle
                            asChild
                          >
                            <div
                              className="rounded-md border bg-card p-3 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => onCandidateClick(candidate)}
                            >
                              <div className="flex flex-col gap-2.5">
                                {/* Candidate Name */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-primary">
                                      {getCandidateInitials(candidate)}
                                    </span>
                                  </div>
                                  <span className="line-clamp-1 font-medium text-sm flex-1">
                                    {getCandidateName(candidate)}
                                  </span>
                                </div>

                                {/* Contact Info */}
                                {(candidate.email || candidate.phone) && (
                                  <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                                    {candidate.email && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{candidate.email}</span>
                                      </div>
                                    )}
                                    {candidate.phone && (
                                      <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>{candidate.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Applied Date */}
                                {candidate.createdAt && (
                                  <div className="flex items-center justify-between text-muted-foreground text-[10px] tabular-nums mt-0.5">
                                    <span>
                                      Applied:{" "}
                                      {new Date(candidate.createdAt).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Kanban.Item>
                        ))
                      )}
                    </div>
                </Kanban.Column>
              ))}
          </Kanban.Board>
          <Kanban.Overlay>
            <div className="size-full rounded-md bg-primary/10 backdrop-blur-sm" />
          </Kanban.Overlay>
        </Kanban.Root>
      </div>

      {/* Edit Stage Dialog */}
      <Dialog
        open={isEditStageDialogOpen}
        onOpenChange={setIsEditStageDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>
              Update the stage name and color
            </DialogDescription>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stage Name</Label>
                <Input
                  value={editingStage.name}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={editingStage.color}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        color: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    {editingStage.color}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
