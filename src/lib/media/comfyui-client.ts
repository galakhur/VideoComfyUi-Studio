export interface ComfyUIProgress {
  value: number;
  max: number;
  promptId: string;
}

export interface ComfyUIResult {
  images: { filename: string; subfolder: string; type: string }[];
}

export class ComfyUIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.COMFYUI_BASE_URL || "http://127.0.0.1:8188";
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`, {
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async queuePrompt(
    workflow: Record<string, unknown>,
    clientId?: string
  ): Promise<{ prompt_id: string }> {
    const body: Record<string, unknown> = { prompt: workflow };
    if (clientId) body.client_id = clientId;

    const res = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ComfyUI error: ${text}`);
    }

    return res.json();
  }

  async getHistory(promptId: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/history/${promptId}`);
    if (!res.ok) throw new Error("Failed to get history");
    return res.json();
  }

  async getImage(
    filename: string,
    subfolder: string = "",
    type: string = "output"
  ): Promise<ArrayBuffer> {
    const params = new URLSearchParams({ filename, subfolder, type });
    const res = await fetch(`${this.baseUrl}/view?${params}`);
    if (!res.ok) throw new Error("Failed to get image");
    return res.arrayBuffer();
  }

  async getQueue(): Promise<{
    queue_running: unknown[];
    queue_pending: unknown[];
  }> {
    const res = await fetch(`${this.baseUrl}/queue`);
    return res.json();
  }

  getWebSocketUrl(clientId: string): string {
    const wsUrl = this.baseUrl.replace("http", "ws");
    return `${wsUrl}/ws?clientId=${clientId}`;
  }

  injectParams(
    workflow: Record<string, unknown>,
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const workflowStr = JSON.stringify(workflow);
    let result = workflowStr;

    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, String(value));
    }

    return JSON.parse(result);
  }
}

export const comfyClient = new ComfyUIClient();
