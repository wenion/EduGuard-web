// src/auth/logout.ts
import { OIDC } from "./oidcConfig";

export function logout() {
  sessionStorage.clear();

  const params = new URLSearchParams({
    client_id: OIDC.clientId,
    post_logout_redirect_uri:
      window.location.origin,
  });

  window.location.href =
    `${OIDC.logoutEndpoint}?${params.toString()}`;
}
