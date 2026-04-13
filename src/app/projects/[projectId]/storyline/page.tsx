"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import type { ProjectStage, MuseControlLevel } from "@/lib/types";

interface Project {
  id: string;
  title: string;
  storyline: string | null;
  storylineConfirmed: boolean;
  currentStage: ProjectStage;
  museControlLevel: MuseControlLevel;
}

export default function StorylinePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [logline, setLogline] = useState("");
  const [plotOutline, setPlotOutline] = useState("");
  const [genre, setGenre] = useState("");
  const [themes, setThemes] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        if (data.storyline) {
          try {
            const parsed = JSON.parse(data.storyline);
            setLogline(parsed.logline || "");
            setPlotOutline(parsed.plotOutline || "");
            setGenre(parsed.genre || "");
            setThemes(Array.isArray(parsed.themes) ? parsed.themes.join(", ") : "");
          } catch {
            setPlotOutline(data.storyline);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSave = async () => {
    setSaving(true);
    const storyline = JSON.stringify({
      logline,
      plotOutline,
      genre,
      themes: themes.split(",").map((t) => t.trim()).filter(Boolean),
    });
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyline }),
    });
    setSaving(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setStreamedText("");
    try {
      const res = await fetch("/api/generate/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          provider: "openai",
          description: project?.title || "untitled",
          genre,
          themes: themes.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setStreamedText(`Error: ${err.error || "Generation failed"}`);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  accumulated += data.token;
                  setStreamedText(accumulated);
                }
                if (data.done && data.storyline) {
                  setLogline(data.storyline.logline || "");
                  setPlotOutline(data.storyline.plotOutline || "");
                  setGenre(data.storyline.genre || "");
                  setThemes(
                    Array.isArray(data.storyline.themes)
                      ? data.storyline.themes.join(", ")
                      : ""
                  );
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title={`${project.title} / Storyline`} stage={project.currentStage} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Storyline Editor</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generating ? "Generating..." : "AI Generate"}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Logline</Label>
              <Textarea
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="A one-sentence summary of your story..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>Plot Outline</Label>
              <Textarea
                value={plotOutline}
                onChange={(e) => setPlotOutline(e.target.value)}
                placeholder="The full plot outline..."
                rows={12}
              />
            </div>

            {streamedText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {streamedText}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Genre</Label>
                  <Input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Sci-Fi, Drama"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Themes</Label>
                  <Input
                    value={themes}
                    onChange={(e) => setThemes(e.target.value)}
                    placeholder="comma-separated themes"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={project.storylineConfirmed ? "default" : "secondary"}>
                      {project.storylineConfirmed ? "Confirmed" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
