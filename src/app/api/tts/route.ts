import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SARVAM_URL = "https://api.sarvam.ai/text-to-speech";
const MAX_TEXT_LENGTH = 2500;
const CONFIG_PATH = join(process.cwd(), ".agent", "config.json");

function getVoiceConfig(): { speaker: string; language: string } {
  try {
    const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return {
      speaker: config.voice?.speaker || "ritu",
      language: config.voice?.language || "en-IN",
    };
  } catch {
    return { speaker: "ritu", language: "en-IN" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    const voice = getVoiceConfig();
    const truncated = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;

    const response = await fetch(SARVAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [truncated],
        target_language_code: voice.language,
        speaker: voice.speaker,
        model: "bulbul:v3",
        enable_preprocessing: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Sarvam API error: ${response.status} ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const audio = data.audios?.[0];
    if (!audio) {
      return NextResponse.json({ error: "No audio returned from Sarvam" }, { status: 502 });
    }

    return NextResponse.json({ audio });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
