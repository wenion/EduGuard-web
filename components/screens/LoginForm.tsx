"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Username"
        value={username}
        onChange={(e) => setU(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setP(e.target.value)}
      />
      <button disabled={loading} className="border rounded px-3 py-2 w-full">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
