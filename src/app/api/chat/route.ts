import { NextRequest } from "next/server";
import { getConvexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { runAgentStreaming } from "@/lib/agent";
import type Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { sessionId, userMessage, model } = await req.json();

  if (!sessionId || !userMessage) {
    return new Response(
      JSON.stringify({ error: "sessionId and userMessage are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const convex = getConvexClient();

  // Save user message to Convex
  await convex.mutation(api.messages.create, {
    sessionId,
    role: "user",
    content: userMessage,
  });

  // Load conversation history from Convex
  const history = await convex.query(api.messages.listBySession, { sessionId });

  // Build messages array for the agent
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runAgentStreaming(messages, model)) {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          if (event.type === "done") {
            // Save assistant message to Convex
            await convex.mutation(api.messages.create, {
              sessionId,
              role: "assistant",
              content: event.fullText,
              inputTokens: event.usage.inputTokens,
              outputTokens: event.usage.outputTokens,
              costUsd: event.usage.costUsd,
            });

            // Update session cost totals
            const session = await convex.query(api.sessions.get, {
              id: sessionId,
            });
            if (session) {
              await convex.mutation(api.sessions.update, {
                id: sessionId,
                totalInputTokens:
                  session.totalInputTokens + event.usage.inputTokens,
                totalOutputTokens:
                  session.totalOutputTokens + event.usage.outputTokens,
                totalCostUsd: session.totalCostUsd + event.usage.costUsd,
              });
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        const data = JSON.stringify({ type: "error", error: errorMsg });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
