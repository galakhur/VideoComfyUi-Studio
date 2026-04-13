"use client";

import { useState } from "react";
import { FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkflowCard } from "./WorkflowCard";
import { parseComfyWorkflow } from "@/lib/media/comfy-parser";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  workflowJson: string;
  inputMapping: string | null;
  isDefault: boolean;
}

interface WorkflowLibraryProps {
  workflows: Workflow[];
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "image_draft", label: "Image" },
  { id: "image_refine", label: "Refine" },
  { id: "video", label: "Video" },
];

export function WorkflowLibrary({
  workflows,
  onDelete,
  onSetDefault,
}: WorkflowLibraryProps) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? workflows
      : workflows.filter((w) => w.category === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-medium">Workflow Library</h3>
        <Badge variant="secondary" className="text-xs">
          {workflows.length}
        </Badge>
      </div>

      <div className="flex gap-1 mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === cat.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
          <FileJson className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            No workflows yet. Upload a ComfyUI workflow JSON above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => {
            let inputCount = 0;
            let outputCount = 0;
            try {
              if (w.inputMapping) {
                inputCount = JSON.parse(w.inputMapping).length;
              }
              const parsed = parseComfyWorkflow(JSON.parse(w.workflowJson));
              outputCount = parsed.outputs.length;
              if (!w.inputMapping) inputCount = parsed.inputs.length;
            } catch { /* */ }

            return (
              <WorkflowCard
                key={w.id}
                id={w.id}
                name={w.name}
                description={w.description}
                category={w.category}
                isDefault={w.isDefault}
                inputCount={inputCount}
                outputCount={outputCount}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
