import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plugins = await prisma.plugin.findMany({
    include: {
      endpoints: true,
      hooks: true,
      uiExtensions: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(plugins);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, version, description, author, configJson } = body;

  if (!name || !version) {
    return NextResponse.json({ error: "name and version required" }, { status: 400 });
  }

  const plugin = await prisma.plugin.create({
    data: {
      name,
      version,
      description: description || null,
      author: author || null,
      configJson: configJson ? JSON.stringify(configJson) : null,
    },
  });

  return NextResponse.json(plugin, { status: 201 });
}
