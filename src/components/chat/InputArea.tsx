"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import { MODELS } from "@/lib/models";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function InputArea({ onSend, disabled, selectedModel, onModelChange }: InputAreaProps) {
  const [text, setText] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!modelMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modelMenuOpen]);

  const sendActive = !!text.trim() && !disabled;

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="max-w-3xl mx-auto relative" ref={containerRef}>
        {/* Model dropdown — positioned above the input bar */}
        {modelMenuOpen && (
          <div
            className="absolute bottom-full left-4 mb-3 w-52 rounded-2xl py-1 z-50"
            style={{
              background: "rgba(14,14,16,0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="px-3 py-2 text-[10px] font-medium text-zinc-600 tracking-[0.12em] uppercase">Model</div>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onModelChange(m.id); setModelMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  m.id === selectedModel ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-zinc-200">{m.label}</span>
                  {m.id === selectedModel && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", boxShadow: "0 0 6px rgba(245,158,11,0.5)" }}
                    />
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{m.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div
          className="relative rounded-[20px] glass-panel transition-all"
          style={{
            background: "rgba(255,255,255,0.025)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-[14px] text-zinc-200 placeholder-zinc-600 px-5 pt-4 pb-12 resize-none focus:outline-none rounded-[20px]"
            style={{ minHeight: 56, maxHeight: 140 }}
          />

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-px bg-white/[0.06]" />
              <button
                onClick={() => setModelMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] transition-colors text-[11px] font-medium text-zinc-500"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                {currentModel.label}
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: modelMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!sendActive}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                sendActive
                  ? "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 active:scale-95"
                  : "cursor-not-allowed"
              }`}
              style={
                sendActive
                  ? {
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                      boxShadow: "0 4px 16px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }
                  : { background: "rgba(255,255,255,0.04)" }
              }
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={sendActive ? "#000" : "#52525b"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-2.5">
          <span className="text-[10px] text-zinc-700">Anoma Agent &middot; Memory-enabled &middot; Persistent across sessions</span>
        </div>
      </div>
    </div>
  );
}
