import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params;
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    include: {
      keyframes: {
        orderBy: { sequenceOrder: "asc" },
        include: { referenceImages: true },
      },
      sceneCharacters: { include: { character: true } },
    },
  });

  if (!scene) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  return NextResponse.json(scene);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params;
  const body = await request.json();

  const scene = await prisma.scene.update({
    where: { id: sceneId },
    data: body,
  });

  return NextResponse.json(scene);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params;
  await prisma.scene.delete({ where: { id: sceneId } });
  return NextResponse.json({ success: true });
}
