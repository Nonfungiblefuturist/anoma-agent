export interface AccentTheme {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  tertiary: string;
  shadow: string;
  shadowStrong: string;
  glow: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  preview: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id: "amber",
    label: "Amber",
    primary: "#f59e0b",
    secondary: "#ea580c",
    tertiary: "#e11d48",
    shadow: "rgba(245, 158, 11, 0.2)",
    shadowStrong: "rgba(245, 158, 11, 0.3)",
    glow: "rgba(245, 158, 11, 0.08)",
    text: "#fbbf24",
    badgeBg: "rgba(245, 158, 11, 0.1)",
    badgeText: "#f59e0b",
    dot: "#f59e0b",
    preview: "linear-gradient(135deg, #f59e0b, #ea580c, #e11d48)",
  },
  {
    id: "cyan",
    label: "Cyan",
    primary: "#06b6d4",
    secondary: "#0891b2",
    tertiary: "#0e7490",
    shadow: "rgba(6, 182, 212, 0.2)",
    shadowStrong: "rgba(6, 182, 212, 0.3)",
    glow: "rgba(6, 182, 212, 0.08)",
    text: "#67e8f9",
    badgeBg: "rgba(6, 182, 212, 0.1)",
    badgeText: "#06b6d4",
    dot: "#06b6d4",
    preview: "linear-gradient(135deg, #06b6d4, #0891b2, #0e7490)",
  },
  {
    id: "purple",
    label: "Purple",
    primary: "#a855f7",
    secondary: "#9333ea",
    tertiary: "#7c3aed",
    shadow: "rgba(168, 85, 247, 0.2)",
    shadowStrong: "rgba(168, 85, 247, 0.3)",
    glow: "rgba(168, 85, 247, 0.08)",
    text: "#c084fc",
    badgeBg: "rgba(168, 85, 247, 0.1)",
    badgeText: "#a855f7",
    dot: "#a855f7",
    preview: "linear-gradient(135deg, #a855f7, #9333ea, #7c3aed)",
  },
  {
    id: "emerald",
    label: "Emerald",
    primary: "#10b981",
    secondary: "#059669",
    tertiary: "#047857",
    shadow: "rgba(16, 185, 129, 0.2)",
    shadowStrong: "rgba(16, 185, 129, 0.3)",
    glow: "rgba(16, 185, 129, 0.08)",
    text: "#6ee7b7",
    badgeBg: "rgba(16, 185, 129, 0.1)",
    badgeText: "#10b981",
    dot: "#10b981",
    preview: "linear-gradient(135deg, #10b981, #059669, #047857)",
  },
  {
    id: "rose",
    label: "Rose",
    primary: "#f43f5e",
    secondary: "#e11d48",
    tertiary: "#be123c",
    shadow: "rgba(244, 63, 94, 0.2)",
    shadowStrong: "rgba(244, 63, 94, 0.3)",
    glow: "rgba(244, 63, 94, 0.08)",
    text: "#fb7185",
    badgeBg: "rgba(244, 63, 94, 0.1)",
    badgeText: "#f43f5e",
    dot: "#f43f5e",
    preview: "linear-gradient(135deg, #f43f5e, #e11d48, #be123c)",
  },
];

export const DEFAULT_ACCENT = "amber";
