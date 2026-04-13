"use client";

import { useState, useCallback } from "react";
import { Upload, FileJson, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseComfyWorkflow, type ComfyParseResult } from "@/lib/media/comfy-parser";
import { cn } from "@/lib/utils";

interface WorkflowUploaderProps {
  onSave: (data: {
    name: string;
    description?: string;
    category: string;
    workflowJson: string;
    inputMapping?: string;
  }) => Promise<unknown>;
}

export function WorkflowUploader({ onSave }: WorkflowUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ComfyParseResult | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("image_draft");
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawJson(text);
      try {
        const json = JSON.parse(text);
        const result = parseComfyWorkflow(json);
        setParseResult(result);
        setName(file.name.replace(".json", ""));
      } catch {
        setParseResult({
          inputs: [],
          outputs: [],
          nodeCount: 0,
          isValid: false,
          errors: ["Invalid JSON file"],
        });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSave = async () => {
    if (!rawJson || !name.trim() || !parseResult?.isValid) return;
    setSaving(true);
    try {
      const inputMapping = JSON.stringify(
        parseResult.inputs.map((inp) => ({
          nodeId: inp.nodeId,
          title: inp.title,
          kind: inp.kind,
          fieldName: inp.fieldName,
        }))
      );
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        workflowJson: rawJson,
        inputMapping,
      });
      // Reset
      setRawJson(null);
      setParseResult(null);
      setName("");
      setDescription("");
      setFileName("");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setRawJson(null);
    setParseResult(null);
    setName("");
    setDescription("");
    setFileName("");
  };

  if (!rawJson) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          dragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-border hover:border-muted-foreground"
        )}
        onClick={() => document.getElementById("workflow-file-input")?.click()}
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop ComfyUI workflow JSON here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse files
        </p>
        <input
          id="workflow-file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileJson className="h-4 w-4" />
            {fileName}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parse results */}
        {parseResult && (
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              {parseResult.isValid ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs font-medium">
                {parseResult.nodeCount} nodes | {parseResult.inputs.length} inputs |{" "}
                {parseResult.outputs.length} outputs
              </span>
            </div>

            {parseResult.inputs.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Inputs:</p>
                <div className="flex flex-wrap gap-1">
                  {parseResult.inputs.map((inp) => (
                    <Badge key={inp.nodeId} variant="outline" className="text-xs">
                      {inp.title} ({inp.kind})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parseResult.outputs.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Outputs:</p>
                <div className="flex flex-wrap gap-1">
                  {parseResult.outputs.map((out) => (
                    <Badge key={out.nodeId} variant="secondary" className="text-xs">
                      {out.title} ({out.kind})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parseResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-400">
                {parseResult.errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save form */}
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image_draft">Image (Keyframe)</SelectItem>
                <SelectItem value="image_refine">Image (Refine)</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!name.trim() || !parseResult?.isValid || saving}
          className="w-full"
        >
          {saving ? "Saving..." : "Save to Library"}
        </Button>
      </CardContent>
    </Card>
  );
}
