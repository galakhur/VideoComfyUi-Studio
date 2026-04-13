"use client";

import { Trash2, Star, FileJson, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isDefault: boolean;
  inputCount: number;
  outputCount: number;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  image_draft: { label: "Image", color: "text-blue-400" },
  image_refine: { label: "Refine", color: "text-purple-400" },
  video: { label: "Video", color: "text-green-400" },
};

export function WorkflowCard({
  id,
  name,
  description,
  category,
  isDefault,
  inputCount,
  outputCount,
  onDelete,
  onSetDefault,
  onEdit,
}: WorkflowCardProps) {
  const cat = CATEGORY_LABELS[category] || { label: category, color: "" };

  return (
    <Card className={cn("group transition-colors", isDefault && "border-purple-500/50")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
              <h4 className="truncate text-sm font-medium">{name}</h4>
              {isDefault && (
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", cat.color)}>
                {cat.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {inputCount} inputs / {outputCount} outputs
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSetDefault && !isDefault && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSetDefault(id)} title="Set as default">
                <Star className="h-3.5 w-3.5" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(id)} title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:text-destructive"
              onClick={() => onDelete(id)}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
