export interface Model {
  id: string;
  label: string;
  description: string;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export const MODELS: Model[] = [
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    description: "Fast & capable",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Haiku 4.5",
    description: "Fastest, cheapest",
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
  },
  {
    id: "claude-sonnet-4-5-20250929",
    label: "Sonnet 4.5",
    description: "Best balance",
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
];

export const DEFAULT_MODEL = "claude-sonnet-4-6";
