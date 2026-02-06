// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { OIDC } from "@/app/auth/oidcConfig";
import { useAuth } from "@/context/AuthContext";

async function exchangeCode(code: string) {
  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!verifier) throw new Error("Missing PKCE verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: OIDC.clientId,
    redirect_uri: OIDC.redirectUri,
    code,
    code_verifier: verifier,
  });

  const res = await fetch(OIDC.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export default function CallbackPage() {
  const { isAuthenticated, loading, login } = useAuth();

  useEffect(() => {
    if (loading) return;

    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code) throw new Error("Missing code");

        const expectedState =
          sessionStorage.getItem("oidc_state");

        if (state !== expectedState) {
          throw new Error("Invalid state");
        }

        const tokens = await exchangeCode(code);

        sessionStorage.removeItem("oidc_state");
        sessionStorage.removeItem("pkce_verifier");

        sessionStorage.setItem(
          "id_token",
          tokens.id_token
        );

        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error("Missing id_token");

        if (!isAuthenticated) {
          try {
            await login({
              type: "oidc",
              idToken: idToken,
            });
          } catch {
            window.location.replace("/");
          } finally {
            sessionStorage.removeItem("id_token");
          }
        }

        window.location.replace("/");
      } catch (e) {
        console.error(e);
        window.location.replace("/");
      }
    })();
  }, [loading, isAuthenticated, login]);

  return <p>Signing you in…</p>;
}
