"use client";

import { BookOpen, FileText, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStage, MuseControlLevel } from "@/lib/types";

const STAGES: { id: ProjectStage; label: string; icon: React.ElementType }[] = [
  { id: "STORYLINE", label: "Storyline", icon: BookOpen },
  { id: "SCRIPT", label: "Script", icon: FileText },
  { id: "KEYFRAME_VIDEO", label: "Production", icon: Film },
];

const CONTROL_LEVELS: { id: MuseControlLevel; label: string }[] = [
  { id: "OBSERVER", label: "Observer" },
  { id: "ASSISTANT", label: "Assistant" },
  { id: "COLLABORATOR", label: "Collaborator" },
];

interface HeaderProps {
  title?: string;
  stage?: ProjectStage;
  museControlLevel?: MuseControlLevel;
  onMuseControlChange?: (level: MuseControlLevel) => void;
}

export function Header({
  title,
  stage,
  museControlLevel,
  onMuseControlChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        )}
        {stage && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {STAGES.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === stage;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {museControlLevel && onMuseControlChange && (
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {CONTROL_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => onMuseControlChange(level.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                museControlLevel === level.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
