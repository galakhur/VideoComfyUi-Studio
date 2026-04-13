import { mcpTools, getToolByName } from "./mcp-tools";

export interface McpRequest {
  method: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  result?: unknown;
  error?: { code: number; message: string };
}

export async function handleMcpRequest(req: McpRequest): Promise<McpResponse> {
  switch (req.method) {
    case "tools/list":
      return {
        result: {
          tools: mcpTools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      };

    case "tools/call": {
      const toolName = req.params?.name as string;
      const toolInput = (req.params?.arguments || {}) as Record<string, unknown>;

      const tool = getToolByName(toolName);
      if (!tool) {
        return {
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        };
      }

      try {
        const result = await tool.handler(toolInput);
        return {
          result: {
            content: [
              { type: "text", text: JSON.stringify(result, null, 2) },
            ],
          },
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Tool execution failed";
        return {
          error: { code: -32000, message },
        };
      }
    }

    case "initialize":
      return {
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: "muse-studio",
            version: "0.1.0",
          },
        },
      };

    default:
      return {
        error: { code: -32601, message: `Unknown method: ${req.method}` },
      };
  }
}
