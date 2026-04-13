import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const workflows = await prisma.comfyWorkflow.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, category, workflowJson, inputMapping, isDefault } = body;

  if (!name || !category || !workflowJson) {
    return NextResponse.json(
      { error: "name, category, and workflowJson are required" },
      { status: 400 }
    );
  }

  const workflow = await prisma.comfyWorkflow.create({
    data: {
      name,
      description: description || null,
      category,
      workflowJson: typeof workflowJson === "string" ? workflowJson : JSON.stringify(workflowJson),
      inputMapping: inputMapping ? JSON.stringify(inputMapping) : null,
      isDefault: isDefault || false,
    },
  });

  return NextResponse.json(workflow, { status: 201 });
}
