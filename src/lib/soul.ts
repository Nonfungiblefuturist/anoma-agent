import { readFileSync } from "fs";
import { join } from "path";

let cachedSoul: string | null = null;

export function loadSoul(): string {
  if (cachedSoul) return cachedSoul;
  try {
    cachedSoul = readFileSync(join(process.cwd(), "SOUL.md"), "utf-8");
  } catch {
    cachedSoul = "You are a helpful AI assistant.";
  }
  return cachedSoul;
}
