import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  const workflow = await prisma.comfyWorkflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workflow);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  const body = await request.json();
  if (body.workflowJson && typeof body.workflowJson !== "string") {
    body.workflowJson = JSON.stringify(body.workflowJson);
  }
  if (body.inputMapping && typeof body.inputMapping !== "string") {
    body.inputMapping = JSON.stringify(body.inputMapping);
  }
  const workflow = await prisma.comfyWorkflow.update({ where: { id: workflowId }, data: body });
  return NextResponse.json(workflow);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  await prisma.comfyWorkflow.delete({ where: { id: workflowId } });
  return NextResponse.json({ success: true });
}
