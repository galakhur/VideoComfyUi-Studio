"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  type: string;
  muse: string;
  message: string;
  sceneId: string | null;
  actions: string;
  isRead: boolean;
}

interface MuseSuggestionPanelProps {
  projectId: string;
  museControlLevel: string;
}

const TYPE_COLORS: Record<string, string> = {
  CONSISTENCY: "text-yellow-400",
  ENHANCEMENT: "text-blue-400",
  VISUAL_STYLE: "text-purple-400",
  PACING: "text-green-400",
};

const MUSE_LABELS: Record<string, string> = {
  STORY_MUSE: "Story",
  VISUAL_MUSE: "Visual",
  MOTION_MUSE: "Motion",
};

export function MuseSuggestionPanel({
  projectId,
  museControlLevel,
}: MuseSuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (suggestionId: string, action: string) => {
    await fetch("/api/agent/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestionId, action }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  if (museControlLevel === "OBSERVER") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-purple-500/30 bg-card/95 backdrop-blur-sm">
        <div
          className="flex cursor-pointer items-center justify-between px-4 py-2 border-b border-border"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">Muse Suggestions</span>
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {suggestions.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              fetchSuggestions();
            }}
          >
            <Sparkles className={cn("h-3 w-3", loading && "animate-spin")} />
          </Button>
        </div>

        {expanded && (
          <ScrollArea className="max-h-72">
            <CardContent className="p-2">
              {suggestions.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {loading
                      ? "Generating suggestions..."
                      : "Click the sparkle to get AI suggestions"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s) => {
                    let actions: { label: string; type: string }[] = [];
                    try {
                      actions = JSON.parse(s.actions);
                    } catch { /* */ }

                    return (
                      <div
                        key={s.id}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {MUSE_LABELS[s.muse] || s.muse}
                          </Badge>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              TYPE_COLORS[s.type] || "text-foreground"
                            )}
                          >
                            {s.type}
                          </span>
                        </div>
                        <p className="text-xs text-foreground">{s.message}</p>
                        <div className="mt-2 flex gap-1">
                          {actions.map((a, i) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() =>
                                handleAction(s.id, a.type || "apply")
                              }
                            >
                              {a.type === "dismiss" ? (
                                <X className="mr-1 h-3 w-3" />
                              ) : a.type === "view" ? (
                                <Eye className="mr-1 h-3 w-3" />
                              ) : (
                                <Check className="mr-1 h-3 w-3" />
                              )}
                              {a.label}
                            </Button>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 text-xs text-muted-foreground"
                            onClick={() => handleAction(s.id, "dismiss")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
