"use client";

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
          <span className="text-[10px] text-zinc-600">{formatTime(createdAt)}</span>
          <TokenUsage inputTokens={inputTokens} outputTokens={outputTokens} costUsd={costUsd} />
        </div>
      </div>
    </div>
  );
}
