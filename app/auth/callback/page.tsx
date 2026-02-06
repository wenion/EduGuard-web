// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { OIDC } from "@/app/auth/oidcConfig";
import { useAuth } from "@/context/AuthContext";
import { AuthApiError } from "@/lib/authApi";

const SSO_FAILURE_REDIRECT = "/?authError=sso_failed";
const NO_LEARNING_DATA_REDIRECT = "/auth/no-learning-data";

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
  const { loading, login } = useAuth();

  useEffect(() => {
    if (loading) return;

    let isCancelled = false;

    (async () => {
      try {
        const url = new URL(window.location.href);
        const oidcError = url.searchParams.get("error");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (oidcError) {
          throw new Error(`OIDC provider returned error: ${oidcError}`);
        }
        if (!code) throw new Error("Missing code");

        const expectedState = sessionStorage.getItem("oidc_state");

        if (!expectedState || state !== expectedState) {
          throw new Error("Invalid state");
        }

        const tokens = await exchangeCode(code);
        const idToken = tokens?.id_token as string | undefined;
        if (!idToken) throw new Error("Missing id_token");

        try {
          await login({
            type: "oidc",
            idToken,
          });
        } catch (error) {
          if (error instanceof AuthApiError && error.status === 403) {
            window.location.replace(NO_LEARNING_DATA_REDIRECT);
            return;
          }
          throw error;
        }

        if (!isCancelled) {
          window.location.replace("/");
        }
      } catch (e) {
        console.error(e);
        // if (!isCancelled) {
        //  window.location.replace(SSO_FAILURE_REDIRECT);
        // }
      } finally {
        sessionStorage.removeItem("oidc_state");
        sessionStorage.removeItem("pkce_verifier");
        sessionStorage.removeItem("id_token");
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [loading, login]);

  return <p>Signing you in…</p>;
}
