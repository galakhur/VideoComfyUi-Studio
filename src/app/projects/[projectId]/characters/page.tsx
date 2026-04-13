"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";

interface Character {
  id: string;
  name: string;
  shortBio: string | null;
  designNotes: string | null;
  primaryRole: string | null;
  tags: string;
  images: { id: string; url: string; kind: string }[];
}

interface Project {
  id: string;
  title: string;
  currentStage: string;
  characters: Character[];
}

export default function CharactersPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) setProject(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        name: name.trim(),
        shortBio: shortBio.trim() || undefined,
        primaryRole: primaryRole.trim() || undefined,
      }),
    });
    setName("");
    setShortBio("");
    setPrimaryRole("");
    setDialogOpen(false);
    fetchProject();
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm("Delete this character?")) return;
    await fetch(`/api/characters/${characterId}`, { method: "DELETE" });
    fetchProject();
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
      <Header title={`${project.title} / Characters`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Characters</h2>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Character
          </Button>
        </div>

        {project.characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No characters yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.characters.map((char) => {
              let tags: string[] = [];
              try { tags = JSON.parse(char.tags); } catch { /* */ }
              return (
                <Card key={char.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{char.name}</CardTitle>
                      <button onClick={() => handleDelete(char.id)} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {char.primaryRole && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {char.primaryRole}
                      </Badge>
                    )}
                    {char.shortBio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {char.shortBio}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Character</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Input value={primaryRole} onChange={(e) => setPrimaryRole(e.target.value)} placeholder="e.g. Protagonist, Villain" />
            </div>
            <div className="grid gap-2">
              <Label>Short Bio</Label>
              <Textarea value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="Brief character description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!name.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
