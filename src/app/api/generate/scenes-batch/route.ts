import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/provider-registry";
import {
  SCENE_GENERATION_PROMPT,
  buildSceneGenerationPrompt,
} from "@/lib/ai/prompt-templates";
import { prisma } from "@/lib/prisma";
import type { LLMProvider } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, provider, storyline, count, startNumber } = body;

  if (!projectId || !storyline || !count) {
    return NextResponse.json(
      { error: "projectId, storyline, and count are required" },
      { status: 400 }
    );
  }

  const llmProvider: LLMProvider = provider || "ollama";

  const existingScenes = await prisma.scene.findMany({
    where: { projectId },
    select: { title: true, sceneNumber: true },
    orderBy: { sceneNumber: "asc" },
  });

  const userPrompt = buildSceneGenerationPrompt(
    storyline,
    count,
    existingScenes.map((s) => `Scene ${s.sceneNumber}: ${s.title}`)
  );

  try {
    const result = await generateText(
      llmProvider,
      [
        { role: "system", content: SCENE_GENERATION_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, maxTokens: 8192 }
    );

    // Parse scenes from response
    let scenes: {
      title: string;
      heading?: string;
      description?: string;
      dialogue?: string;
      technicalNotes?: string;
    }[] = [];

    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to parse generated scenes", raw: result.content },
        { status: 500 }
      );
    }

    // Save scenes to database
    const baseNumber = startNumber ?? (existingScenes.length + 1);
    const created = await Promise.all(
      scenes.map((scene, i) =>
        prisma.scene.create({
          data: {
            projectId,
            sceneNumber: baseNumber + i,
            title: scene.title || `Scene ${baseNumber + i}`,
            heading: scene.heading || "",
            description: scene.description || "",
            dialogue: scene.dialogue || null,
            technicalNotes: scene.technicalNotes || null,
          },
        })
      )
    );

    return NextResponse.json({ scenes: created, count: created.length });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
