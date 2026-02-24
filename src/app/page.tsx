"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SessionSidebar } from "@/components/sidebar/SessionSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { InputArea } from "@/components/chat/InputArea";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export default function Home() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const sessions = useQuery(api.sessions.list) ?? [];
  const createSession = useMutation(api.sessions.create);
  const activeSession = sessions.find((s) => s._id === activeSessionId);
  const messages = useQuery(
    api.messages.listBySession,
    activeSessionId ? { sessionId: activeSessionId as Id<"sessions"> } : "skip"
  );

  // Load model from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("anoma-model");
    if (saved && MODELS.some((m) => m.id === saved)) setSelectedModel(saved);
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("anoma-model", modelId);
  }, []);

  // Auto-select first session
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) setActiveSessionId(sessions[0]._id);
  }, [sessions, activeSessionId]);

  const handleSend = useCallback(
    async (userMessage: string) => {
      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = await createSession({
          title: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
        });
        setActiveSessionId(sessionId);
      }

      setIsStreaming(true);
      setStreamingText("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userMessage, model: selectedModel }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "text") setStreamingText((prev) => prev + event.text);
              else if (event.type === "error") console.error("Agent error:", event.error);
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
      } finally {
        setIsStreaming(false);
        setStreamingText("");
      }
    },
    [activeSessionId, createSession, selectedModel]
  );

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setStreamingText("");
    setIsStreaming(false);
  }, []);

  const messageCount = messages?.length ?? 0;
  const currentModelLabel = MODELS.find((m) => m.id === selectedModel)?.label ?? selectedModel;

  const chatMessages = (messages ?? []).map((m) => ({
    _id: m._id,
    role: m.role,
    content: m.content,
    inputTokens: m.inputTokens ?? undefined,
    outputTokens: m.outputTokens ?? undefined,
    costUsd: m.costUsd ?? undefined,
    createdAt: m.createdAt,
  }));

  return (
    <div
      className="h-screen w-screen flex overflow-hidden font-sans text-zinc-300"
      style={{
        background:
          "radial-gradient(ellipse at 15% -10%, rgba(245,158,11,0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 110%, rgba(168,85,247,0.03) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(20,20,22,1) 0%, #0a0a0b 100%)",
      }}
    >
      <SessionSidebar
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-5 py-3.5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(10,10,12,0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <button
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-white/[0.04] transition-colors text-zinc-400"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-semibold text-zinc-100 truncate">
              {activeSession?.title ?? "Anoma Agent"}
            </h1>
            <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
              {currentModelLabel}
              {messageCount > 0 && <>&nbsp;&middot; {messageCount} message{messageCount !== 1 && "s"}</>}
              {activeSession && activeSession.totalCostUsd > 0 && <>&nbsp;&middot; ${activeSession.totalCostUsd.toFixed(4)}</>}
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl transition-all text-zinc-400 hover:text-zinc-200 glass-button glass-panel-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </header>

        <ChatArea messages={chatMessages} streamingText={streamingText} isStreaming={isStreaming} />

        <InputArea
          onSend={handleSend}
          disabled={isStreaming}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
