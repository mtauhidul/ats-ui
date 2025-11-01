import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/types/pipeline";
import { Check, GripVertical, Palette, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PipelineBuilderProps {
  initialStages?: PipelineStage[];
  onSave: (stages: PipelineStage[]) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#10b981", // emerald
  "#22c55e", // green
  "#ec4899", // pink
  "#ef4444", // red
  "#94a3b8", // gray
];

const PRESET_ICONS = [
  "📥",
  "🔍",
  "💬",
  "📝",
  "✓",
  "🎁",
  "🎉",
  "💻",
  "📞",
  "👥",
  "⭐",
  "🔧",
  "📊",
  "👔",
];

export function PipelineBuilder({
  initialStages = [],
  onSave,
  onCancel,
}: PipelineBuilderProps) {
  const [stages, setStages] = useState<PipelineStage[]>(
    initialStages.length > 0
      ? initialStages
      : [
          {
            id: Date.now().toString(),
            name: "",
            description: "",
            color: PRESET_COLORS[0],
            icon: "📥",
            order: 1,
          },
        ]
  );
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

  const addStage = () => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: "",
      description: "",
      color: PRESET_COLORS[stages.length % PRESET_COLORS.length],
      icon: PRESET_ICONS[stages.length % PRESET_ICONS.length],
      order: stages.length + 1,
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (id: string) => {
    const filtered = stages.filter((s) => s.id !== id);
    setStages(filtered.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const updateStage = (id: string, updates: Partial<PipelineStage>) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDragStart = (id: string) => {
    setDraggedStageId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === targetId) return;

    const draggedIndex = stages.findIndex((s) => s.id === draggedStageId);
    const targetIndex = stages.findIndex((s) => s.id === targetId);

    const newStages = [...stages];
    const [removed] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, removed);

    setStages(newStages.map((s, idx) => ({ ...s, order: idx + 1 })));
    setDraggedStageId(null);
  };

  const handleSave = () => {
    const validStages = stages.filter((s) => s.name.trim() !== "");
    if (validStages.length === 0) {
      toast.error("Please add at least one stage with a name");
      return;
    }
    onSave(validStages);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pipeline Stages</h3>
            <p className="text-sm text-muted-foreground">
              Create and organize your hiring workflow stages
            </p>
          </div>
          <Button onClick={addStage} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stages.map((stage, index) => (
            <Card
              key={stage.id}
              draggable
              onDragStart={() => handleDragStart(stage.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={cn(
                "cursor-move hover:shadow-md transition-all",
                draggedStageId === stage.id && "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeStage(stage.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Stage Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${stage.id}`} className="text-xs">
                      Stage Name *
                    </Label>
                    <Input
                      id={`name-${stage.id}`}
                      placeholder="e.g., Initial Screening"
                      value={stage.name}
                      onChange={(e) =>
                        updateStage(stage.id, { name: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`desc-${stage.id}`} className="text-xs">
                      Description
                    </Label>
                    <Input
                      id={`desc-${stage.id}`}
                      placeholder="Optional description"
                      value={stage.description}
                      onChange={(e) =>
                        updateStage(stage.id, { description: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Icon</Label>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_ICONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => updateStage(stage.id, { icon })}
                          className={cn(
                            "w-8 h-8 rounded border flex items-center justify-center text-sm hover:bg-muted transition-colors",
                            stage.icon === icon &&
                              "border-primary bg-primary/10"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Color
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateStage(stage.id, { color })}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            stage.color === color
                              ? "border-foreground scale-110"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="pt-2 border-t">
                    <div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-2" />
          Save Pipeline
        </Button>
      </div>
    </div>
  );
}
