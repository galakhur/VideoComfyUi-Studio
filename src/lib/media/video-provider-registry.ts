export interface VideoJobParams {
  imageUrl: string;
  prompt: string;
  duration?: number;
  aspectRatio?: string;
}

export interface VideoJobResult {
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  videoUrl?: string;
  error?: string;
}

export interface VideoProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  submit(params: VideoJobParams): Promise<string>;
  poll(jobId: string): Promise<VideoJobResult>;
}

class KlingProvider implements VideoProvider {
  id = "kling";
  name = "Kling";

  isConfigured(): boolean {
    return !!process.env.KLING_API_KEY;
  }

  async submit(params: VideoJobParams): Promise<string> {
    const res = await fetch("https://api.klingai.com/v1/videos/image2video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KLING_API_KEY}`,
      },
      body: JSON.stringify({
        image_url: params.imageUrl,
        prompt: params.prompt,
        duration: params.duration || 5,
        aspect_ratio: params.aspectRatio || "16:9",
      }),
    });

    if (!res.ok) throw new Error(`Kling API error: ${res.status}`);
    const data = await res.json();
    return data.data?.task_id || data.task_id;
  }

  async poll(jobId: string): Promise<VideoJobResult> {
    const res = await fetch(
      `https://api.klingai.com/v1/videos/image2video/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KLING_API_KEY}`,
        },
      }
    );

    if (!res.ok) return { status: "failed", error: `Kling poll error: ${res.status}` };
    const data = await res.json();
    const task = data.data || data;

    switch (task.task_status) {
      case "succeed":
        return {
          status: "completed",
          videoUrl: task.task_result?.videos?.[0]?.url,
        };
      case "failed":
        return { status: "failed", error: task.task_status_msg };
      default:
        return { status: "processing", progress: task.progress };
    }
  }
}

class RunwayProvider implements VideoProvider {
  id = "runway";
  name = "Runway";

  isConfigured(): boolean {
    return !!process.env.RUNWAY_API_KEY;
  }

  async submit(params: VideoJobParams): Promise<string> {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: params.imageUrl,
        promptText: params.prompt,
        duration: params.duration || 5,
        ratio: params.aspectRatio || "16:9",
      }),
    });

    if (!res.ok) throw new Error(`Runway API error: ${res.status}`);
    const data = await res.json();
    return data.id;
  }

  async poll(jobId: string): Promise<VideoJobResult> {
    const res = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    if (!res.ok) return { status: "failed", error: `Runway poll error: ${res.status}` };
    const data = await res.json();

    switch (data.status) {
      case "SUCCEEDED":
        return { status: "completed", videoUrl: data.output?.[0] };
      case "FAILED":
        return { status: "failed", error: data.failure || "Unknown" };
      default:
        return { status: "processing", progress: data.progress };
    }
  }
}

class SeedDanceProvider implements VideoProvider {
  id = "seeddance";
  name = "SeedDance";

  isConfigured(): boolean {
    return !!process.env.SEEDDANCE_API_KEY;
  }

  async submit(params: VideoJobParams): Promise<string> {
    const res = await fetch("https://api.seeddance.com/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEEDDANCE_API_KEY}`,
      },
      body: JSON.stringify({
        reference_image: params.imageUrl,
        prompt: params.prompt,
        duration: params.duration || 5,
      }),
    });

    if (!res.ok) throw new Error(`SeedDance API error: ${res.status}`);
    const data = await res.json();
    return data.task_id || data.id;
  }

  async poll(jobId: string): Promise<VideoJobResult> {
    const res = await fetch(
      `https://api.seeddance.com/v1/tasks/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SEEDDANCE_API_KEY}`,
        },
      }
    );

    if (!res.ok) return { status: "failed", error: `SeedDance poll error` };
    const data = await res.json();

    if (data.status === "completed") {
      return { status: "completed", videoUrl: data.video_url };
    } else if (data.status === "failed") {
      return { status: "failed", error: data.error };
    }
    return { status: "processing", progress: data.progress };
  }
}

const providers: VideoProvider[] = [
  new KlingProvider(),
  new RunwayProvider(),
  new SeedDanceProvider(),
];

export function getVideoProvider(id: string): VideoProvider | undefined {
  return providers.find((p) => p.id === id);
}

export function getAvailableVideoProviders(): VideoProvider[] {
  return providers.filter((p) => p.isConfigured());
}

export function getAllVideoProviders(): VideoProvider[] {
  return providers;
}
