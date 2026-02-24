import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ENV_PATH = join(process.cwd(), ".env.local");

function parseEnv(raw: string): { key: string; value: string }[] {
  return raw
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const eqIdx = l.indexOf("=");
      if (eqIdx === -1) return null;
      const key = l.slice(0, eqIdx).trim();
      let value = l.slice(eqIdx + 1).trim();
      // Strip inline comments for display
      const commentIdx = value.indexOf(" #");
      if (commentIdx > -1) value = value.slice(0, commentIdx).trim();
      return { key, value };
    })
    .filter(Boolean) as { key: string; value: string }[];
}

export async function GET() {
  try {
    const raw = readFileSync(ENV_PATH, "utf-8");
    const vars = parseEnv(raw);
    // Mask sensitive values
    const masked = vars.map((v) => ({
      ...v,
      value: v.key.includes("KEY") || v.key.includes("SECRET")
        ? v.value.slice(0, 12) + "***"
        : v.value,
      sensitive: v.key.includes("KEY") || v.key.includes("SECRET"),
    }));
    return NextResponse.json({ vars: masked });
  } catch {
    return NextResponse.json({ vars: [] });
  }
}

export async function PUT(req: NextRequest) {
  const { key, value } = await req.json();
  try {
    let raw = readFileSync(ENV_PATH, "utf-8");
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(raw)) {
      raw = raw.replace(regex, `${key}=${value}`);
    } else {
      raw = raw.trimEnd() + `\n${key}=${value}\n`;
    }
    writeFileSync(ENV_PATH, raw, "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to write" }, { status: 500 });
  }
}
