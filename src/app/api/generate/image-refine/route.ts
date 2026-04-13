import { NextResponse } from "next/server";
import { comfyClient } from "@/lib/media/comfyui-client";
import { createJob, updateJob } from "@/lib/jobs/job-manager";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { sceneId, keyframeId, workflowId, params } = body;

  if (!sceneId || !keyframeId || !workflowId) {
    return NextResponse.json(
      { error: "sceneId, keyframeId, and workflowId are required" },
      { status: 400 }
    );
  }

  const workflow = await prisma.comfyWorkflow.findUnique({
    where: { id: workflowId },
  });
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const healthy = await comfyClient.checkHealth();
  if (!healthy) {
    return NextResponse.json({ error: "ComfyUI is not reachable" }, { status: 503 });
  }

  try {
    const workflowJson = JSON.parse(workflow.workflowJson);
    const injected = comfyClient.injectParams(workflowJson, params || {});
    const { prompt_id } = await comfyClient.queuePrompt(injected);

    const job = await createJob({
      sceneId,
      providerId: "comfyui",
      jobType: "image_refine",
      comfyPromptId: prompt_id,
      metadata: { workflowId, keyframeId, params },
    });

    await updateJob(job.id, { status: "RUNNING" });

    return NextResponse.json({ jobId: job.id, promptId: prompt_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
