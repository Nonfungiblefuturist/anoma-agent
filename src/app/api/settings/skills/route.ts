import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";

const SKILLS_DIR = join(process.cwd(), ".agent", "skills");
const CONFIG_PATH = join(SKILLS_DIR, "config.json");

function readDisabled(): string[] {
  try {
    const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return config.disabledSkills || [];
  } catch {
    return [];
  }
}

function writeDisabled(disabled: string[]) {
  mkdirSync(SKILLS_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify({ disabledSkills: disabled }, null, 2), "utf-8");
}

export async function GET() {
  try {
    const files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".md"));
    const disabled = readDisabled();
    const skills = files.map((file) => ({
      name: file.replace(".md", ""),
      file,
      content: readFileSync(join(SKILLS_DIR, file), "utf-8"),
      enabled: !disabled.includes(file),
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
    try { unlinkSync(path); } catch { /* ignore */ }
    return NextResponse.json({ ok: true });
  }

  writeFileSync(path, content, "utf-8");
  return NextResponse.json({ ok: true });
}

// Create a new skill
export async function POST(req: NextRequest) {
  try {
    const { name, content } = await req.json();
    if (!name || !content) {
      return NextResponse.json({ error: "name and content required" }, { status: 400 });
    }
    const file = name.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase() + ".md";
    mkdirSync(SKILLS_DIR, { recursive: true });
    writeFileSync(join(SKILLS_DIR, file), content, "utf-8");
    return NextResponse.json({ ok: true, file });
  } catch {
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

// Toggle skill enabled/disabled or delete a skill
export async function PATCH(req: NextRequest) {
  try {
    const { file, enabled, delete: del } = await req.json();

    if (del) {
      try { unlinkSync(join(SKILLS_DIR, file)); } catch { /* ignore */ }
      // Also remove from disabled list
      const disabled = readDisabled().filter((f) => f !== file);
      writeDisabled(disabled);
      return NextResponse.json({ ok: true });
    }

    if (typeof enabled === "boolean") {
      const disabled = readDisabled();
      if (enabled) {
        writeDisabled(disabled.filter((f) => f !== file));
      } else {
        if (!disabled.includes(file)) writeDisabled([...disabled, file]);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}
