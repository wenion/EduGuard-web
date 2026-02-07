"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LoginResponse } from "@/types/Auth";
import { loginRequest, logoutRequest, setShowPeerRequest } from "@/lib/authApi";

type LoginInput =
  | { type: "password"; username: string; password: string }
  | { type: "oidc"; idToken: string };

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
  sessionID: string | null;
  setSessionID: (sessionID: string | null) => void;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  switchShowPeerRequest: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "app_auth_v1"; // localStorage key
const EXTENSION_MESSAGE_TYPE = "EDVANCE_AUTH_TOKEN";

// Extension ID (update this with your published extension ID)
// For development: Get ID from chrome://extensions after loading unpacked extension
// For production: This will be the stable published extension ID
const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || null;

function syncTokenToExtension(
  token: string | null,
  expiresAt: number | null,
  user: LoginResponse["user"] | null = null,
  genaiAccess: boolean = false
) {
  if (typeof window === "undefined") return;

  const payload = {
    source: "EdvanceWeb",
    type: EXTENSION_MESSAGE_TYPE,
    token,
    expiresAt,
    user: user ? {
      username: user.username,
      name: user.name,
      enrolled_units: user.enrolled_units,
      compareWithPeer: user.compareWithPeer
    } : null,
    genaiAccess,
    timestamp: Date.now(),
  };

  // Direct extension messaging (secure - only your extension can receive this)
  const chromeApi = (window as Window & { chrome?: { runtime?: { sendMessage?: (extensionId: string, message: unknown, responseCallback?: (response?: { success?: boolean }) => void) => void; lastError?: { message: string } } } }).chrome;

  if (!EXTENSION_ID) {
    console.warn('[AuthContext] EXTENSION_ID not configured - extension sync disabled');
    return;
  }

  if (chromeApi?.runtime?.sendMessage) {
    // Send to specific extension ID (secure direct messaging)
    chromeApi.runtime.sendMessage(EXTENSION_ID, payload, (response?: { success?: boolean }) => {
      if (chromeApi.runtime?.lastError) {
        console.log('[AuthContext] Extension not installed or unavailable:', chromeApi.runtime.lastError.message);
      } else if (response?.success) {
        console.log('[AuthContext] Token securely sent to extension');
      }
    });
  } else {
    console.log('[AuthContext] Chrome extension API not available');
  }
}

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
  const [hydrated, setHydrated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [sessionID, setSessionID] = useState<string | null>(null);

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
        syncTokenToExtension(stored.token, exp, stored.user ?? null, !!stored.genai_access);
        scheduleExpiry(exp);
      } else {
        writeStored(null);
        syncTokenToExtension(null, null, null, false);
      }
    }
    setHydrated(true);
    // cleanup on unmount
    return clearExpiryTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogout = () => {
    clearExpiryTimer();
    syncTokenToExtension(null, null, null, false);
    setToken(null);
    setUser(null);
    setGenaiAccess(false);
    setExpiresAt(null);
    writeStored(null);
  };

  const login = async (
    input:
      | { type: "password"; username: string; password: string }
      | { type: "oidc"; idToken: string }
  ) => {
    setErr(null);
    setAuthLoading(true);
    try {
      const data = await loginRequest(
        input.type === "password"
          ? { username: input.username, password: input.password }
          : { idToken: input.idToken }
      );
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
      syncTokenToExtension(data.token, exp, data.user, !!data.genai_access);
      scheduleExpiry(exp);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      doLogout();
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
    loading: authLoading || !hydrated,
    error: error,
    selectedUnitId,
    setUnitId,
    sessionID,
    setSessionID,
    login,
    logout,
    authorizedFetch,
    switchShowPeerRequest,
  }), [token, user, genaiAccess, expiresAt, authLoading, hydrated, error, selectedUnitId, sessionID]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
