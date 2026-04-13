import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "0.1.0",
    providers: {
      ollama: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      claude: !!process.env.ANTHROPIC_API_KEY,
      kling: !!process.env.KLING_API_KEY,
      runway: !!process.env.RUNWAY_API_KEY,
      seeddance: !!process.env.SEEDDANCE_API_KEY,
      comfyui: process.env.COMFYUI_BASE_URL || null,
    },
  });
}
