"use client";

import { useState, useEffect, useCallback } from "react";

interface Skill {
  name: string;
  file: string;
  content: string;
}

interface Memory {
  id: string;
  type: string;
  content: string;
  tags: string[];
  createdAt: number;
}

interface EnvVar {
  key: string;
  value: string;
  sensitive: boolean;
}

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<"soul" | "skills" | "memory" | "env">("soul");

  // Soul
  const [soulText, setSoulText] = useState("");
  const [soulDirty, setSoulDirty] = useState(false);
  const [soulSaving, setSoulSaving] = useState(false);

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillContent, setSkillContent] = useState("");

  // Memory
  const [memories, setMemories] = useState<Memory[]>([]);

  // Env
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {}
  );

  // Fetch data when opening
  useEffect(() => {
    if (!open) return;
    fetch("/api/settings/soul")
      .then((r) => r.json())
      .then((d) => {
        setSoulText(d.content);
        setSoulDirty(false);
      });
    fetch("/api/settings/skills")
      .then((r) => r.json())
      .then((d) => setSkills(d.skills));
    fetch("/api/settings/memories")
      .then((r) => r.json())
      .then((d) => setMemories(d.memories));
    fetch("/api/settings/env")
      .then((r) => r.json())
      .then((d) => setEnvVars(d.vars));
  }, [open]);

  const saveSoul = useCallback(async () => {
    setSoulSaving(true);
    await fetch("/api/settings/soul", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: soulText }),
    });
    setSoulDirty(false);
    setSoulSaving(false);
  }, [soulText]);

  const saveSkill = useCallback(async () => {
    if (!editingSkill) return;
    await fetch("/api/settings/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: editingSkill.file, content: skillContent }),
    });
    setSkills((prev) =>
      prev.map((s) =>
        s.file === editingSkill.file ? { ...s, content: skillContent } : s
      )
    );
    setEditingSkill(null);
  }, [editingSkill, skillContent]);

  const deleteMemory = useCallback(async (id: string) => {
    await fetch("/api/settings/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  if (!open) return null;

  const tabs = [
    { id: "soul" as const, label: "Soul", icon: EditIcon },
    { id: "skills" as const, label: "Skills", icon: FileIcon },
    { id: "memory" as const, label: "Memory", icon: MemoryIcon },
    { id: "env" as const, label: "Config", icon: GearIcon },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden glass-panel"
        style={{ background: "rgba(10,10,11,0.85)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl amber-gradient flex items-center justify-center"
              style={{
                boxShadow:
                  "0 8px 24px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-xs font-bold text-black">A</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Agent Settings
              </h2>
              <p className="text-[10px] text-zinc-500">
                Edit personality, skills & config
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setEditingSkill(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                tab === t.id
                  ? "bg-white/[0.08] text-zinc-100 border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <t.icon />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {/* Soul Tab */}
          {tab === "soul" && (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 mb-3">
                Edit SOUL.md — defines your agent&apos;s personality, context,
                and communication style.
              </p>
              <textarea
                value={soulText}
                onChange={(e) => {
                  setSoulText(e.target.value);
                  setSoulDirty(true);
                }}
                className="w-full h-64 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 resize-none focus:outline-none focus:border-amber-500/30 transition-colors font-mono leading-relaxed glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end">
                <button
                  onClick={saveSoul}
                  disabled={!soulDirty || soulSaving}
                  className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    soulDirty
                      ? "text-black bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
                      : "text-zinc-500 bg-white/[0.04] cursor-not-allowed"
                  }`}
                >
                  {soulSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Skills Tab — List */}
          {tab === "skills" && !editingSkill && (
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-500 mb-3">
                Manage agent skills — edit or view skill definitions.
              </p>
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-3 rounded-2xl glass-panel glass-panel-hover"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-200">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {skill.file}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                      {skill.content.split("\n")[0]}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSkill(skill);
                      setSkillContent(skill.content);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-zinc-300"
                  >
                    <EditIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab — Editor */}
          {tab === "skills" && editingSkill && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSkill(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-[12px]"
                >
                  &larr; Back
                </button>
                <span className="text-[13px] font-medium text-zinc-200">
                  {editingSkill.name}
                </span>
              </div>
              <textarea
                value={skillContent}
                onChange={(e) => setSkillContent(e.target.value)}
                className="w-full h-52 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 resize-none focus:outline-none focus:border-amber-500/30 font-mono leading-relaxed glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-400 glass-button"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSkill}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20"
                >
                  Save Skill
                </button>
              </div>
            </div>
          )}

          {/* Memory Tab */}
          {tab === "memory" && (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 mb-3">
                View and manage stored memories. These persist across sessions.
              </p>
              {memories.length === 0 && (
                <p className="text-[12px] text-zinc-600 text-center py-8">
                  No memories stored yet.
                </p>
              )}
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-2xl glass-panel"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        mem.type === "persistent"
                          ? "bg-amber-500/10 text-amber-400"
                          : mem.type === "archival"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {mem.type}
                    </span>
                    <button
                      onClick={() => deleteMemory(mem.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-[11px]"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-[13px] text-zinc-300 my-1">
                    {mem.content}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Env Tab */}
          {tab === "env" && (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 mb-3">
                Environment variables. Sensitive keys are partially masked.
              </p>
              {envVars.map((v) => (
                <div
                  key={v.key}
                  className="p-3 rounded-2xl glass-panel"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="text-[11px] font-mono text-amber-400/80 mb-1">
                    {v.key}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[13px] text-zinc-300 font-mono truncate">
                      {v.sensitive && !showSensitive[v.key]
                        ? v.value
                        : v.value}
                    </span>
                    {v.sensitive && (
                      <button
                        onClick={() =>
                          setShowSensitive((prev) => ({
                            ...prev,
                            [v.key]: !prev[v.key],
                          }))
                        }
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                      >
                        {showSensitive[v.key] ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03]">
                <p className="text-[11px] text-amber-400/80">
                  Env changes via API update .env.local. Railway deploys use
                  their own env vars set in the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Icons ──

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="2" x2="6" y2="6" />
      <line x1="18" y1="2" x2="18" y2="6" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
