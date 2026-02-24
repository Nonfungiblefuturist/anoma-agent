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
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    let html = line.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-zinc-100 font-semibold">$1</strong>'
    );
    // Inline code
    html = html.replace(
      /`(.+?)`/g,
      '<code class="bg-zinc-800/60 px-1.5 py-0.5 rounded text-amber-300/90 text-[0.85em] font-mono">$1</code>'
    );
    // Blockquote
    if (line.startsWith("> ")) {
      return (
        <div
          key={i}
          className="border-l-2 border-zinc-600 pl-3 my-1 text-zinc-400 text-[0.92em]"
          dangerouslySetInnerHTML={{ __html: html.slice(2) }}
        />
      );
    }
    // Bullet
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div
          key={i}
          className="pl-4 my-0.5 text-zinc-300"
          dangerouslySetInnerHTML={{ __html: "\u203A " + html.slice(2) }}
        />
      );
    }
    // Empty line
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <div key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

function formatTime(ts?: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({
  role,
  content,
  inputTokens,
  outputTokens,
  costUsd,
  createdAt,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] ${
          isUser
            ? "bg-gradient-to-br from-zinc-700/80 to-zinc-800/90 rounded-2xl rounded-br-md"
            : "bg-zinc-900/40 border border-zinc-800/60 rounded-2xl rounded-bl-md"
        } px-4 py-3 backdrop-blur-sm`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-[9px] font-bold text-black">A</span>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">
              Anoma
            </span>
          </div>
        )}

        <div
          className={`text-[14px] leading-relaxed ${
            isUser ? "text-zinc-200" : "text-zinc-300"
          }`}
        >
          {renderContent(content)}
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/40">
          <span className="text-[10px] text-zinc-600">{formatTime(createdAt)}</span>
          <TokenUsage
            inputTokens={inputTokens}
            outputTokens={outputTokens}
            costUsd={costUsd}
          />
        </div>
      </div>
    </div>
  );
}
