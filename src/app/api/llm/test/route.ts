import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = body.url || process.env.OLLAMA_BASE_URL?.replace("/v1", "") || "http://localhost:11434";
  const model = body.model;

  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        message: `Ollama returned status ${res.status}`,
      });
    }

    const data = await res.json();
    const latencyMs = Date.now() - start;
    const models = (data.models || []).map((m: Record<string, unknown>) => ({
      name: m.name,
      size: m.size ? `${(Number(m.size) / 1e9).toFixed(1)} GB` : undefined,
      modified_at: m.modified_at,
    }));

    const modelNames = models.map((m: { name: string }) => m.name);

    let modelStatus = "";
    if (model) {
      const found = modelNames.some(
        (n: string) => n === model || n.startsWith(model + ":")
      );
      modelStatus = found
        ? `Model "${model}" is available`
        : `Model "${model}" not found. Pull it with: ollama pull ${model}`;
    }

    return NextResponse.json({
      ok: true,
      message: "Connected to Ollama",
      latencyMs,
      models,
      modelStatus,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Cannot connect to Ollama. Is it running? Start with: ollama serve",
      latencyMs: Date.now() - start,
    });
  }
}
