import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SOUL_PATH = join(process.cwd(), "SOUL.md");

export async function GET() {
  try {
    const content = readFileSync(SOUL_PATH, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "" });
  }
}

export async function PUT(req: NextRequest) {
  const { content } = await req.json();
  writeFileSync(SOUL_PATH, content, "utf-8");
  return NextResponse.json({ ok: true });
}
