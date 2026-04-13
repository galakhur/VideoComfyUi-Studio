import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSuggestions } from "@/lib/ai/agent-suggestions";
import type { LLMProvider, MuseControlLevel } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, provider } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        select: {
          id: true,
          title: true,
          status: true,
          description: true,
          keyframes: { select: { id: true } },
          videoUrl: true,
        },
      },
      _count: { select: { characters: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const suggestions = await generateSuggestions(
      {
        title: project.title,
        storyline: project.storyline,
        currentStage: project.currentStage,
        museControlLevel: project.museControlLevel as MuseControlLevel,
        scenes: project.scenes.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          description: s.description,
          hasKeyframes: s.keyframes.length > 0,
          hasVideo: !!s.videoUrl,
        })),
        characterCount: project._count.characters,
      },
      (provider as LLMProvider) || "ollama"
    );

    // Save suggestions to DB
    for (const suggestion of suggestions) {
      await prisma.museSuggestion.create({
        data: {
          projectId,
          type: suggestion.type,
          muse: suggestion.muse,
          message: suggestion.message,
          sceneId: suggestion.sceneId,
          actions: JSON.stringify(suggestion.actions),
        },
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
