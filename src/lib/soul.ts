import { readFileSync } from "fs";
import { join } from "path";

export function loadSoul(): string {
  try {
    return readFileSync(join(process.cwd(), "SOUL.md"), "utf-8");
  } catch {
    return "You are a helpful AI assistant.";
  }
}
