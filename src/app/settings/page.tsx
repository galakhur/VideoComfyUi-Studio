"use client";

import { useState } from "react";
import { Settings, Save, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [comfyUrl, setComfyUrl] = useState("http://127.0.0.1:8188");
  const [klingKey, setKlingKey] = useState("");
  const [runwayKey, setRunwayKey] = useState("");
  const [seedDanceKey, setSeedDanceKey] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure API keys, providers, and generation settings
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Tabs defaultValue="llm">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="llm">LLM Providers</TabsTrigger>
            <TabsTrigger value="comfyui">ComfyUI</TabsTrigger>
            <TabsTrigger value="video">Video APIs</TabsTrigger>
            <TabsTrigger value="inference">Inference</TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">OpenAI</CardTitle>
                <CardDescription>GPT-4o and DALL-E integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  Set via OPENAI_API_KEY in .env.local
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Anthropic (Claude)</CardTitle>
                <CardDescription>Claude Sonnet/Opus integration</CardDescription>
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

          <TabsContent value="comfyui">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ComfyUI Connection</CardTitle>
                <CardDescription>
                  Connect to your local ComfyUI instance for image generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label>Base URL</Label>
                  <Input
                    value={comfyUrl}
                    onChange={(e) => setComfyUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8188"
                  />
                </div>
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

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
