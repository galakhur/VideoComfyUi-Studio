import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { images: true },
  });

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json(character);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const body = await request.json();

  if (body.tags && Array.isArray(body.tags)) {
    body.tags = JSON.stringify(body.tags);
  }

  const character = await prisma.character.update({
    where: { id: characterId },
    data: body,
  });

  return NextResponse.json(character);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  await prisma.character.delete({ where: { id: characterId } });
  return NextResponse.json({ success: true });
}
