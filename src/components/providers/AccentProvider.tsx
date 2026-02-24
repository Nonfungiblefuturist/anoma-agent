"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ACCENT_THEMES, DEFAULT_ACCENT, AccentTheme } from "@/lib/themes";

interface AccentContextValue {
  accentId: string;
  accent: AccentTheme;
  setAccent: (id: string) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accentId: DEFAULT_ACCENT,
  accent: ACCENT_THEMES[0],
  setAccent: () => {},
});

export const useAccent = () => useContext(AccentContext);

function applyTheme(theme: AccentTheme) {
  const root = document.documentElement;
  root.style.setProperty("--accent-primary", theme.primary);
  root.style.setProperty("--accent-secondary", theme.secondary);
  root.style.setProperty("--accent-tertiary", theme.tertiary);
  root.style.setProperty("--accent-gradient", `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.tertiary})`);
  root.style.setProperty("--accent-gradient-2", `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
  root.style.setProperty("--accent-shadow", theme.shadow);
  root.style.setProperty("--accent-shadow-strong", theme.shadowStrong);
  root.style.setProperty("--accent-glow", theme.glow);
  root.style.setProperty("--accent-text", theme.text);
  root.style.setProperty("--accent-badge-bg", theme.badgeBg);
  root.style.setProperty("--accent-badge-text", theme.badgeText);
  root.style.setProperty("--accent-dot", theme.dot);
}

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accentId, setAccentId] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    const saved = localStorage.getItem("anoma-accent");
    if (saved && ACCENT_THEMES.some((t) => t.id === saved)) {
      setAccentId(saved);
      applyTheme(ACCENT_THEMES.find((t) => t.id === saved)!);
    } else {
      applyTheme(ACCENT_THEMES[0]);
    }
  }, []);

  useEffect(() => {
    const theme = ACCENT_THEMES.find((t) => t.id === accentId) ?? ACCENT_THEMES[0];
    applyTheme(theme);
  }, [accentId]);

  const setAccent = useCallback((id: string) => {
    setAccentId(id);
    localStorage.setItem("anoma-accent", id);
  }, []);

  const accent = ACCENT_THEMES.find((t) => t.id === accentId) ?? ACCENT_THEMES[0];

  return (
    <AccentContext.Provider value={{ accentId, accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}
