// src/auth/oidcConfig.ts
export const OIDC = {
  issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER!,
  authorizeEndpoint:
    "https://monashuniqa.oktapreview.com/oauth2/v1/authorize",
  tokenEndpoint:
    "https://monashuniqa.oktapreview.com/oauth2/v1/token",
  userinfoEndpoint:
    "https://monashuniqa.oktapreview.com/oauth2/v1/userinfo",
  logoutEndpoint:
    "https://monashuniqa.oktapreview.com/oauth2/v1/logout",

  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!,
  scopes: process.env.NEXT_PUBLIC_OIDC_SCOPES!,
};
