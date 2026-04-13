import { prisma } from "@/lib/prisma";

export interface Job {
  id: string;
  sceneId: string | null;
  providerId: string;
  jobType: string;
  status: string;
  progress: number;
  message: string | null;
  outputPath: string | null;
  error: string | null;
  metadata: string | null;
  comfyPromptId: string | null;
}

export async function createJob(params: {
  sceneId?: string;
  providerId: string;
  jobType: string;
  metadata?: Record<string, unknown>;
  comfyPromptId?: string;
}): Promise<Job> {
  const job = await prisma.generationJob.create({
    data: {
      sceneId: params.sceneId || null,
      providerId: params.providerId,
      jobType: params.jobType,
      status: "QUEUED",
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      comfyPromptId: params.comfyPromptId || null,
    },
  });
  return job;
}

export async function updateJob(
  jobId: string,
  data: {
    status?: string;
    progress?: number;
    message?: string;
    outputPath?: string;
    error?: string;
  }
): Promise<Job> {
  const job = await prisma.generationJob.update({
    where: { id: jobId },
    data,
  });
  return job;
}

export async function getJob(jobId: string): Promise<Job | null> {
  return prisma.generationJob.findUnique({ where: { id: jobId } });
}

export async function getJobsByScene(sceneId: string): Promise<Job[]> {
  return prisma.generationJob.findMany({
    where: { sceneId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveJobs(): Promise<Job[]> {
  return prisma.generationJob.findMany({
    where: { status: { in: ["QUEUED", "RUNNING"] } },
    orderBy: { createdAt: "asc" },
  });
}

export async function cleanupOldJobs(maxAgeDays: number = 7): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const result = await prisma.generationJob.deleteMany({
    where: {
      status: { in: ["COMPLETED", "FAILED"] },
      createdAt: { lt: cutoff },
    },
  });
  return result.count;
}
