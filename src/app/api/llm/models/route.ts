import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = searchParams.get("url") || process.env.OLLAMA_BASE_URL?.replace("/v1", "") || "http://localhost:11434";

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ models: [], error: `Ollama returned ${res.status}` });
    }

    const data = await res.json();
    const models = (data.models || []).map((m: Record<string, unknown>) => ({
      name: m.name as string,
      size: m.size ? `${(Number(m.size) / 1e9).toFixed(1)} GB` : "unknown",
      modified_at: m.modified_at,
      details: m.details,
    }));

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({
      models: [],
      error: "Cannot connect to Ollama. Is it running?",
    });
  }
}
