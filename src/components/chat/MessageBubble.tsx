"use client";

import { useState, useRef, useCallback } from "react";
import { TokenUsage } from "./TokenUsage";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  createdAt?: number;
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e4e4e7;font-weight:600">$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:4px;color:#fbbf24;font-size:0.85em;font-family:JetBrains Mono,monospace">$1</code>');
    if (line.startsWith("> "))
      return <div key={i} style={{ borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: 12, margin: "4px 0", color: "#a1a1aa", fontSize: "0.92em" }} dangerouslySetInnerHTML={{ __html: html.slice(2) }} />;
    if (line.startsWith("\u203A "))
      return <div key={i} style={{ paddingLeft: 16, margin: "2px 0", color: "#d4d4d8" }} dangerouslySetInnerHTML={{ __html: html }} />;
    if (line.startsWith("- ") || line.startsWith("* "))
      return <div key={i} style={{ paddingLeft: 16, margin: "2px 0", color: "#d4d4d8" }} dangerouslySetInnerHTML={{ __html: "\u203A " + html.replace(/^[-*]\s/, "") }} />;
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Strip markdown for TTS
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s/gm, "")
    .replace(/^[-*\u203A]\s/gm, "")
    .replace(/#{1,6}\s/g, "");
}

function SpeakerButton({ content }: { content: string }) {
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTts = useCallback(async () => {
    if (ttsState === "playing") {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setTtsState("idle");
      return;
    }

    setTtsState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: stripMarkdown(content) }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const { audio: base64 } = await res.json();
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setTtsState("idle");
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setTtsState("idle");
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      await audio.play();
      setTtsState("playing");
    } catch {
      setTtsState("idle");
    }
  }, [content, ttsState]);

  return (
    <button
      onClick={handleTts}
      className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-amber-400"
      title={ttsState === "playing" ? "Stop" : "Read aloud"}
    >
      {ttsState === "loading" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : ttsState === "playing" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}

export function MessageBubble({ role, content, inputTokens, outputTokens, costUsd, createdAt }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 ${
          isUser
            ? "rounded-[20px] rounded-br-lg glass-panel"
            : "rounded-[20px] rounded-bl-lg"
        }`}
        style={
          isUser
            ? { background: "rgba(255,255,255,0.05)" }
            : {
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
              }
        }
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: "#000" }}>A</span>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">Anoma</span>
          </div>
        )}

        <div className={`text-[14px] leading-[1.65] ${isUser ? "text-zinc-200" : "text-zinc-300"}`}>
          {renderContent(content)}
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-600">{formatTime(createdAt)}</span>
            {!isUser && <SpeakerButton content={content} />}
          </div>
          <TokenUsage inputTokens={inputTokens} outputTokens={outputTokens} costUsd={costUsd} />
        </div>
      </div>
    </div>
  );
}
