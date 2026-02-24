"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import { MODELS, type Model } from "@/lib/models";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function InputArea({
  onSend,
  disabled,
  selectedModel,
  onModelChange,
}: InputAreaProps) {
  const [text, setText] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // Close menu on outside click
  useEffect(() => {
    if (!modelMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modelMenuOpen]);

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl border border-zinc-700/50 bg-zinc-900/60 backdrop-blur-sm overflow-hidden transition-all focus-within:border-zinc-600/60 focus-within:shadow-lg focus-within:shadow-amber-500/5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-[14px] text-zinc-200 placeholder-zinc-600 px-4 pt-3.5 pb-12 resize-none focus:outline-none"
            style={{ minHeight: "56px", maxHeight: "160px" }}
          />

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-px bg-zinc-800 mx-1" />
              {/* Model switcher */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setModelMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-800/60 transition-colors text-[11px] font-medium text-zinc-500"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-zinc-500"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  {currentModel.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`text-zinc-600 transition-transform ${modelMenuOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {modelMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl shadow-xl shadow-black/40 py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-600 tracking-widest uppercase">
                      Model
                    </div>
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModelChange(m.id);
                          setModelMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 transition-colors ${
                          m.id === selectedModel
                            ? "bg-zinc-800/80"
                            : "hover:bg-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium text-zinc-200">
                            {m.label}
                          </span>
                          {m.id === selectedModel && (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {m.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={disabled || !text.trim()}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                text.trim() && !disabled
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 active:scale-95"
                  : "bg-zinc-800 cursor-not-allowed"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={text.trim() && !disabled ? "#000" : "#52525b"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-700">
            Anoma Agent &middot; Memory-enabled &middot; Persistent across
            sessions
          </span>
        </div>
      </div>
    </div>
  );
}
