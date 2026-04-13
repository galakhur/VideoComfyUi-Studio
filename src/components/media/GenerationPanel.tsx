"use client";

import { useState, useEffect } from "react";
import { Wand2, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkflows } from "@/hooks/useWorkflows";
import { parseComfyWorkflow, type ComfyInput } from "@/lib/media/comfy-parser";

interface GenerationPanelProps {
  sceneId: string;
  sceneDescription: string;
}

export function GenerationPanel({ sceneId, sceneDescription }: GenerationPanelProps) {
  const { workflows: imageWorkflows } = useWorkflows("image_draft");
  const { workflows: videoWorkflows } = useWorkflows("video");
  const [selectedImageWf, setSelectedImageWf] = useState<string | null>(null);
  const [selectedVideoWf, setSelectedVideoWf] = useState<string | null>(null);
  const [imageInputs, setImageInputs] = useState<ComfyInput[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string | number>>({});
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);

  // Parse inputs when workflow selected
  useEffect(() => {
    if (!selectedImageWf) {
      setImageInputs([]);
      return;
    }
    const wf = imageWorkflows.find((w) => w.id === selectedImageWf);
    if (!wf) return;
    try {
      const parsed = parseComfyWorkflow(JSON.parse(wf.workflowJson));
      setImageInputs(parsed.inputs);
      // Pre-fill text inputs with scene description
      const defaults: Record<string, string | number> = {};
      for (const inp of parsed.inputs) {
        if ((inp.kind === "text" || inp.kind === "textarea") && sceneDescription) {
          defaults[inp.nodeId] = sceneDescription;
        } else if (inp.defaultValue !== undefined) {
          defaults[inp.nodeId] = inp.defaultValue;
        }
      }
      setInputValues(defaults);
    } catch { /* */ }
  }, [selectedImageWf, imageWorkflows, sceneDescription]);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setJobStatus(job.status);
          setJobProgress(job.progress * 100);
          if (job.status === "COMPLETED" || job.status === "FAILED") {
            clearInterval(interval);
            setGenerating(false);
          }
        }
      } catch { /* */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  const handleGenerateImage = async () => {
    if (!selectedImageWf) return;
    setGenerating(true);
    setJobStatus("QUEUED");
    setJobProgress(0);

    try {
      const params: Record<string, unknown> = {};
      for (const inp of imageInputs) {
        if (inputValues[inp.nodeId] !== undefined) {
          params[inp.nodeId] = inputValues[inp.nodeId];
        }
      }

      const res = await fetch("/api/generate/image-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          workflowId: selectedImageWf,
          params,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJobId(data.jobId);
      } else {
        const err = await res.json();
        setJobStatus("FAILED");
        setGenerating(false);
        alert(err.error || "Generation failed");
      }
    } catch {
      setGenerating(false);
      setJobStatus("FAILED");
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedVideoWf) return;
    alert("Video generation will use the selected workflow. Connect ComfyUI first.");
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-purple-400" />
        Generation
      </h4>

      {/* Image Workflow */}
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label className="text-xs">Image Workflow</Label>
          <Select
            value={selectedImageWf || ""}
            onValueChange={(v) => v && setSelectedImageWf(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select workflow..." />
            </SelectTrigger>
            <SelectContent>
              {imageWorkflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id}>
                  {wf.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic inputs */}
        {imageInputs.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Workflow Inputs</p>
            {imageInputs.map((inp) => (
              <div key={inp.nodeId} className="grid gap-1">
                <Label className="text-xs">{inp.title}</Label>
                {inp.kind === "textarea" ? (
                  <Textarea
                    value={String(inputValues[inp.nodeId] || "")}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, [inp.nodeId]: e.target.value })
                    }
                    rows={2}
                    className="text-xs"
                  />
                ) : inp.kind === "number" ? (
                  <Input
                    type="number"
                    value={inputValues[inp.nodeId] ?? ""}
                    onChange={(e) =>
                      setInputValues({
                        ...inputValues,
                        [inp.nodeId]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="text-xs"
                  />
                ) : (
                  <Input
                    value={String(inputValues[inp.nodeId] || "")}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, [inp.nodeId]: e.target.value })
                    }
                    className="text-xs"
                    placeholder={inp.kind === "image" ? "Image path or URL" : ""}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Generate button + status */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleGenerateImage}
            disabled={!selectedImageWf || generating}
            className="flex-1"
          >
            {generating ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-3 w-3" />
            )}
            Generate Keyframe
          </Button>
          {jobStatus && (
            <Badge
              variant={
                jobStatus === "COMPLETED"
                  ? "default"
                  : jobStatus === "FAILED"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {jobStatus}
            </Badge>
          )}
        </div>
        {generating && <Progress value={jobProgress} className="h-1" />}
      </div>

      {/* Video Workflow */}
      <div className="grid gap-1.5">
        <Label className="text-xs">Video Workflow</Label>
        <div className="flex gap-2">
          <Select
            value={selectedVideoWf || ""}
            onValueChange={(v) => v && setSelectedVideoWf(v)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select video workflow..." />
            </SelectTrigger>
            <SelectContent>
              {videoWorkflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id}>
                  {wf.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateVideo}
            disabled={!selectedVideoWf}
          >
            <Film className="mr-1 h-3 w-3" />
            Video
          </Button>
        </div>
      </div>
    </div>
  );
}
