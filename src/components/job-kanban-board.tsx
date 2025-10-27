import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useSidebar } from "@/components/ui/sidebar";
import type { Candidate } from "@/types/candidate";
import type { Pipeline, PipelineStage } from "@/types/pipeline";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Edit, MoreHorizontal, Plus, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DroppableArea } from "./droppable-area";
import { CandidateCard, SortableCandidate } from "./sortable-candidate";

interface JobKanbanBoardProps {
  pipeline: Pipeline;
  jobId: string; // Job ID for filtering applications
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onStatusChange: (candidateId: string, newStageId: string) => void;
  onStageUpdate?: (stage: PipelineStage) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function JobKanbanBoard({
  pipeline,
  jobId,
  candidates,
  onCandidateClick,
  onStatusChange,
  onStageUpdate,
}: JobKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [containerMaxWidth, setContainerMaxWidth] = useState<number>(0);

  const { state: sidebarState } = useSidebar();

  // Calculate container width when sidebar state changes
  useEffect(() => {
    const calculateMaxWidth = () => {
      const viewportWidth = window.innerWidth;
      // Use the gap element which actually changes width, not the sidebar itself
      const sidebarGapElement = document.querySelector('[data-slot="sidebar-gap"]');
      const sidebarWidth = sidebarGapElement?.getBoundingClientRect().width || 0;
      
      console.log('🔍 Width Calculation:', {
        sidebarState,
        viewportWidth,
        sidebarWidth,
        containerMaxWidth: viewportWidth - sidebarWidth
      });
      
      setContainerMaxWidth(viewportWidth - sidebarWidth);
    };

    const sidebarGapElement = document.querySelector('[data-slot="sidebar-gap"]');
    
    // Listen for transition end on the sidebar gap
    const handleTransitionEnd = () => {
      calculateMaxWidth();
    };
    
    if (sidebarGapElement) {
      sidebarGapElement.addEventListener('transitionend', handleTransitionEnd);
    }
    
    // Also calculate immediately (in case no transition)
    calculateMaxWidth();
    
    // Also recalculate on window resize
    window.addEventListener("resize", calculateMaxWidth);

    return () => {
      if (sidebarGapElement) {
        sidebarGapElement.removeEventListener('transitionend', handleTransitionEnd);
      }
      window.removeEventListener("resize", calculateMaxWidth);
    };
  }, [sidebarState]);

  // Calculate column widths
  const columnWidths = useMemo(() => {
    const minColumnWidth = 300;
    const maxColumnWidth = 400;
    const availableWidth = containerMaxWidth > 0 ? containerMaxWidth : window.innerWidth;
    
    const stageCount = pipeline.stages.length;
    const containerPadding = 48; // px-6
    const wrapperPadding = 16; // p-2
    const columnGap = 12; // gap-3
    const borderWidth = 2; // 1px each side
    const scrollBuffer = 2;
    
    const totalGaps = columnGap * (stageCount - 1);
    const totalBorders = borderWidth * stageCount;
    const totalPadding = containerPadding + wrapperPadding;
    
    const availableForStages = availableWidth - totalPadding - totalGaps - totalBorders - scrollBuffer;
    const idealWidth = Math.floor(availableForStages / stageCount);
    
    let columnWidth;
    if (idealWidth >= minColumnWidth && idealWidth <= maxColumnWidth) {
      columnWidth = idealWidth;
    } else if (idealWidth > maxColumnWidth) {
      columnWidth = maxColumnWidth;
    } else {
      columnWidth = minColumnWidth;
    }
    
    return pipeline.stages.map(() => columnWidth);
  }, [pipeline.stages, containerMaxWidth]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
    useSensor(KeyboardSensor)
  );

  // Group candidates by stage
  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};

    pipeline.stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    candidates.forEach((candidate) => {
      const jobApplication = candidate.jobApplications.find(
        (app) => app.jobId === jobId
      );

      if (jobApplication?.currentStage) {
        const stageId = jobApplication.currentStage;
        if (grouped[stageId]) {
          grouped[stageId].push(candidate);
        }
      } else {
        const firstStage = pipeline.stages[0];
        if (firstStage) {
          grouped[firstStage.id].push(candidate);
        }
      }
    });

    return grouped;
  }, [candidates, pipeline, jobId]);

  const getCandidatesForStage = useCallback(
    (stageId: string) => candidatesByStage[stageId] || [],
    [candidatesByStage]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const candidateId = active.id as string;
    const newStageId = over.id as string;
    const currentCandidate = candidates.find((c) => c.id === candidateId);
    
    if (currentCandidate) {
      const currentApp = currentCandidate.jobApplications.find(
        (app) => app.jobId === jobId
      );

      if (currentApp?.currentStage !== newStageId) {
        onStatusChange(candidateId, newStageId);
      }
    }

    setActiveId(null);
  };

  const handleEditStage = () => {
    if (editingStage && onStageUpdate) {
      onStageUpdate(editingStage);
      setIsEditStageDialogOpen(false);
      setEditingStage(null);
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{
        maxWidth: containerMaxWidth > 0 ? `${containerMaxWidth}px` : undefined,
      }}
    >
      <div className="flex-shrink-0 px-6 pt-6 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">{pipeline.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Drag and drop candidates between stages to update their status
            </p>
          </div>
          <Button size="sm" variant="default" className="flex-shrink-0">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Candidate
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto px-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex gap-3 p-2">
            {[...pipeline.stages]
              .sort((a, b) => a.order - b.order)
              .map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 h-full"
                  style={{ width: `${columnWidths[index]}px` }}
                >
                  <div className="bg-card rounded-lg border border-border shadow-sm h-full flex flex-col">
                    <div className="px-2 py-1.5 border-b border-border flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: stage.color }}
                          />
                          <h3 className="font-medium text-sm text-card-foreground truncate">
                            {stage.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted border-border text-muted-foreground flex-shrink-0"
                          >
                            {getCandidatesForStage(stage.id).length}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-accent flex-shrink-0"
                            >
                              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
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

                    <SortableContext
                      items={getCandidatesForStage(stage.id).map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                      id={stage.id}
                    >
                      <DroppableArea id={stage.id}>
                        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                          {getCandidatesForStage(stage.id).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm text-center">
                              <User className="h-8 w-8 mb-3 opacity-50" />
                              <div className="font-medium">
                                No candidates yet
                              </div>
                              <div className="text-xs mt-1">
                                Drag candidates here to get started
                              </div>
                            </div>
                          ) : (
                            getCandidatesForStage(stage.id).map((candidate) => (
                              <div
                                key={candidate.id}
                                onClick={() => onCandidateClick(candidate)}
                                className="cursor-pointer"
                              >
                                <SortableCandidate candidate={candidate} />
                              </div>
                            ))
                          )}
                        </div>
                      </DroppableArea>
                    </SortableContext>
                  </div>
                </div>
              ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <CandidateCard
                candidate={candidates.find((c) => c.id === activeId)!}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

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
