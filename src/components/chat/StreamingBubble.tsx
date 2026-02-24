"use client";

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e4e4e7;font-weight:600">$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:4px;color:var(--accent-text);font-size:0.85em;font-family:JetBrains Mono,monospace">$1</code>');
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

export function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] md:max-w-[75%] rounded-[20px] rounded-bl-lg px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: "var(--accent-gradient-2)", boxShadow: `0 2px 8px var(--accent-shadow-strong)` }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: "#000" }}>A</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">Anoma</span>
          <div className="flex gap-0.5 ml-1">
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: "var(--accent-dot)", opacity: 0.6, animationDelay: "0ms" }} />
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: "var(--accent-dot)", opacity: 0.6, animationDelay: "150ms" }} />
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: "var(--accent-dot)", opacity: 0.6, animationDelay: "300ms" }} />
          </div>
        </div>
        <div className="text-[14px] leading-[1.65] text-zinc-300">
          {text ? renderContent(text) : <span className="text-zinc-600 italic">thinking...</span>}
        </div>
      </div>
    </div>
  );
}
