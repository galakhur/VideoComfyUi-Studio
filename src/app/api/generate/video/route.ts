import { NextResponse } from "next/server";
import { getVideoProvider } from "@/lib/media/video-provider-registry";
import { createJob, updateJob } from "@/lib/jobs/job-manager";

export async function POST(request: Request) {
  const body = await request.json();
  const { sceneId, provider: providerId, imageUrl, prompt, duration } = body;

  if (!sceneId || !providerId || !imageUrl || !prompt) {
    return NextResponse.json(
      { error: "sceneId, provider, imageUrl, and prompt are required" },
      { status: 400 }
    );
  }

  const provider = getVideoProvider(providerId);
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown video provider: ${providerId}` },
      { status: 400 }
    );
  }

  if (!provider.isConfigured()) {
    return NextResponse.json(
      { error: `${provider.name} is not configured. Add API key to .env.local` },
      { status: 400 }
    );
  }

  try {
    const externalJobId = await provider.submit({
      imageUrl,
      prompt,
      duration,
    });

    const job = await createJob({
      sceneId,
      providerId: provider.id,
      jobType: "video",
      metadata: { externalJobId, imageUrl, prompt, duration },
    });

    await updateJob(job.id, { status: "RUNNING", message: `Submitted to ${provider.name}` });

    return NextResponse.json({
      jobId: job.id,
      externalJobId,
      provider: provider.name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
