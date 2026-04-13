import { NextResponse } from "next/server";
import { generateStream } from "@/lib/ai/provider-registry";
import {
  STORYLINE_SYSTEM_PROMPT,
  buildStorylinePrompt,
} from "@/lib/ai/prompt-templates";
import { prisma } from "@/lib/prisma";
import type { LLMProvider } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, provider, description, genre, themes } = body;

  if (!projectId || !description) {
    return NextResponse.json(
      { error: "projectId and description are required" },
      { status: 400 }
    );
  }

  const llmProvider: LLMProvider = provider || "ollama";
  const userPrompt = buildStorylinePrompt(description, genre, themes);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let accumulated = "";

        const gen = generateStream(
          llmProvider,
          [
            { role: "system", content: STORYLINE_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          { temperature: 0.8, maxTokens: 4096 }
        );

        for await (const token of gen) {
          accumulated += token;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token, done: false })}\n\n`)
          );
        }

        // Try to parse the JSON result
        let storyline = null;
        try {
          const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            storyline = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // If parsing fails, save raw text
        }

        // Save to project
        await prisma.project.update({
          where: { id: projectId },
          data: {
            storyline: storyline
              ? JSON.stringify(storyline)
              : accumulated,
            storylineSource: "MUSE_GENERATED",
          },
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, storyline })}\n\n`
          )
        );
        controller.close();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Generation failed";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: message, done: true })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
