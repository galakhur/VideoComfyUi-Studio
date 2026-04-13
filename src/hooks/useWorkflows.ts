"use client";

import { useState, useEffect, useCallback } from "react";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  workflowJson: string;
  inputMapping: string | null;
  isDefault: boolean;
  createdAt: string;
}

export function useWorkflows(category?: string) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comfy-workflow");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(
          category ? data.filter((w: Workflow) => w.category === category) : data
        );
      }
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = async (data: {
    name: string;
    description?: string;
    category: string;
    workflowJson: string;
    inputMapping?: string;
  }) => {
    const res = await fetch("/api/comfy-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      fetchWorkflows();
      return await res.json();
    }
    return null;
  };

  const deleteWorkflow = async (id: string) => {
    await fetch(`/api/comfy-workflow/${id}`, { method: "DELETE" });
    fetchWorkflows();
  };

  const updateWorkflow = async (id: string, data: Partial<Workflow>) => {
    await fetch(`/api/comfy-workflow/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchWorkflows();
  };

  return { workflows, loading, fetchWorkflows, createWorkflow, deleteWorkflow, updateWorkflow };
}
