"use client";

import { useState, useEffect, useCallback } from "react";
import { addToast } from "@/components/ui/Toast";
import { ACCENT_THEMES } from "@/lib/themes";
import { useAccent } from "@/components/providers/AccentProvider";
import { MODELS } from "@/lib/models";

interface Skill {
  name: string;
  file: string;
  content: string;
  enabled: boolean;
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
  masked: boolean;
}

type TabId = "soul" | "skills" | "memory" | "config" | "appearance";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SARVAM_SPEAKERS = [
  { id: "ritu", label: "Ritu", description: "Female, warm" },
  { id: "priya", label: "Priya", description: "Female, clear" },
  { id: "aditya", label: "Aditya", description: "Male, deep" },
  { id: "neha", label: "Neha", description: "Female, bright" },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<TabId>("soul");
  const { accentId, setAccent } = useAccent();

  // Soul
  const [soulText, setSoulText] = useState("");
  const [soulDirty, setSoulDirty] = useState(false);
  const [soulSaving, setSoulSaving] = useState(false);

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillContent, setSkillContent] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillContent, setNewSkillContent] = useState("");

  // Memory
  const [memories, setMemories] = useState<Memory[]>([]);
  const [addingMemory, setAddingMemory] = useState(false);
  const [newMemType, setNewMemType] = useState<"persistent" | "session" | "archival">("persistent");
  const [newMemContent, setNewMemContent] = useState("");
  const [newMemTags, setNewMemTags] = useState("");

  // Config
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [speaker, setSpeaker] = useState("ritu");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-6");
  const [addingEnv, setAddingEnv] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  // Fetch data when opening
  useEffect(() => {
    if (!open) return;
    fetch("/api/settings/soul")
      .then((r) => r.json())
      .then((d) => { setSoulText(d.content); setSoulDirty(false); })
      .catch(() => {});
    fetch("/api/settings/skills")
      .then((r) => r.json())
      .then((d) => setSkills(d.skills || []))
      .catch(() => {});
    fetch("/api/settings/memories")
      .then((r) => r.json())
      .then((d) => setMemories(d.memories || []))
      .catch(() => {});
    fetch("/api/settings/env")
      .then((r) => r.json())
      .then((d) => setEnvVars((d.vars || []).map((v: EnvVar) => ({ ...v, masked: v.sensitive }))))
      .catch(() => {});
    fetch("/api/settings/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.voice?.speaker) setSpeaker(cfg.voice.speaker);
        if (cfg.defaultModel) setDefaultModel(cfg.defaultModel);
      })
      .catch(() => {});
  }, [open]);

  // ── Soul ──
  const saveSoul = useCallback(async () => {
    setSoulSaving(true);
    try {
      const res = await fetch("/api/settings/soul", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: soulText }),
      });
      if (res.ok) {
        setSoulDirty(false);
        addToast("Soul saved successfully");
      } else {
        addToast("Failed to save soul", "error");
      }
    } catch {
      addToast("Failed to save soul", "error");
    }
    setSoulSaving(false);
  }, [soulText]);

  // ── Skills ──
  const saveSkill = useCallback(async () => {
    if (!editingSkill) return;
    try {
      const res = await fetch("/api/settings/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: editingSkill.file, content: skillContent }),
      });
      if (res.ok) {
        setSkills((prev) => prev.map((s) => s.file === editingSkill.file ? { ...s, content: skillContent } : s));
        setEditingSkill(null);
        addToast("Skill saved");
      } else {
        addToast("Failed to save skill", "error");
      }
    } catch {
      addToast("Failed to save skill", "error");
    }
  }, [editingSkill, skillContent]);

  const toggleSkill = useCallback(async (skill: Skill) => {
    const newEnabled = !skill.enabled;
    setSkills((prev) => prev.map((s) => s.file === skill.file ? { ...s, enabled: newEnabled } : s));
    try {
      await fetch("/api/settings/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: skill.file, enabled: newEnabled }),
      });
      addToast(newEnabled ? `${skill.name} enabled` : `${skill.name} disabled`);
    } catch {
      setSkills((prev) => prev.map((s) => s.file === skill.file ? { ...s, enabled: !newEnabled } : s));
      addToast("Failed to toggle skill", "error");
    }
  }, []);

  const deleteSkill = useCallback(async (skill: Skill) => {
    try {
      const res = await fetch("/api/settings/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: skill.file, delete: true }),
      });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.file !== skill.file));
        addToast("Skill deleted");
      }
    } catch {
      addToast("Failed to delete skill", "error");
    }
  }, []);

  const createSkill = useCallback(async () => {
    if (!newSkillName.trim() || !newSkillContent.trim()) return;
    try {
      const res = await fetch("/api/settings/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkillName.trim(), content: newSkillContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSkills((prev) => [...prev, { name: newSkillName.trim(), file: data.file, content: newSkillContent.trim(), enabled: true }]);
        setAddingSkill(false);
        setNewSkillName("");
        setNewSkillContent("");
        addToast("Skill created");
      } else {
        addToast("Failed to create skill", "error");
      }
    } catch {
      addToast("Failed to create skill", "error");
    }
  }, [newSkillName, newSkillContent]);

  // ── Memory ──
  const deleteMemory = useCallback(async (id: string) => {
    try {
      await fetch("/api/settings/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      addToast("Memory deleted");
    } catch {
      addToast("Failed to delete memory", "error");
    }
  }, []);

  const createMemory = useCallback(async () => {
    if (!newMemContent.trim()) return;
    try {
      const tags = newMemTags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/settings/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newMemType, content: newMemContent.trim(), tags }),
      });
      if (res.ok) {
        const data = await res.json();
        setMemories((prev) => [...prev, { id: data.id, type: newMemType, content: newMemContent.trim(), tags, createdAt: Date.now() }]);
        setAddingMemory(false);
        setNewMemContent("");
        setNewMemTags("");
        addToast("Memory saved");
      } else {
        addToast("Failed to save memory", "error");
      }
    } catch {
      addToast("Failed to save memory", "error");
    }
  }, [newMemType, newMemContent, newMemTags]);

  // ── Config ──
  const saveSpeaker = useCallback(async (newSpeaker: string) => {
    setSpeaker(newSpeaker);
    try {
      await fetch("/api/settings/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: { speaker: newSpeaker } }),
      });
      addToast(`Voice set to ${newSpeaker}`);
    } catch {
      addToast("Failed to save voice", "error");
    }
  }, []);

  const saveDefaultModel = useCallback(async (modelId: string) => {
    setDefaultModel(modelId);
    try {
      await fetch("/api/settings/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultModel: modelId }),
      });
      addToast("Default model saved");
    } catch {
      addToast("Failed to save model", "error");
    }
  }, []);

  const saveEnvVar = useCallback(async (key: string, value: string) => {
    try {
      const res = await fetch("/api/settings/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) addToast(`${key} saved`);
      else addToast("Failed to save variable", "error");
    } catch {
      addToast("Failed to save variable", "error");
    }
  }, []);

  const addEnvVar = useCallback(async () => {
    if (!newEnvKey.trim() || !newEnvValue.trim()) return;
    try {
      const res = await fetch("/api/settings/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newEnvKey.trim(), value: newEnvValue.trim() }),
      });
      if (res.ok) {
        setEnvVars((prev) => [...prev, { key: newEnvKey.trim(), value: newEnvValue.trim(), sensitive: false, masked: false }]);
        setAddingEnv(false);
        setNewEnvKey("");
        setNewEnvValue("");
        addToast("Variable added");
      }
    } catch {
      addToast("Failed to add variable", "error");
    }
  }, [newEnvKey, newEnvValue]);

  if (!open) return null;

  const tabs: { id: TabId; label: string; icon: () => React.JSX.Element; badge?: string }[] = [
    { id: "soul", label: "Soul", icon: EditIcon },
    { id: "skills", label: "Skills", icon: FileIcon, badge: String(skills.length) },
    { id: "memory", label: "Memory", icon: MemoryIcon, badge: String(memories.length) },
    { id: "config", label: "Config", icon: SettingsIcon },
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
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
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-gradient)", boxShadow: `0 4px 16px var(--accent-shadow)` }}
            >
              <span className="text-xs font-bold text-black">A</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Agent Settings</h2>
              <p className="text-[10px] text-zinc-500">Edit personality, skills, config & appearance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-400 hover:text-zinc-200">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 pb-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setEditingSkill(null); setAddingSkill(false); setAddingMemory(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all shrink-0 ${
                tab === t.id
                  ? "bg-white/[0.08] text-zinc-100 border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <t.icon />
              {t.label}
              {t.badge && t.badge !== "0" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-badge-bg)", color: "var(--accent-badge-text)" }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">

          {/* ═══ Soul Tab ═══ */}
          {tab === "soul" && (
            <div className="space-y-3">
              <p className="text-[11px] text-zinc-500 mb-3">
                Edit SOUL.md &mdash; defines your agent&apos;s personality, context, and communication style.
              </p>
              <textarea
                value={soulText}
                onChange={(e) => { setSoulText(e.target.value); setSoulDirty(true); }}
                className="w-full h-64 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 resize-none focus:outline-none transition-colors font-mono leading-relaxed glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end">
                <button
                  onClick={saveSoul}
                  disabled={!soulDirty || soulSaving}
                  className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    soulDirty ? "text-black hover:scale-[1.02] active:scale-[0.98]" : "text-zinc-500 bg-white/[0.04] cursor-not-allowed"
                  }`}
                  style={soulDirty ? { background: "var(--accent-gradient-2)", boxShadow: `0 4px 16px var(--accent-shadow)` } : undefined}
                >
                  {soulSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ═══ Skills Tab — List ═══ */}
          {tab === "skills" && !editingSkill && !addingSkill && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-zinc-500">
                  Manage agent skills &mdash; toggle, edit, delete, or add new ones.
                </p>
                <button
                  onClick={() => setAddingSkill(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-300 transition-all glass-button hover:bg-white/[0.08]"
                >
                  <PlusIcon /> Add Skill
                </button>
              </div>
              {skills.map((skill) => (
                <div
                  key={skill.file}
                  className="flex items-center justify-between p-3 rounded-2xl transition-all glass-panel glass-panel-hover"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-200">{skill.name}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">{skill.file}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{skill.content.split("\n")[0]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingSkill(skill); setSkillContent(skill.content); }}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-zinc-300"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => deleteSkill(skill)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-red-400"
                    >
                      <TrashIcon />
                    </button>
                    <button
                      onClick={() => toggleSkill(skill)}
                      className={`w-9 h-5 rounded-full transition-all relative`}
                      style={{ background: skill.enabled ? "var(--accent-primary)" : undefined }}
                    >
                      {!skill.enabled && <div className="absolute inset-0 rounded-full bg-zinc-700" />}
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        skill.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-[12px] text-zinc-600 text-center py-8">No skills yet. Add one to get started.</p>
              )}
            </div>
          )}

          {/* ═══ Skills Tab — Add New ═══ */}
          {tab === "skills" && addingSkill && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setAddingSkill(false)} className="text-zinc-500 hover:text-zinc-300 text-[12px]">&larr; Back</button>
                <span className="text-[13px] font-medium text-zinc-200">New Skill</span>
              </div>
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name (e.g. code-review)"
                className="w-full rounded-2xl px-4 py-2.5 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <textarea
                value={newSkillContent}
                onChange={(e) => setNewSkillContent(e.target.value)}
                placeholder="Skill content (markdown)..."
                className="w-full h-40 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none font-mono leading-relaxed glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setAddingSkill(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-400 glass-button">Cancel</button>
                <button
                  onClick={createSkill}
                  disabled={!newSkillName.trim() || !newSkillContent.trim()}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold text-black"
                  style={{ background: "var(--accent-gradient-2)", boxShadow: `0 4px 16px var(--accent-shadow)` }}
                >
                  Create Skill
                </button>
              </div>
            </div>
          )}

          {/* ═══ Skills Tab — Editor ═══ */}
          {tab === "skills" && editingSkill && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingSkill(null)} className="text-zinc-500 hover:text-zinc-300 text-[12px]">&larr; Back</button>
                <span className="text-[13px] font-medium text-zinc-200">{editingSkill.name}</span>
              </div>
              <textarea
                value={skillContent}
                onChange={(e) => setSkillContent(e.target.value)}
                className="w-full h-52 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 resize-none focus:outline-none font-mono leading-relaxed glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingSkill(null)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-400 glass-button">Cancel</button>
                <button
                  onClick={saveSkill}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold text-black"
                  style={{ background: "var(--accent-gradient-2)", boxShadow: `0 4px 16px var(--accent-shadow)` }}
                >
                  Save Skill
                </button>
              </div>
            </div>
          )}

          {/* ═══ Memory Tab ═══ */}
          {tab === "memory" && !addingMemory && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-zinc-500">
                  {memories.length} memor{memories.length === 1 ? "y" : "ies"} stored. These persist across sessions.
                </p>
                <button
                  onClick={() => setAddingMemory(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-300 transition-all glass-button hover:bg-white/[0.08]"
                >
                  <PlusIcon /> Add Memory
                </button>
              </div>
              {memories.length === 0 && (
                <p className="text-[12px] text-zinc-600 text-center py-8">No memories stored yet.</p>
              )}
              {memories.map((mem) => (
                <div key={mem.id} className="p-3 rounded-2xl glass-panel" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={
                        mem.type === "persistent"
                          ? { background: "var(--accent-badge-bg)", color: "var(--accent-badge-text)" }
                          : mem.type === "archival"
                            ? { background: "rgba(168,85,247,0.1)", color: "#a855f7" }
                            : { background: "rgba(59,130,246,0.1)", color: "#3b82f6" }
                      }
                    >
                      {mem.type}
                    </span>
                    <button onClick={() => deleteMemory(mem.id)} className="text-zinc-600 hover:text-red-400 transition-colors text-[11px]">&times;</button>
                  </div>
                  <p className="text-[13px] text-zinc-300 my-1">{mem.content}</p>
                  <div className="flex gap-1 mt-1.5">
                    {mem.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Memory Tab — Add New ═══ */}
          {tab === "memory" && addingMemory && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setAddingMemory(false)} className="text-zinc-500 hover:text-zinc-300 text-[12px]">&larr; Back</button>
                <span className="text-[13px] font-medium text-zinc-200">New Memory</span>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-1.5 block">Type</label>
                <div className="flex gap-2">
                  {(["persistent", "session", "archival"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewMemType(t)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                        newMemType === t ? "bg-white/[0.08] text-zinc-100 border border-white/[0.1]" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newMemContent}
                onChange={(e) => setNewMemContent(e.target.value)}
                placeholder="Memory content..."
                className="w-full h-28 rounded-2xl px-4 py-3 text-[13px] text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <input
                value={newMemTags}
                onChange={(e) => setNewMemTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full rounded-2xl px-4 py-2.5 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none glass-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setAddingMemory(false)} className="px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-400 glass-button">Cancel</button>
                <button
                  onClick={createMemory}
                  disabled={!newMemContent.trim()}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold text-black"
                  style={{ background: "var(--accent-gradient-2)", boxShadow: `0 4px 16px var(--accent-shadow)` }}
                >
                  Save Memory
                </button>
              </div>
            </div>
          )}

          {/* ═══ Config Tab ═══ */}
          {tab === "config" && (
            <div className="space-y-5">
              {/* Voice */}
              <div>
                <h3 className="text-[12px] font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                  <SpeakerIcon /> Voice (Sarvam TTS)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SARVAM_SPEAKERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => saveSpeaker(s.id)}
                      className={`p-3 rounded-2xl text-left transition-all ${
                        speaker === s.id ? "glass-panel glass-glow" : "hover:bg-white/[0.03] border border-transparent"
                      }`}
                      style={speaker === s.id ? { background: "rgba(255,255,255,0.04)" } : { background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-zinc-200">{s.label}</span>
                        {speaker === s.id && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-primary)" }} />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Model */}
              <div>
                <h3 className="text-[12px] font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                  <BoltIcon /> Default Model
                </h3>
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => saveDefaultModel(m.id)}
                      className={`w-full p-3 rounded-2xl text-left transition-all ${
                        defaultModel === m.id ? "glass-panel glass-glow" : "hover:bg-white/[0.03] border border-transparent"
                      }`}
                      style={defaultModel === m.id ? { background: "rgba(255,255,255,0.04)" } : { background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[13px] font-medium text-zinc-200">{m.label}</span>
                          <span className="text-[11px] text-zinc-500 ml-2">{m.description}</span>
                        </div>
                        {defaultModel === m.id && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-primary)" }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Env Variables */}
              <div>
                <h3 className="text-[12px] font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                  <KeyIcon /> Environment Variables
                </h3>
                <div className="space-y-2">
                  {envVars.map((v, i) => (
                    <div key={v.key} className="p-3 rounded-2xl glass-panel" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="text-[11px] font-mono mb-1" style={{ color: "var(--accent-text)" }}>{v.key}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type={v.masked ? "password" : "text"}
                          value={v.value}
                          onChange={(e) => {
                            const updated = [...envVars];
                            updated[i] = { ...v, value: e.target.value };
                            setEnvVars(updated);
                          }}
                          className="flex-1 bg-transparent text-[13px] text-zinc-300 font-mono focus:outline-none"
                        />
                        {v.sensitive && (
                          <button
                            onClick={() => {
                              const updated = [...envVars];
                              updated[i] = { ...v, masked: !v.masked };
                              setEnvVars(updated);
                            }}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                          >
                            {v.masked ? "Show" : "Hide"}
                          </button>
                        )}
                        <button
                          onClick={() => saveEnvVar(v.key, v.value)}
                          className="text-[10px] font-medium px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                          style={{ color: "var(--accent-text)" }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {!addingEnv ? (
                  <button
                    onClick={() => setAddingEnv(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-300 mt-3 glass-button hover:bg-white/[0.08]"
                  >
                    <PlusIcon /> Add Variable
                  </button>
                ) : (
                  <div className="mt-3 p-3 rounded-2xl glass-panel space-y-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <input
                      value={newEnvKey}
                      onChange={(e) => setNewEnvKey(e.target.value)}
                      placeholder="KEY_NAME"
                      className="w-full bg-transparent text-[13px] text-zinc-200 font-mono focus:outline-none placeholder-zinc-600"
                    />
                    <input
                      value={newEnvValue}
                      onChange={(e) => setNewEnvValue(e.target.value)}
                      placeholder="value"
                      className="w-full bg-transparent text-[13px] text-zinc-300 font-mono focus:outline-none placeholder-zinc-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setAddingEnv(false)} className="text-[11px] text-zinc-500 px-2 py-1">Cancel</button>
                      <button onClick={addEnvVar} className="text-[11px] font-medium px-2 py-1" style={{ color: "var(--accent-text)" }}>Add</button>
                    </div>
                  </div>
                )}
                <div className="mt-4 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-[11px] text-zinc-500">
                    Env changes update .env.local. For Railway deploys, set variables in the Railway dashboard or CLI.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Appearance Tab ═══ */}
          {tab === "appearance" && (
            <div className="space-y-5">
              <p className="text-[11px] text-zinc-500">
                Choose an accent color. Changes apply instantly and persist across sessions.
              </p>

              {/* Color swatches */}
              <div className="grid grid-cols-5 gap-3">
                {ACCENT_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setAccent(theme.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      accentId === theme.id ? "glass-panel glass-glow" : "hover:bg-white/[0.03] border border-transparent"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl"
                      style={{ background: theme.preview, boxShadow: accentId === theme.id ? `0 4px 16px ${theme.shadow}` : undefined }}
                    />
                    <span className={`text-[11px] font-medium ${accentId === theme.id ? "text-zinc-200" : "text-zinc-500"}`}>
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl glass-panel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="text-[11px] font-medium text-zinc-500 mb-3 tracking-wide uppercase">Live Preview</div>
                <div className="space-y-3">
                  {/* Avatar + gradient */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: "var(--accent-gradient)", boxShadow: `0 8px 24px var(--accent-shadow)` }}
                    >
                      <span className="text-sm font-bold text-black">A</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-zinc-100">Anoma Agent</div>
                      <div className="text-[11px] text-zinc-500">Accent preview</div>
                    </div>
                  </div>

                  {/* Inline code sample */}
                  <div className="text-[13px] text-zinc-300">
                    Use <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, color: "var(--accent-text)", fontSize: "0.85em", fontFamily: "JetBrains Mono, monospace" }}>inline code</code> for code references
                  </div>

                  {/* Sample buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold text-black"
                      style={{ background: "var(--accent-gradient-2)", boxShadow: `0 4px 16px var(--accent-shadow)` }}
                    >
                      Primary Button
                    </button>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent-badge-bg)", color: "var(--accent-badge-text)" }}>
                      Badge
                    </span>
                    <div className="w-9 h-5 rounded-full relative" style={{ background: "var(--accent-primary)" }}>
                      <div className="absolute top-0.5 translate-x-4 w-4 h-4 rounded-full bg-white shadow" />
                    </div>
                  </div>
                </div>
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
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
      <line x1="6" y1="2" x2="6" y2="6" /><line x1="18" y1="2" x2="18" y2="6" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="10.5" r="2" />
      <circle cx="8.5" cy="7.5" r="2" />
      <circle cx="6.5" cy="12.5" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}
