import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Candidate } from "@/types";

interface SortableCandidateProps {
  candidate: Candidate;
}

export function SortableCandidate({ candidate }: SortableCandidateProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-card border border-border rounded-lg px-3 py-2.5
        hover:bg-accent/50 hover:border-accent-foreground/20 transition-all duration-200
        ${isDragging ? "opacity-50 shadow-xl ring-2 ring-primary" : "shadow-sm"}
      `}
      {...attributes}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag Handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Candidate Name */}
        <div className="font-medium text-sm text-card-foreground truncate min-w-0 flex-1">
          {candidate.firstName} {candidate.lastName}
        </div>

        {/* Email */}
        <div className="text-xs text-muted-foreground truncate min-w-0 flex-shrink max-w-[120px]">
          {candidate.email}
        </div>

        {/* Date */}
        <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {new Date(candidate.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}

// Separate component for drag overlay (no drag handle)
export function CandidateCard({ candidate }: SortableCandidateProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-xl ring-2 ring-primary w-80">
      <div className="flex items-center gap-3 min-w-0">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="font-medium text-sm text-card-foreground truncate min-w-0 flex-1">
          {candidate.firstName} {candidate.lastName}
        </div>
        <div className="text-xs text-muted-foreground truncate min-w-0 flex-shrink max-w-[120px]">
          {candidate.email}
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {new Date(candidate.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
