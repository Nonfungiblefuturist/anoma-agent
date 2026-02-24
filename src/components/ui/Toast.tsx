"use client";

import { useState, useCallback, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastCounter = 0;
let globalAddToast: ((message: string, type?: Toast["type"]) => void) | null = null;

export function addToast(message: string, type: Toast["type"] = "success") {
  globalAddToast?.(message, type);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = String(++toastCounter);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    globalAddToast = add;
    return () => { globalAddToast = null; };
  }, [add]);

  return { toasts, addToast: add };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-zinc-200 animate-[fadeIn_0.2s_ease-out]"
          style={{
            background: "rgba(14,14,16,0.95)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              t.type === "success" ? "bg-emerald-400" : t.type === "error" ? "bg-red-400" : "bg-blue-400"
            }`}
          />
          {t.message}
        </div>
      ))}
    </div>
  );
}
