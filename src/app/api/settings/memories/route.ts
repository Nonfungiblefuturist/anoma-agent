import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  try {
    const convex = getConvexClient();
    const memories = await convex.query(api.memories.getAll, {});
    return NextResponse.json({
      memories: memories.map((m) => ({
        id: m._id,
        type: m.type,
        content: m.content,
        tags: m.tags,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ memories: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, content, tags } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    const convex = getConvexClient();
    const id = await convex.mutation(api.memories.save, {
      type: type || "persistent",
      content,
      tags: tags || [],
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const convex = getConvexClient();
  await convex.mutation(api.memories.remove, { id } as never);
  return NextResponse.json({ ok: true });
}
