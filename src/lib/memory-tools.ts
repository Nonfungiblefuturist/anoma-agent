import Anthropic from "@anthropic-ai/sdk";
import { getConvexClient } from "./convex-client";
import { api } from "../../convex/_generated/api";

export type MemoryToolName =
  | "save_memory"
  | "search_memory"
  | "get_memories"
  | "delete_memory";

export const memoryToolDefinitions: Anthropic.Tool[] = [
  {
    name: "save_memory",
    description:
      "Save information to long-term memory. Use this proactively when you learn something important about the user, their preferences, projects, or any fact worth remembering.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["session", "persistent", "archival"],
          description:
            "session = current conversation context, persistent = important facts to always remember, archival = reference material",
        },
        content: {
          type: "string",
          description: "The information to save",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            'Tags for categorization (e.g., ["preference", "name", "project"])',
        },
      },
      required: ["type", "content", "tags"],
    },
  },
  {
    name: "search_memory",
    description:
      "Search through saved memories using natural language. Use this before answering questions that might relate to past conversations or saved context.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Natural language search query",
        },
        type: {
          type: "string",
          enum: ["session", "persistent", "archival"],
          description: "Optional: filter by memory type",
        },
        limit: {
          type: "number",
          description: "Max results to return (default 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_memories",
    description:
      "Retrieve all memories, optionally filtered by type. Use this to review what you know about the user.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["session", "persistent", "archival"],
          description: "Optional: filter by memory type. Omit to get all.",
        },
      },
      required: [],
    },
  },
  {
    name: "delete_memory",
    description: "Delete a specific memory by its ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "The memory ID to delete",
        },
      },
      required: ["id"],
    },
  },
];

export async function executeMemoryTool(
  name: MemoryToolName,
  input: Record<string, unknown>
): Promise<string> {
  const convex = getConvexClient();

  switch (name) {
    case "save_memory": {
      const id = await convex.mutation(api.memories.save, {
        type: input.type as "session" | "persistent" | "archival",
        content: input.content as string,
        tags: (input.tags as string[]) || [],
      });
      return JSON.stringify({ success: true, id, message: "Memory saved." });
    }

    case "search_memory": {
      const results = await convex.query(api.memories.search, {
        query: input.query as string,
        type: input.type as "session" | "persistent" | "archival" | undefined,
        limit: input.limit as number | undefined,
      });
      return JSON.stringify({
        results: results.map((r) => ({
          id: r._id,
          type: r.type,
          content: r.content,
          tags: r.tags,
          createdAt: r.createdAt,
        })),
        count: results.length,
      });
    }

    case "get_memories": {
      const memories = input.type
        ? await convex.query(api.memories.getByType, {
            type: input.type as "session" | "persistent" | "archival",
          })
        : await convex.query(api.memories.getAll, {});
      return JSON.stringify({
        memories: memories.map((m) => ({
          id: m._id,
          type: m.type,
          content: m.content,
          tags: m.tags,
          createdAt: m.createdAt,
        })),
        count: memories.length,
      });
    }

    case "delete_memory": {
      await convex.mutation(api.memories.remove, {
        id: input.id as string,
      } as never);
      return JSON.stringify({ success: true, message: "Memory deleted." });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
