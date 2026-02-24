"use client";

interface TokenUsageProps {
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}

export function TokenUsage({
  inputTokens,
  outputTokens,
  costUsd,
}: TokenUsageProps) {
  if (!inputTokens && !outputTokens) return null;

  const total = (inputTokens ?? 0) + (outputTokens ?? 0);

  return (
    <span className="text-[10px] text-zinc-600 font-mono">
      {total.toLocaleString()} tok
      {costUsd != null && <> &middot; ${costUsd.toFixed(4)}</>}
    </span>
  );
}
