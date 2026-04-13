"use client";

import { useState } from "react";
import { Wand2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("openai");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult("");

    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        setResult("Error: API call failed. Check your API keys in settings.");
        return;
      }

      const data = await res.json();
      setResult(data.content || data.text || JSON.stringify(data));
    } catch {
      setResult("Error: Failed to connect to the API.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Playground</h1>
        <p className="text-sm text-muted-foreground">
          Test AI generation with custom prompts
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1 grid gap-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={6}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Wand2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-foreground">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
