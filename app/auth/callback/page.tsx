// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { OIDC } from "@/app/auth/oidcConfig";

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
  useEffect(() => {
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

        const expiresAt =
          Date.now() + tokens.expires_in * 1000;

        sessionStorage.setItem(
          "access_token",
          tokens.access_token
        );
        sessionStorage.setItem(
          "id_token",
          tokens.id_token
        );
        sessionStorage.setItem(
          "access_token_expires_at",
          String(expiresAt)
        );

        sessionStorage.removeItem("oidc_state");
        sessionStorage.removeItem("pkce_verifier");

        window.location.replace("/");
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return <p>Signing you in…</p>;
}
