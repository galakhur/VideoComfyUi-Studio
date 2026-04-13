import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const messages = await prisma.mcpChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();

  const message = await prisma.mcpChatMessage.create({
    data: {
      sessionId,
      role: body.role || "user",
      content: body.content,
      toolName: body.toolName || null,
      toolInput: body.toolInput ? JSON.stringify(body.toolInput) : null,
      toolOutput: body.toolOutput ? JSON.stringify(body.toolOutput) : null,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
