import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    title: v.string(),
    agentSessionId: v.optional(v.string()),
    totalInputTokens: v.number(),
    totalOutputTokens: v.number(),
    totalCostUsd: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updated", ["updatedAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),

  memories: defineTable({
    type: v.union(
      v.literal("session"),
      v.literal("persistent"),
      v.literal("archival")
    ),
    content: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
  }).searchIndex("search_content", {
    searchField: "content",
    filterFields: ["type"],
  }),
});
