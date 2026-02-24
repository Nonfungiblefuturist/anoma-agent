import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const SKILLS_DIR = join(process.cwd(), ".agent", "skills");

export async function GET() {
  try {
    const files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".md"));
    const skills = files.map((file) => ({
      name: file.replace(".md", ""),
      file,
      content: readFileSync(join(SKILLS_DIR, file), "utf-8"),
    }));
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ skills: [] });
  }
}

export async function PUT(req: NextRequest) {
  const { file, content, delete: del } = await req.json();
  const path = join(SKILLS_DIR, file);

  if (del) {
    try {
      unlinkSync(path);
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: true });
  }

  writeFileSync(path, content, "utf-8");
  return NextResponse.json({ ok: true });
}
