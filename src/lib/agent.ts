import Anthropic from "@anthropic-ai/sdk";
import { loadSoul } from "./soul";
import { loadSkills } from "./skills";
import {
  memoryToolDefinitions,
  executeMemoryTool,
  MemoryToolName,
} from "./memory-tools";
import { MODELS, DEFAULT_MODEL } from "./models";

function buildBaseSystemPrompt(): string {
  const soul = loadSoul();
  const skills = loadSkills();

  return `${soul}

# Memory System

You have access to a persistent memory system. Use it actively:
- **save_memory**: Proactively save important facts, user preferences, project details
- **search_memory**: Search before answering questions that might relate to past context
- **get_memories**: Review what you know about the user
- **delete_memory**: Clean up outdated memories

Memory types:
- **persistent**: Important facts to always remember (user's name, preferences, goals)
- **session**: Context specific to the current conversation
- **archival**: Reference material, research summaries, detailed notes

Be proactive about saving memories — don't wait to be asked.
${skills}`;
}

async function fetchRagContext(query: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/rag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    if (!data.context || data.context.length === 0) return "";

    const chunks = data.context
      .map((c: { source: string; content: string }) => `[${c.source}]\n${c.content}`)
      .join("\n\n---\n\n");

    return `\n\n# Retrieved Context (RAG)\n\nThe following context was retrieved from project documents and skills based on the user's query. Use it to inform your response:\n\n${chunks}`;
  } catch {
    return "";
  }
}

export function createAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) {
    return (inputTokens * 3) / 1_000_000 + (outputTokens * 15) / 1_000_000;
  }
  return (
    (inputTokens * model.costPer1kInput) / 1_000 +
    (outputTokens * model.costPer1kOutput) / 1_000
  );
}

export async function* runAgentStreaming(
  messages: Anthropic.MessageParam[],
  model: string = DEFAULT_MODEL
): AsyncGenerator<
  | { type: "text"; text: string }
  | { type: "tool_use"; name: string; input: Record<string, unknown> }
  | {
      type: "done";
      usage: { inputTokens: number; outputTokens: number; costUsd: number };
      fullText: string;
    }
  | { type: "error"; error: string }
> {
  const client = createAnthropicClient();
  const basePrompt = buildBaseSystemPrompt();

  // Extract the latest user message for RAG query
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const ragQuery =
    lastUserMsg && typeof lastUserMsg.content === "string"
      ? lastUserMsg.content
      : "";
  const ragContext = ragQuery ? await fetchRagContext(ragQuery) : "";
  const systemPrompt = basePrompt + ragContext;

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let fullResponse = "";

  const conversationMessages = [...messages];
  let maxIterations = 10;

  while (maxIterations-- > 0) {
    const stream = client.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: memoryToolDefinitions,
      messages: conversationMessages,
    });

    let hasToolUse = false;
    const contentBlocks: Anthropic.ContentBlock[] = [];
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullResponse += event.delta.text;
        yield { type: "text", text: event.delta.text };
      }
    }

    const response = await stream.finalMessage();
    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    for (const block of response.content) {
      contentBlocks.push(block);
      if (block.type === "tool_use") {
        hasToolUse = true;
        yield {
          type: "tool_use",
          name: block.name,
          input: block.input as Record<string, unknown>,
        };

        const result = await executeMemoryTool(
          block.name as MemoryToolName,
          block.input as Record<string, unknown>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    if (!hasToolUse) break;

    conversationMessages.push({ role: "assistant", content: contentBlocks });
    conversationMessages.push({ role: "user", content: toolResults });
  }

  const costUsd = getCost(model, totalInputTokens, totalOutputTokens);

  yield {
    type: "done",
    usage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      costUsd,
    },
    fullText: fullResponse,
  };
}
