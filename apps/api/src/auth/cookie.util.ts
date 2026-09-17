// Reading req.cookies normally needs the cookie-parser middleware; parsing
// the one header we care about by hand avoids adding that dependency.
export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export const SESSION_COOKIE = "addmin_session";
export const MFA_CHALLENGE_COOKIE = "addmin_mfa_challenge";
