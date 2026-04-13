import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.mcpChatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const session = await prisma.mcpChatSession.create({
    data: { title: body.title || "New Session" },
  });
  return NextResponse.json(session, { status: 201 });
}
