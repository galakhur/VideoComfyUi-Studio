import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/provider-registry";
import type { LLMProvider } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { provider, messages, model, temperature, maxTokens } = body;

  if (!provider || !messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "provider and messages are required" },
      { status: 400 }
    );
  }

  const validProviders: LLMProvider[] = ["ollama", "claude"];
  if (!validProviders.includes(provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Use: ${validProviders.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = await generateText(provider, messages, {
      model,
      temperature,
      maxTokens,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
