import { prisma } from "@/lib/prisma";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: Record<string, unknown>) => Promise<unknown>;
}

export const mcpTools: McpTool[] = [
  {
    name: "health_check",
    description: "Check Muse Studio system status",
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({
      status: "ok",
      version: "0.1.0",
    }),
  },
  {
    name: "list_projects",
    description: "List all projects with summaries",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          currentStage: true,
          _count: { select: { scenes: true, characters: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      return { projects };
    },
  },
  {
    name: "get_project",
    description: "Get full project details including scenes and characters",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
    handler: async (input) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId as string },
        include: {
          scenes: { orderBy: { sceneNumber: "asc" } },
          characters: true,
          _count: { select: { scenes: true, characters: true } },
        },
      });
      return project || { error: "Project not found" };
    },
  },
  {
    name: "get_scene",
    description: "Get scene details with keyframes",
    inputSchema: {
      type: "object",
      properties: { sceneId: { type: "string" } },
      required: ["sceneId"],
    },
    handler: async (input) => {
      const scene = await prisma.scene.findUnique({
        where: { id: input.sceneId as string },
        include: { keyframes: true, sceneCharacters: { include: { character: true } } },
      });
      return scene || { error: "Scene not found" };
    },
  },
  {
    name: "list_providers",
    description: "List available generation providers and their status",
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({
      llm: {
        ollama: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
        claude: !!process.env.ANTHROPIC_API_KEY,
      },
      video: {
        kling: !!process.env.KLING_API_KEY,
        runway: !!process.env.RUNWAY_API_KEY,
        seeddance: !!process.env.SEEDDANCE_API_KEY,
      },
      comfyui: process.env.COMFYUI_BASE_URL || null,
    }),
  },
  {
    name: "update_scene",
    description: "Update scene content (requires MCP_ALLOW_WRITE)",
    inputSchema: {
      type: "object",
      properties: {
        sceneId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        dialogue: { type: "string" },
        status: { type: "string" },
      },
      required: ["sceneId"],
    },
    handler: async (input) => {
      if (process.env.MCP_ALLOW_WRITE !== "true") {
        return { error: "Write access disabled. Set MCP_ALLOW_WRITE=true" };
      }
      const { sceneId, ...data } = input;
      const scene = await prisma.scene.update({
        where: { id: sceneId as string },
        data: data as Record<string, string>,
      });
      return scene;
    },
  },
];

export function getToolByName(name: string): McpTool | undefined {
  return mcpTools.find((t) => t.name === name);
}
