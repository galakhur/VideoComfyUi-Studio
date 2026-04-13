import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "@/lib/types";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export async function generateText(
  provider: LLMProvider,
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  if (provider === "ollama") {
    return generateOllama(messages, options);
  } else if (provider === "claude") {
    return generateClaude(messages, options);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export async function* generateStream(
  provider: LLMProvider,
  messages: LLMMessage[],
  options: LLMOptions = {}
): AsyncGenerator<string> {
  if (provider === "ollama") {
    yield* streamOllama(messages, options);
  } else if (provider === "claude") {
    yield* streamClaude(messages, options);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

// Ollama uses OpenAI-compatible API
function getOllamaClient(): OpenAI {
  const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
  return new OpenAI({ baseURL, apiKey: "ollama" });
}

async function generateOllama(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResponse> {
  const client = getOllamaClient();
  const model = options.model || process.env.OLLAMA_MODEL || "llama3.1";

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  });

  const choice = response.choices[0];
  return {
    content: choice.message.content || "",
    model,
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
        }
      : undefined,
  };
}

async function generateClaude(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResponse> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = options.model || "claude-sonnet-4-20250514";

  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 4096,
    system: systemMsg?.content || undefined,
    messages: nonSystemMsgs.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return {
    content: textBlock ? textBlock.text : "",
    model,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
    },
  };
}

async function* streamOllama(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const client = getOllamaClient();
  const model = options.model || process.env.OLLAMA_MODEL || "llama3.1";

  const stream = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* streamClaude(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = options.model || "claude-sonnet-4-20250514";

  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  const stream = client.messages.stream({
    model,
    max_tokens: options.maxTokens ?? 4096,
    system: systemMsg?.content || undefined,
    messages: nonSystemMsgs.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
