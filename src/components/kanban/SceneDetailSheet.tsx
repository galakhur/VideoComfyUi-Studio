"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { GenerationPanel } from "@/components/media/GenerationPanel";

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
}

interface SceneDetailSheetProps {
  scene: Scene | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sceneId: string, data: Partial<Scene>) => void;
  onDelete: (sceneId: string) => void;
}

export function SceneDetailSheet({
  scene,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: SceneDetailSheetProps) {
  const [form, setForm] = useState({
    title: "",
    heading: "",
    description: "",
    dialogue: "",
    technicalNotes: "",
    notes: "",
    status: "SCRIPT",
  });

  useEffect(() => {
    if (scene) {
      setForm({
        title: scene.title,
        heading: scene.heading,
        description: scene.description,
        dialogue: scene.dialogue || "",
        technicalNotes: scene.technicalNotes || "",
        notes: scene.notes || "",
        status: scene.status,
      });
    }
  }, [scene]);

  if (!scene) return null;

  const handleSave = () => {
    onSave(scene.id, {
      title: form.title,
      heading: form.heading,
      description: form.description,
      dialogue: form.dialogue || null,
      technicalNotes: form.technicalNotes || null,
      notes: form.notes || null,
      status: form.status,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Scene {scene.sceneNumber}</SheetTitle>
          <SheetDescription>Edit scene details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => val && setForm({ ...form, status: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KANBAN_COLUMNS.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Heading</Label>
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              placeholder="Scene heading / location"
            />
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Visual description of the scene..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Dialogue</Label>
            <Textarea
              value={form.dialogue}
              onChange={(e) => setForm({ ...form, dialogue: e.target.value })}
              rows={4}
              placeholder="Character dialogue..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Technical Notes</Label>
            <Textarea
              value={form.technicalNotes}
              onChange={(e) =>
                setForm({ ...form, technicalNotes: e.target.value })
              }
              rows={2}
              placeholder="Camera angles, lighting, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          {/* Generation Panel */}
          <GenerationPanel
            sceneId={scene.id}
            sceneDescription={form.description}
          />

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(scene.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
