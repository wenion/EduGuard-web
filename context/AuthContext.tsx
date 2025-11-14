"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LoginResponse } from "@/types/Auth";
import { loginRequest, logoutRequest, setShowPeerRequest } from "@/lib/authApi";

type AuthState = {
  token: string | null;
  user: LoginResponse["user"] | null;
  genaiAccess: boolean;
  expiresAt: number | null;       // epoch ms
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  selectedUnitId: number | null;
  setUnitId: (unitId: number | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  switchShowPeerRequest: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "app_auth_v1"; // localStorage key

function readStored(): Partial<LoginResponse> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function writeStored(data: Partial<LoginResponse> | null) {
  try {
    if (!data) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function updateStored(updates: Partial<LoginResponse>) {
  try {
    const existing = readStored() || {};
    const updated = { ...existing, ...updates };
    writeStored(updated);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [genaiAccess, setGenaiAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
  };

  const scheduleExpiry = (expMs: number) => {
    clearExpiryTimer();
    const now = Date.now();
    const delay = Math.max(0, Math.floor(expMs - now));
    expiryTimer.current = setTimeout(() => {
      // token expired → logout (or switch to a “re-login” screen)
      doLogout();
    }, delay);
  };

  // Initialize from localStorage
  useEffect(() => {
    const stored = readStored();
    if (stored?.token && typeof stored.expires_at === "number") {
      const exp = Math.floor(stored.expires_at);
      const now = Date.now();
      if (exp > now) {
        setToken(stored.token);
        setUser(stored.user ?? null);
        setGenaiAccess(!!stored.genai_access);
        setExpiresAt(exp);
        scheduleExpiry(exp);
      } else {
        writeStored(null);
      }
    }
    setLoading(false);
    // cleanup on unmount
    return clearExpiryTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogout = () => {
    clearExpiryTimer();
    setToken(null);
    setUser(null);
    setGenaiAccess(false);
    setExpiresAt(null);
    writeStored(null);
  };

  const login = async (username: string, password: string) => {
    setErr(null);
    setLoading(true);
    try {
      const data = await loginRequest(username, password);
      const exp = Math.floor(data.expires_at); // backend provides epoch ms (can be fractional)
      setToken(data.token);
      setUser(data.user);
      setGenaiAccess(!!data.genai_access);
      setExpiresAt(exp);
      writeStored({
        token: data.token,
        expires_at: exp,
        genai_access: data.genai_access,
        user: data.user,
      });
      scheduleExpiry(exp);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest(token!);
      // Handle successful logout (e.g., redirect to login page)
      localStorage.removeItem(STORAGE_KEY);
      doLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle error (e.g., show notification)
    }
  };

  const authorizedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!token || !expiresAt || Date.now() >= expiresAt) {
      // expired or missing → behave like 401
      const r = new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      doLogout();
      return r;
    }
    const headers = new Headers(init?.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    // default JSON content-type if body is object
    const body = init?.body;
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 || res.status === 403) {
      // token no longer valid on server → force logout
      doLogout();
    }
    return res;
  };

  const switchShowPeerRequest = async (value: boolean) => {
    try {
      await setShowPeerRequest(authorizedFetch, value);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          compareWithPeer: value,
        };
      });

      const stored = readStored();
      if (stored?.user) {
        const updatedUser = {
          ...stored.user,
          compareWithPeer: value,
        };
        updateStored({ user: updatedUser });
      }
    } catch (e: any) {
      console.error("Failed to load action plan data:", e);
    }
  };

  const setUnitId = (unitId: number | null) => {
    setSelectedUnitId(unitId);
  };

  const value = useMemo<AuthState>(() => ({
    token,
    user,
    genaiAccess,
    expiresAt,
    isAuthenticated: !!token && !!expiresAt && Date.now() < expiresAt,
    loading,
    error: error,
    selectedUnitId,
    setUnitId,
    login,
    logout,
    authorizedFetch,
    switchShowPeerRequest,
  }), [token, user, genaiAccess, expiresAt, loading, error, selectedUnitId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
