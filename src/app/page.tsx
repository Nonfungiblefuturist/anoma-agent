"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SessionSidebar } from "@/components/sidebar/SessionSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { InputArea } from "@/components/chat/InputArea";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";

export default function Home() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  // Load model preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("anoma-model");
    if (saved && MODELS.some((m) => m.id === saved)) {
      setSelectedModel(saved);
    }
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("anoma-model", modelId);
  }, []);

  const sessions = useQuery(api.sessions.list) ?? [];
  const createSession = useMutation(api.sessions.create);
  const activeSession = sessions.find((s) => s._id === activeSessionId);
  const messages = useQuery(
    api.messages.listBySession,
    activeSessionId
      ? { sessionId: activeSessionId as Id<"sessions"> }
      : "skip"
  );

  // Auto-select first session
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0]._id);
    }
  }, [sessions, activeSessionId]);

  const handleSend = useCallback(
    async (userMessage: string) => {
      let sessionId = activeSessionId;

      if (!sessionId) {
        sessionId = await createSession({
          title:
            userMessage.slice(0, 50) +
            (userMessage.length > 50 ? "..." : ""),
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
              if (event.type === "text") {
                setStreamingText((prev) => prev + event.text);
              } else if (event.type === "error") {
                console.error("Agent error:", event.error);
              }
            } catch {
              // ignore
            }
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
      className="h-screen w-screen flex overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(120,80,30,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(60,40,20,0.06) 0%, transparent 50%), #0a0a0b",
      }}
    >
      <SessionSidebar
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/40 bg-zinc-950/50 backdrop-blur-sm">
          <button
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-400"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[14px] font-semibold text-zinc-200 truncate">
              {activeSession?.title ?? "Anoma Agent"}
            </h1>
            <div className="text-[11px] text-zinc-600">
              {MODELS.find((m) => m.id === selectedModel)?.label ?? selectedModel}
              {messageCount > 0 && (
                <>
                  {" "}
                  &middot; {messageCount} message
                  {messageCount !== 1 && "s"}
                </>
              )}
              {activeSession && activeSession.totalCostUsd > 0 && (
                <> &middot; ${activeSession.totalCostUsd.toFixed(4)}</>
              )}
            </div>
          </div>
        </header>

        {/* Chat area */}
        <ChatArea
          messages={chatMessages}
          streamingText={streamingText}
          isStreaming={isStreaming}
        />

        {/* Input */}
        <InputArea
          onSend={handleSend}
          disabled={isStreaming}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      </main>
    </div>
  );
}
