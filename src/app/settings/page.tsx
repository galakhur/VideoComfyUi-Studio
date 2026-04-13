"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { WorkflowUploader } from "@/components/media/WorkflowUploader";
import { WorkflowLibrary } from "@/components/media/WorkflowLibrary";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useOllamaModels } from "@/hooks/useOllamaModels";

export default function SettingsPage() {
  // Ollama
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.1");
  const { models: ollamaModels, testResult: ollamaTest, testConnection: testOllama, fetchModels } = useOllamaModels();
  const [testingOllama, setTestingOllama] = useState(false);

  // Claude
  const [anthropicKey, setAnthropicKey] = useState("");

  // ComfyUI
  const [comfyUrl, setComfyUrl] = useState("http://127.0.0.1:8188");
  const [comfyTest, setComfyTest] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [testingComfy, setTestingComfy] = useState(false);

  // Video APIs
  const [klingKey, setKlingKey] = useState("");
  const [runwayKey, setRunwayKey] = useState("");
  const [seedDanceKey, setSeedDanceKey] = useState("");

  // Inference
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);

  // Workflows
  const { workflows, createWorkflow, deleteWorkflow, updateWorkflow } = useWorkflows();

  // Save state
  const [saved, setSaved] = useState(false);

  // Load models on mount
  useEffect(() => {
    fetchModels(ollamaUrl);
  }, []);

  const handleTestOllama = async () => {
    setTestingOllama(true);
    await testOllama(ollamaUrl, ollamaModel);
    setTestingOllama(false);
  };

  const handleTestComfy = async () => {
    setTestingComfy(true);
    setComfyTest(null);
    try {
      const res = await fetch("/api/comfy-workflow/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: comfyUrl }),
      });
      const data = await res.json();
      setComfyTest(data);
    } catch {
      setComfyTest({ ok: false, message: "Network error" });
    } finally {
      setTestingComfy(false);
    }
  };

  const handleSave = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ollama_base_url: ollamaUrl,
        ollama_model: ollamaModel,
        comfyui_base_url: comfyUrl,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    await deleteWorkflow(id);
  };

  const handleSetDefault = async (id: string) => {
    // Unset current defaults in same category
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    for (const w of workflows.filter((w2) => w2.category === wf.category && w2.isDefault)) {
      await updateWorkflow(w.id, { isDefault: false } as Record<string, unknown>);
    }
    await updateWorkflow(id, { isDefault: true } as Record<string, unknown>);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure providers, workflows, and generation settings
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Tabs defaultValue="llm">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="comfyui">ComfyUI</TabsTrigger>
            <TabsTrigger value="video">Video APIs</TabsTrigger>
            <TabsTrigger value="inference">Inference</TabsTrigger>
          </TabsList>

          {/* ========== LLM TAB ========== */}
          <TabsContent value="llm" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Ollama (Local)</CardTitle>
                    <CardDescription>Local LLM inference — no API key needed</CardDescription>
                  </div>
                  {ollamaTest && (
                    <Badge variant={ollamaTest.ok ? "default" : "destructive"} className="gap-1">
                      {ollamaTest.ok ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {ollamaTest.ok ? `${ollamaTest.latencyMs}ms` : "Offline"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Base URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleTestOllama}
                      disabled={testingOllama}
                    >
                      {testingOllama ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wifi className="mr-2 h-4 w-4" />
                      )}
                      Test
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={ollamaModel} onValueChange={(v) => v && setOllamaModel(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ollamaModels.length > 0 ? (
                        ollamaModels.map((m) => (
                          <SelectItem key={m.name} value={m.name}>
                            {m.name} ({m.size})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={ollamaModel}>{ollamaModel}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {ollamaModels.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Click Test to load available models from Ollama
                    </p>
                  )}
                </div>

                {ollamaTest?.modelStatus && (
                  <p className={`text-xs ${ollamaTest.ok ? "text-green-400" : "text-yellow-400"}`}>
                    {ollamaTest.modelStatus}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Anthropic (Claude)</CardTitle>
                <CardDescription>Cloud API — requires API key</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  Set via ANTHROPIC_API_KEY in .env.local
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== COMFYUI TAB ========== */}
          <TabsContent value="comfyui" className="space-y-4">
            {/* Connection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">ComfyUI Connection</CardTitle>
                    <CardDescription>Connect to your local ComfyUI instance</CardDescription>
                  </div>
                  {comfyTest && (
                    <Badge variant={comfyTest.ok ? "default" : "destructive"} className="gap-1">
                      {comfyTest.ok ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {comfyTest.ok ? `${comfyTest.latencyMs}ms` : "Offline"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={comfyUrl}
                    onChange={(e) => setComfyUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8188"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleTestComfy} disabled={testingComfy}>
                    {testingComfy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="mr-2 h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
                {comfyTest && !comfyTest.ok && (
                  <p className="text-xs text-red-400">{comfyTest.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Upload Workflow */}
            <div>
              <h3 className="text-sm font-medium mb-3">Upload Workflow</h3>
              <WorkflowUploader onSave={createWorkflow} />
            </div>

            <Separator />

            {/* Workflow Library */}
            <WorkflowLibrary
              workflows={workflows}
              onDelete={handleDeleteWorkflow}
              onSetDefault={handleSetDefault}
            />
          </TabsContent>

          {/* ========== VIDEO APIS TAB ========== */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input type="password" value={klingKey} onChange={(e) => setKlingKey(e.target.value)} placeholder="API key..." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Runway</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input type="password" value={runwayKey} onChange={(e) => setRunwayKey(e.target.value)} placeholder="API key..." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SeedDance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input type="password" value={seedDanceKey} onChange={(e) => setSeedDanceKey(e.target.value)} placeholder="API key..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== INFERENCE TAB ========== */}
          <TabsContent value="inference">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inference Settings</CardTitle>
                <CardDescription>Default parameters for AI generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Temperature</Label>
                    <span className="text-sm text-muted-foreground">{temperature}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(v) => setTemperature(Array.isArray(v) ? v[0] : v)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Max Tokens</Label>
                    <span className="text-sm text-muted-foreground">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={(v) => setMaxTokens(Array.isArray(v) ? v[0] : v)}
                    min={256}
                    max={16384}
                    step={256}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
