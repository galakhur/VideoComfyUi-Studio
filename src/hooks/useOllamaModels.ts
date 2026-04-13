"use client";

import { useState, useCallback } from "react";

interface OllamaModel {
  name: string;
  size: string;
  modified_at?: string;
}

interface TestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
  modelStatus?: string;
}

export function useOllamaModels() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const fetchModels = useCallback(async (url?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = url ? `?url=${encodeURIComponent(url)}` : "";
      const res = await fetch(`/api/llm/models${params}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setModels([]);
      } else {
        setModels(data.models || []);
      }
    } catch {
      setError("Failed to fetch models");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (url?: string, model?: string) => {
    setTestResult(null);
    try {
      const res = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, model }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.ok && data.models) {
        setModels(data.models);
      }
      return data;
    } catch {
      const result = { ok: false, message: "Network error" };
      setTestResult(result);
      return result;
    }
  }, []);

  return { models, loading, error, testResult, fetchModels, testConnection };
}
