import type { LoginResponse } from "@/types/Auth";
import type { Trace } from "@/types/Trace";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function loginRequest(
  payload:
    | { username: string; password: string }
    | { idToken: string }
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    // adjust body field names if your backend expects different keys
    body: JSON.stringify(payload),
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

export async function logoutRequest(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: null // or body: "" — backend expects empty body
  });

  if (!res.ok) {
    let msg = `Logout failed (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {/* ignore */}
    throw new Error(msg);
  }

  return; // nothing returned on success
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

// Helper function to fetch user feedback with authorization token
export async function fetchUserFeedback(authorizedFetch: any, unitId: number) {
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ unit: unitId }), // Payload with unit ID
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to submit feedback (HTTP ${res.status})`);
  }

  return res.json();  // Return the response as JSON
}

export async function fetchActionPlanRequest(authorizedFetch: any, unitId: number) {
  const res = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/get_action_plan`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ unit: unitId }),
    }
  );

  if (!res.ok) {
    let msg = `Get action plan failed (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {/* ignore */}
    throw new Error(msg);
  }

  return res.json();
}

export async function setShowPeerRequest(
  authorizedFetch: any,
  show_peer: boolean
): Promise<void> {
  const res = await authorizedFetch(`${API_BASE}/user/set_show_peer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ show_peer: show_peer }),
  });

  if (!res.ok) {
    let msg = `Failed to update peer compare setting (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function createActionPlanRequest(
  authorizedFetch: any,
  selectedUnit: number,
  planDetails: { item: string; date: string }[],
): Promise<{ message: string }> {
  const res = await authorizedFetch(`${API_BASE}/user/new_action_plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ plan_details: planDetails, unit: selectedUnit }),
  });

  if (!res.ok) {
    let msg = `Failed to update peer compare setting (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function finaliseAction(
  authorizedFetch: any,
  itemId: number,
  action: string,
): Promise<{marked_status_time: number, message: string}> {
  const res = await authorizedFetch(`${API_BASE}/user/action_plan_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ item_id: itemId, status: action }),
  });

  if (!res.ok) {
    let msg = `Failed to update peer compare setting (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function sendChat(
  authorizedFetch: any,
  message: string,
  unit: number,
  sessionID: string,
  timezone?: string,
): Promise<{message: string, timestamp: string}> {
  const res = await authorizedFetch(`${API_BASE}/chat/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      message: message,
      unit: unit,
      sessionID: sessionID,
      timezone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  if (!res.ok) {
    let msg = `Failed to send chat (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* ignore */
      return {message: "An error occurred. Please try again later.", timestamp: new Date().toLocaleTimeString()};
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function sendLog(
  authorizedFetch: any,
  TraceData: {data: Trace, timestamp: number}[],
): Promise<{ message: string }> {
  const res = await authorizedFetch(`${API_BASE}/logger/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(TraceData),
  });

  if (!res.ok) {
    let msg = `Failed to send log data (HTTP ${res.status})`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}
