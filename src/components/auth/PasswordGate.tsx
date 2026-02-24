"use client";

import { useState, FormEvent } from "react";

export function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, var(--accent-glow) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(20,20,22,1) 0%, #0a0a0b 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-xs px-6"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background: "var(--accent-gradient)",
            boxShadow: `0 12px 32px var(--accent-shadow), inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          <span className="text-xl font-bold text-black">A</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Anoma</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors glass-input"
          style={{ background: "rgba(255,255,255,0.02)" }}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
            password
              ? "text-black hover:scale-[1.02] active:scale-[0.98]"
              : "text-zinc-500 bg-white/[0.04] cursor-not-allowed"
          }`}
          style={
            password
              ? { background: "var(--accent-gradient-2)", boxShadow: `0 8px 24px var(--accent-shadow), inset 0 1px 0 rgba(255,255,255,0.15)` }
              : undefined
          }
        >
          {loading ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
