import { readdirSync, readFileSync } from "fs";
import { join } from "path";

let cachedSkills: string | null = null;

export function loadSkills(): string {
  if (cachedSkills) return cachedSkills;

  const skillsDir = join(process.cwd(), ".agent", "skills");
  try {
    const files = readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
    const skills = files.map((file) => {
      const content = readFileSync(join(skillsDir, file), "utf-8");
      return `## Skill: ${file.replace(".md", "")}\n\n${content}`;
    });
    cachedSkills = skills.length
      ? `\n\n# Available Skills\n\n${skills.join("\n\n---\n\n")}`
      : "";
  } catch {
    cachedSkills = "";
  }
  return cachedSkills;
}
