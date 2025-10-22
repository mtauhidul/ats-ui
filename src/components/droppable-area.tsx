import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

interface DroppableAreaProps {
  id: string;
  children: ReactNode;
}

export function DroppableArea({ id, children }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-0 rounded-lg transition-colors duration-200
        ${isOver ? "bg-accent/50" : ""}
      `}
    >
      {children}
    </div>
  );
}
