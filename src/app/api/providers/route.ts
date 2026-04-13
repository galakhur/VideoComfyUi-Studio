import { NextResponse } from "next/server";
import { getAllVideoProviders } from "@/lib/media/video-provider-registry";
import { comfyClient } from "@/lib/media/comfyui-client";

export async function GET() {
  const comfyHealthy = await comfyClient.checkHealth();
  const videoProviders = getAllVideoProviders();

  return NextResponse.json({
    llm: [
      { id: "openai", name: "OpenAI", configured: !!process.env.OPENAI_API_KEY },
      { id: "claude", name: "Claude", configured: !!process.env.ANTHROPIC_API_KEY },
    ],
    image: [
      {
        id: "comfyui",
        name: "ComfyUI",
        configured: comfyHealthy,
        url: process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188",
      },
    ],
    video: videoProviders.map((p) => ({
      id: p.id,
      name: p.name,
      configured: p.isConfigured(),
    })),
  });
}
