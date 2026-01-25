// src/auth/pkce.ts
function base64Url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCE() {
  const verifier =
    crypto.randomUUID() + crypto.randomUUID();

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );

  return {
    verifier,
    challenge: base64Url(digest),
  };
}
