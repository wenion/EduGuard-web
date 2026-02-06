// src/auth/login.ts
"use client";

import { OIDC } from "./oidcConfig";
import { generatePKCE } from "./pkce";

export async function login(username: string) {
  const { verifier, challenge } = await generatePKCE();

  const state = crypto.randomUUID();

  sessionStorage.setItem("pkce_verifier", verifier);
  sessionStorage.setItem("oidc_state", state);

  const params = new URLSearchParams({
    client_id: OIDC.clientId,
    response_type: "code",
    scope: OIDC.scopes,
    redirect_uri: OIDC.redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    login_hint: username,
  });

  window.location.href =
    `${OIDC.authorizeEndpoint}?${params.toString()}`;
}
