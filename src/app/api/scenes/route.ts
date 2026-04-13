import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, title, sceneNumber, heading, description, dialogue, technicalNotes } = body;

  if (!projectId || !title) {
    return NextResponse.json(
      { error: "projectId and title are required" },
      { status: 400 }
    );
  }

  const scene = await prisma.scene.create({
    data: {
      projectId,
      title,
      sceneNumber: sceneNumber ?? 1,
      heading: heading ?? "",
      description: description ?? "",
      dialogue: dialogue ?? null,
      technicalNotes: technicalNotes ?? null,
    },
  });

  return NextResponse.json(scene, { status: 201 });
}
