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
    <div className="flex items-center justify-center h-screen bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-xs px-6"
      >
        <div className="text-3xl mb-2">✦</div>
        <h1 className="text-xl font-medium text-zinc-200">Anoma</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
        >
          {loading ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
