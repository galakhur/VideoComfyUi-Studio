import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, name, shortBio, designNotes, primaryRole, promptPositive, promptNegative, tags } = body;

  if (!projectId || !name) {
    return NextResponse.json(
      { error: "projectId and name are required" },
      { status: 400 }
    );
  }

  const character = await prisma.character.create({
    data: {
      projectId,
      name,
      shortBio: shortBio ?? null,
      designNotes: designNotes ?? null,
      primaryRole: primaryRole ?? null,
      promptPositive: promptPositive ?? null,
      promptNegative: promptNegative ?? null,
      tags: JSON.stringify(tags ?? []),
    },
  });

  return NextResponse.json(character, { status: 201 });
}
