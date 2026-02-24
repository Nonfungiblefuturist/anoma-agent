"use client";

interface StreamingBubbleProps {
  text: string;
}

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    let html = line.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-zinc-100 font-semibold">$1</strong>'
    );
    html = html.replace(
      /`(.+?)`/g,
      '<code class="bg-zinc-800/60 px-1.5 py-0.5 rounded text-amber-300/90 text-[0.85em] font-mono">$1</code>'
    );
    if (line.startsWith("> ")) {
      return (
        <div
          key={i}
          className="border-l-2 border-zinc-600 pl-3 my-1 text-zinc-400 text-[0.92em]"
          dangerouslySetInnerHTML={{ __html: html.slice(2) }}
        />
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div
          key={i}
          className="pl-4 my-0.5 text-zinc-300"
          dangerouslySetInnerHTML={{ __html: "\u203A " + html.slice(2) }}
        />
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <div key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

export function StreamingBubble({ text }: StreamingBubbleProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] md:max-w-[70%] bg-zinc-900/40 border border-zinc-800/60 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center animate-pulse">
            <span className="text-[9px] font-bold text-black">A</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">
            Anoma
          </span>
          <div className="flex gap-0.5 ml-1">
            <div
              className="w-1 h-1 rounded-full bg-amber-500/60 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-1 rounded-full bg-amber-500/60 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 rounded-full bg-amber-500/60 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
        <div className="text-[14px] leading-relaxed text-zinc-300">
          {text ? (
            renderContent(text)
          ) : (
            <span className="text-zinc-600 italic">thinking...</span>
          )}
        </div>
      </div>
    </div>
  );
}
