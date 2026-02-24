import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export function loadSkills(): string {
  const skillsDir = join(process.cwd(), ".agent", "skills");
  try {
    // Read disabled skills list
    let disabledSkills: string[] = [];
    try {
      const config = JSON.parse(readFileSync(join(skillsDir, "config.json"), "utf-8"));
      disabledSkills = config.disabledSkills || [];
    } catch { /* no config yet */ }

    const files = readdirSync(skillsDir)
      .filter((f) => f.endsWith(".md") && !disabledSkills.includes(f));

    const skills = files.map((file) => {
      const content = readFileSync(join(skillsDir, file), "utf-8");
      return `## Skill: ${file.replace(".md", "")}\n\n${content}`;
    });

    return skills.length
      ? `\n\n# Available Skills\n\n${skills.join("\n\n---\n\n")}`
      : "";
  } catch {
    return "";
  }
}
