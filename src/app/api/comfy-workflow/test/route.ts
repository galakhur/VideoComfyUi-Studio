import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = body.url || process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188";

  const start = Date.now();
  try {
    const res = await fetch(`${baseUrl}/system_stats`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        message: `ComfyUI returned status ${res.status}`,
      });
    }

    const stats = await res.json();
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      ok: true,
      message: "Connected to ComfyUI",
      latencyMs,
      system: {
        os: stats.system?.os,
        ram_total: stats.system?.ram_total,
        ram_free: stats.system?.ram_free,
      },
      devices: stats.devices?.map((d: Record<string, unknown>) => ({
        name: d.name,
        type: d.type,
        vram_total: d.vram_total,
        vram_free: d.vram_free,
      })),
    });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Cannot connect to ComfyUI. Is it running? Start with: python main.py",
      latencyMs: Date.now() - start,
    });
  }
}
