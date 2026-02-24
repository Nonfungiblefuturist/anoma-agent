import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), ".agent", "config.json");

interface AgentConfig {
  voice: { speaker: string; language: string };
  defaultModel: string;
}

const DEFAULT_CONFIG: AgentConfig = {
  voice: { speaker: "ritu", language: "en-IN" },
  defaultModel: "claude-sonnet-4-6",
};

function readConfig(): AgentConfig {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(config: AgentConfig) {
  mkdirSync(join(process.cwd(), ".agent"), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readConfig());
}

export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json();
    const config = readConfig();
    const merged = { ...config, ...updates };
    if (updates.voice) merged.voice = { ...config.voice, ...updates.voice };
    writeConfig(merged);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
