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
          "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(20,20,22,1) 0%, #0a0a0b 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-xs px-6"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ea580c, #e11d48)",
            boxShadow: "0 12px 32px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
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
          className="w-full rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/30 transition-colors glass-input"
          style={{ background: "rgba(255,255,255,0.02)" }}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
            password
              ? "text-black bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
              : "text-zinc-500 bg-white/[0.04] cursor-not-allowed"
          }`}
        >
          {loading ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
