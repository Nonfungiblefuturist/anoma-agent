"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { StreamingBubble } from "./StreamingBubble";

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  createdAt?: number;
}

interface ChatAreaProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
}

export function ChatArea({ messages, streamingText, isStreaming }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ea580c, #e11d48)",
                  boxShadow: "0 12px 32px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="text-2xl font-bold text-black">A</span>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-1">Anoma Agent</h2>
              <p className="text-[13px] text-zinc-600">Memory-enabled. Persistent across sessions.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            role={msg.role}
            content={msg.content}
            inputTokens={msg.inputTokens}
            outputTokens={msg.outputTokens}
            costUsd={msg.costUsd}
            createdAt={msg.createdAt}
          />
        ))}

        {isStreaming && <StreamingBubble text={streamingText} />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
