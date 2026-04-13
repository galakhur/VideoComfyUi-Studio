"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  id: string;
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ id, label, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-card/50 transition-colors",
        isOver && "border-purple-500/50 bg-purple-500/5"
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-2 min-h-[200px]">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
