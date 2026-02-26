// src/auth/oidcConfig.ts
export const OIDC = {
  issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER!,
  authorizeEndpoint:
    "https://monashuni.okta.com/oauth2/default/v1/authorize",
  tokenEndpoint:
    "https://monashuni.okta.com/oauth2/default/v1/token",
  userinfoEndpoint:
    "https://monashuni.okta.com/oauth2/default/v1/userinfo",
  logoutEndpoint:
    "https://monashuni.okta.com/oauth2/default/v1/logout",

  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!,
  scopes: process.env.NEXT_PUBLIC_OIDC_SCOPES!,
};
