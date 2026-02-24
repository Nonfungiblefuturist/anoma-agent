"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface SessionSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

function formatSessionTime(ts: number): string {
  const now = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) {
    return (
      "Today, " +
      date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    );
  }
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function SessionSidebar({
  activeSessionId,
  onSelectSession,
  open,
  onClose,
}: SessionSidebarProps) {
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
      if (remaining.length > 0) {
        onSelectSession(remaining[0]._id);
      }
    }
    await removeSession({ id });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-72 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-4 pb-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <span className="text-sm font-bold text-black tracking-tight">
                A
              </span>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-100 tracking-tight">
                Anoma
              </div>
              <div className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
                Agent v1
              </div>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/30 hover:border-zinc-600/50 transition-all text-[13px] text-zinc-300 font-medium"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          <div className="text-[10px] font-medium text-zinc-600 tracking-widest uppercase px-3 py-2">
            Sessions
          </div>
          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => {
                onSelectSession(session._id);
                onClose();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                activeSessionId === session._id
                  ? "bg-zinc-800/80 border border-zinc-700/50"
                  : "hover:bg-zinc-800/40 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-zinc-300 font-medium truncate flex-1">
                  {session.title}
                </div>
                <button
                  onClick={(e) => handleDelete(e, session._id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 ml-2 transition-opacity text-xs"
                  title="Delete"
                >
                  &times;
                </button>
              </div>
              <div className="text-[11px] text-zinc-600 mt-0.5">
                {formatSessionTime(session.updatedAt)}
              </div>
            </button>
          ))}

          {sessions.length === 0 && (
            <p className="text-zinc-600 text-xs text-center mt-8 px-4">
              No sessions yet.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-zinc-400">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-zinc-400 font-medium truncate">
                Surzayon
              </div>
              <div className="text-[10px] text-zinc-600">The Anoma Company</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
