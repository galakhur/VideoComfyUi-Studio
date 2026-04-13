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
  if (provider === "openai") {
    return generateOpenAI(messages, options);
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
  if (provider === "openai") {
    yield* streamOpenAI(messages, options);
  } else if (provider === "claude") {
    yield* streamClaude(messages, options);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

async function generateOpenAI(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = options.model || "gpt-4o";

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

async function* streamOpenAI(
  messages: LLMMessage[],
  options: LLMOptions
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = options.model || "gpt-4o";

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
