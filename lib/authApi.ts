import type { LoginResponse } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    // adjust body field names if your backend expects different keys
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    // try to read error text/json
    let msg = `Login failed (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {/* ignore */}
    throw new Error(msg);
  }
  return res.json() as Promise<LoginResponse>;
}

export async function fetchUserProfile(authorizedFetch: any) {
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/find_user`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error(`Failed to load user info (HTTP ${res.status})`);
  }

  return res.json();
}
