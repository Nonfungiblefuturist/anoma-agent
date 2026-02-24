import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const save = mutation({
  args: {
    type: v.union(
      v.literal("session"),
      v.literal("persistent"),
      v.literal("archival")
    ),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const search = query({
  args: {
    query: v.string(),
    type: v.optional(
      v.union(
        v.literal("session"),
        v.literal("persistent"),
        v.literal("archival")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("memories")
      .withSearchIndex("search_content", (s) => {
        const search = s.search("content", args.query);
        if (args.type) return search.eq("type", args.type);
        return search;
      });
    const results = await q.collect();
    return results.slice(0, args.limit ?? 10);
  },
});

export const getByType = query({
  args: {
    type: v.union(
      v.literal("session"),
      v.literal("persistent"),
      v.literal("archival")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").collect();
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
