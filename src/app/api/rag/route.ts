import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const SKILLS_DIR = path.join(PROJECT_ROOT, ".agent", "skills");
const CHUNK_SIZE = 500; // chars per chunk
const MAX_RESULTS = 5;

interface Chunk {
  source: string;
  content: string;
  score: number;
}

function readMarkdownFiles(): { source: string; content: string }[] {
  const files: { source: string; content: string }[] = [];

  // Read .md files from project root
  try {
    const rootFiles = fs.readdirSync(PROJECT_ROOT);
    for (const file of rootFiles) {
      if (file.endsWith(".md")) {
        const filePath = path.join(PROJECT_ROOT, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && stat.size < 100_000) {
          files.push({ source: file, content: fs.readFileSync(filePath, "utf-8") });
        }
      }
    }
  } catch { /* ignore */ }

  // Read .md files from .agent/skills/
  try {
    if (fs.existsSync(SKILLS_DIR)) {
      const skillFiles = fs.readdirSync(SKILLS_DIR);
      for (const file of skillFiles) {
        if (file.endsWith(".md")) {
          const filePath = path.join(SKILLS_DIR, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile() && stat.size < 100_000) {
            files.push({ source: `.agent/skills/${file}`, content: fs.readFileSync(filePath, "utf-8") });
          }
        }
      }
    }
  } catch { /* ignore */ }

  return files;
}

function chunkText(source: string, text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length > CHUNK_SIZE && current.length > 0) {
      chunks.push({ source, content: current.trim(), score: 0 });
      current = "";
    }
    current += (current ? "\n\n" : "") + para;
  }
  if (current.trim()) {
    chunks.push({ source, content: current.trim(), score: 0 });
  }

  return chunks;
}

function scoreChunk(chunk: Chunk, keywords: string[]): number {
  const lower = chunk.content.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = lower.match(regex);
    if (matches) score += matches.length;
  }
  return score;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    // Extract keywords (words 3+ chars, lowercase)
    const keywords = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string) => w.length >= 3);

    if (keywords.length === 0) {
      return NextResponse.json({ context: [], query });
    }

    // Read all markdown files and chunk them
    const files = readMarkdownFiles();
    const allChunks: Chunk[] = [];
    for (const file of files) {
      allChunks.push(...chunkText(file.source, file.content));
    }

    // Score and rank
    for (const chunk of allChunks) {
      chunk.score = scoreChunk(chunk, keywords);
    }

    const results = allChunks
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ source, content, score }) => ({ source, content, score }));

    return NextResponse.json({ context: results, query });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
