import { useState, useMemo } from "react";
import { usePipelines } from "@/store/hooks/usePipelines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Copy, Workflow, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import type { Pipeline, PipelineStage } from "@/types/pipeline";

interface PipelineFormData {
  name: string;
  description: string;
  stages: PipelineStage[];
}

const defaultStageColors = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
  "#22c55e", // green
];

const generateStageId = () => `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function PipelineTemplatesSettings() {
  const { pipelines, isLoading } = usePipelines();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [formData, setFormData] = useState<PipelineFormData>({
    name: "",
    description: "",
    stages: [],
  });
  const [newStageName, setNewStageName] = useState("");
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

  // Filter to show only template pipelines (no jobId)
  const templatePipelines = useMemo(() => {
    return pipelines.filter((p: Pipeline) => !p.jobId && p.isActive);
  }, [pipelines]);

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error("Pipeline name is required");
      return;
    }

    if (formData.stages.length === 0) {
      toast.error("At least one stage is required");
      return;
    }

    const loadingToast = toast.loading("Creating pipeline template...");

    try {
      const token = localStorage.getItem("ats_access_token");
      const response = await fetch(`${API_BASE_URL}/pipelines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: "custom",
          stages: formData.stages.map(({ name, description, order, color }) => ({
            name,
            description: description || "",
            order,
            color: color || "#3b82f6",
            isDefault: false,
            isActive: true,
          })),
          isActive: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create pipeline template");
      }

      toast.success("Pipeline template created successfully", { id: loadingToast });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error((error as Error).message, { id: loadingToast });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedPipeline || !formData.name.trim()) {
      toast.error("Pipeline name is required");
      return;
    }

    if (formData.stages.length === 0) {
      toast.error("At least one stage is required");
      return;
    }

    const loadingToast = toast.loading("Updating pipeline template...");

    try {
      const token = localStorage.getItem("ats_access_token");
      const response = await fetch(`${API_BASE_URL}/pipelines/${selectedPipeline.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          stages: formData.stages.map(({ name, description, order, color }) => ({
            name,
            description: description || "",
            order,
            color: color || "#3b82f6",
            isDefault: false,
            isActive: true,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update pipeline template");
      }

      toast.success("Pipeline template updated successfully", { id: loadingToast });
      setIsEditDialogOpen(false);
      setSelectedPipeline(null);
      resetForm();
    } catch (error) {
      toast.error((error as Error).message, { id: loadingToast });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedPipeline) return;

    const loadingToast = toast.loading("Deleting pipeline template...");

    try {
      const token = localStorage.getItem("ats_access_token");
      const response = await fetch(`${API_BASE_URL}/pipelines/${selectedPipeline.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete pipeline template");
      }

      toast.success("Pipeline template deleted successfully", { id: loadingToast });
      setIsDeleteDialogOpen(false);
      setSelectedPipeline(null);
    } catch (error) {
      toast.error((error as Error).message, { id: loadingToast });
    }
  };

  const handleDuplicateTemplate = (pipeline: Pipeline) => {
    setFormData({
      name: `${pipeline.name} (Copy)`,
      description: pipeline.description || "",
      stages: pipeline.stages.map((stage) => ({
        ...stage,
        id: generateStageId(), // Generate new IDs for stages
      })),
    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setFormData({
      name: pipeline.name,
      description: pipeline.description || "",
      stages: [...pipeline.stages],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setIsDeleteDialogOpen(true);
  };

  const addStage = () => {
    if (!newStageName.trim()) {
      toast.error("Stage name is required");
      return;
    }

    const newStage: PipelineStage = {
      id: generateStageId(),
      name: newStageName,
      description: "",
      color: defaultStageColors[formData.stages.length % defaultStageColors.length],
      order: formData.stages.length + 1,
    };

    setFormData({
      ...formData,
      stages: [...formData.stages, newStage],
    });
    setNewStageName("");
  };

  const removeStage = (stageId: string) => {
    const updatedStages = formData.stages
      .filter((s) => s.id !== stageId)
      .map((s, index) => ({ ...s, order: index + 1 }));
    setFormData({ ...formData, stages: updatedStages });
  };

  const updateStage = (stageId: string, field: keyof PipelineStage, value: string) => {
    setFormData({
      ...formData,
      stages: formData.stages.map((s) =>
        s.id === stageId ? { ...s, [field]: value } : s
      ),
    });
  };

  const handleDragStart = (stageId: string) => {
    setDraggedStageId(stageId);
  };

  const handleDragOver = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === targetStageId) return;

    const draggedIndex = formData.stages.findIndex((s) => s.id === draggedStageId);
    const targetIndex = formData.stages.findIndex((s) => s.id === targetStageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newStages = [...formData.stages];
    const [draggedStage] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, draggedStage);

    // Update order numbers
    const reorderedStages = newStages.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));

    setFormData({ ...formData, stages: reorderedStages });
  };

  const handleDragEnd = () => {
    setDraggedStageId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stages: [],
    });
    setNewStageName("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Pipeline Templates
              </CardTitle>
              <CardDescription className="mt-2">
                Create and manage reusable pipeline templates for your jobs
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Templates List */}
      {templatePipelines.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No pipeline templates yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templatePipelines.map((pipeline: Pipeline) => (
            <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{pipeline.name}</CardTitle>
                    {pipeline.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {pipeline.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stages */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {pipeline.stages.length} Stage{pipeline.stages.length !== 1 ? "s" : ""}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {pipeline.stages.slice(0, 4).map((stage: PipelineStage) => (
                      <Badge
                        key={stage.id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: stage.color,
                          color: stage.color,
                        }}
                      >
                        {stage.name}
                      </Badge>
                    ))}
                    {pipeline.stages.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{pipeline.stages.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(pipeline)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(pipeline)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(pipeline)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedPipeline(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Pipeline Template" : "Create Pipeline Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update the pipeline template details and stages"
                : "Create a reusable pipeline template for your hiring workflows"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Hiring Pipeline"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this pipeline template..."
                rows={3}
              />
            </div>

            {/* Stages */}
            <div className="space-y-3">
              <Label>
                Pipeline Stages <span className="text-red-500">*</span>
              </Label>

              {/* Existing Stages */}
              {formData.stages.length > 0 && (
                <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                  {formData.stages.map((stage) => (
                    <div
                      key={stage.id}
                      draggable
                      onDragStart={() => handleDragStart(stage.id)}
                      onDragOver={(e) => handleDragOver(e, stage.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 bg-background border rounded-lg p-2 transition-opacity ${
                        draggedStageId === stage.id ? "opacity-50" : ""
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-move" />
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={stage.name}
                            onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                            placeholder="Stage name"
                            className="h-8"
                          />
                          <Input
                            value={stage.description || ""}
                            onChange={(e) => updateStage(stage.id, "description", e.target.value)}
                            placeholder="Description (optional)"
                            className="h-8"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Color:</Label>
                          <input
                            type="color"
                            value={stage.color || "#3b82f6"}
                            onChange={(e) => updateStage(stage.id, "color", e.target.value)}
                            className="w-10 h-6 rounded border cursor-pointer"
                          />
                          <Input
                            value={stage.color || "#3b82f6"}
                            onChange={(e) => updateStage(stage.id, "color", e.target.value)}
                            placeholder="#3b82f6"
                            className="h-6 text-xs flex-1"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(stage.id)}
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Stage */}
              <div className="flex gap-2">
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Enter stage name..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStage();
                    }
                  }}
                />
                <Button onClick={addStage} variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedPipeline(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleUpdateTemplate : handleCreateTemplate}
            >
              {isEditDialogOpen ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pipeline Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPipeline?.name}"? This action cannot be
              undone. Jobs using this template will keep their existing pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPipeline(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
