import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { suggestionId, action } = body;

  if (!suggestionId || !action) {
    return NextResponse.json(
      { error: "suggestionId and action are required" },
      { status: 400 }
    );
  }

  const suggestion = await prisma.museSuggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  // Mark as read
  await prisma.museSuggestion.update({
    where: { id: suggestionId },
    data: { isRead: true },
  });

  if (action === "dismiss") {
    return NextResponse.json({ status: "dismissed" });
  }

  // For "apply" action, the specific behavior depends on suggestion type
  // This is a framework - actual actions would be implemented per suggestion type
  return NextResponse.json({
    status: "applied",
    suggestion: {
      id: suggestion.id,
      type: suggestion.type,
      message: suggestion.message,
    },
  });
}
