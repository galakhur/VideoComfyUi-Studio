"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { SceneDetailSheet } from "@/components/kanban/SceneDetailSheet";
import { MuseSuggestionPanel } from "@/components/muse/MuseSuggestionPanel";
import type { ProjectStage, MuseControlLevel } from "@/lib/types";

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  heading: string;
  description: string;
  dialogue: string | null;
  technicalNotes: string | null;
  notes: string | null;
  status: string;
  videoUrl: string | null;
  keyframes: { id: string; draftImageUrl: string | null; finalImageUrl: string | null }[];
}

interface Project {
  id: string;
  title: string;
  currentStage: ProjectStage;
  museControlLevel: MuseControlLevel;
  scenes: Scene[];
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSceneClick = (sceneId: string) => {
    const scene = project?.scenes.find((s) => s.id === sceneId);
    if (scene) {
      setSelectedScene(scene);
      setSheetOpen(true);
    }
  };

  const handleStatusChange = async (sceneId: string, newStatus: string) => {
    await fetch(`/api/scenes/${sceneId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProject();
  };

  const handleSceneSave = async (sceneId: string, data: Partial<Scene>) => {
    await fetch(`/api/scenes/${sceneId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSheetOpen(false);
    fetchProject();
  };

  const handleSceneDelete = async (sceneId: string) => {
    if (!confirm("Delete this scene?")) return;
    await fetch(`/api/scenes/${sceneId}`, { method: "DELETE" });
    setSheetOpen(false);
    fetchProject();
  };

  const handleAddScene = async () => {
    if (!newTitle.trim()) return;
    const nextNumber = (project?.scenes.length ?? 0) + 1;
    await fetch("/api/scenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title: newTitle.trim(),
        sceneNumber: nextNumber,
        description: newDescription.trim(),
      }),
    });
    setNewTitle("");
    setNewDescription("");
    setAddDialogOpen(false);
    fetchProject();
  };

  const handleMuseControlChange = async (level: MuseControlLevel) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ museControlLevel: level }),
    });
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Project not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={project.title}
        stage={project.currentStage}
        museControlLevel={project.museControlLevel}
        onMuseControlChange={handleMuseControlChange}
      />

      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="text-sm text-muted-foreground">
          {project.scenes.length} scenes
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Scene
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          scenes={project.scenes}
          onSceneClick={handleSceneClick}
          onStatusChange={handleStatusChange}
        />
      </div>

      <SceneDetailSheet
        scene={selectedScene}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSceneSave}
        onDelete={handleSceneDelete}
      />

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Scene</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Scene title"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Scene description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddScene} disabled={!newTitle.trim()}>
              Add Scene
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MuseSuggestionPanel
        projectId={projectId}
        museControlLevel={project.museControlLevel}
      />
    </div>
  );
}
