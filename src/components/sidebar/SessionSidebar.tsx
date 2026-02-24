"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface SessionSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

function formatSessionTime(ts: number): string {
  const now = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today, " + date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function SessionSidebar({ activeSessionId, onSelectSession, open, onClose, onOpenSettings }: SessionSidebarProps) {
  const sessions = useQuery(api.sessions.list) ?? [];
  const createSession = useMutation(api.sessions.create);
  const removeSession = useMutation(api.sessions.remove);

  const handleNew = async () => {
    const id = await createSession({ title: "New Chat" });
    onSelectSession(id);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"sessions">) => {
    e.stopPropagation();
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s._id !== id);
      if (remaining.length > 0) onSelectSession(remaining[0]._id);
    }
    await removeSession({ id });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-72 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          background: "rgba(10,10,12,0.7)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Logo */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ea580c, #e11d48)",
                boxShadow: "0 8px 24px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-sm font-bold text-black tracking-tight">A</span>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-50 tracking-tight">Anoma</div>
              <div className="text-[10px] text-zinc-500 font-medium tracking-[0.15em] uppercase">Agent v1</div>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-4 pb-2">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl transition-all text-[13px] text-zinc-300 font-medium glass-button glass-panel-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1">
          <div className="text-[10px] font-medium text-zinc-600 tracking-[0.15em] uppercase px-3 py-2.5">Sessions</div>
          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => { onSelectSession(session._id); onClose(); }}
              className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                activeSessionId === session._id
                  ? "glass-panel glass-glow"
                  : "hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-medium truncate flex-1 ${activeSessionId === session._id ? "text-zinc-100" : "text-zinc-400"}`}>
                  {session.title}
                </span>
                <button
                  onClick={(e) => handleDelete(e, session._id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs ml-2 transition-opacity"
                >
                  &times;
                </button>
              </div>
              <div className="text-[11px] text-zinc-600 mt-0.5">{formatSessionTime(session.updatedAt)}</div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-zinc-600 text-xs text-center mt-8 px-4">No sessions yet.</p>
          )}
        </div>

        {/* Settings + Footer */}
        <div className="p-4 border-t border-white/[0.04]">
          <button
            onClick={() => { onOpenSettings(); onClose(); }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl transition-all text-[12px] text-zinc-400 font-medium mb-3 glass-button glass-panel-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Agent Settings
          </button>
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-zinc-300">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-zinc-300 font-medium truncate">Surzayon</div>
              <div className="text-[10px] text-zinc-600">The Anoma Company</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
