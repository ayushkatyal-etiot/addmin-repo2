// Short-lived signed token binding a password-verified login attempt to a
// specific user while they complete the MFA step, without yet issuing a real
// Session (no session must exist until MFA succeeds). HMAC-signed with
// SESSION_SECRET so it can't be forged or edited client-side.
import { createHmac, timingSafeEqual } from "node:crypto";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createMfaChallenge(userId: string): string {
  const payload = `${userId}:${Date.now() + CHALLENGE_TTL_MS}`;
  return `${payload}:${sign(payload)}`;
}

export function verifyMfaChallenge(token: string): string | null {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [userId, expiresAtRaw, signature] = parts;
  const payload = `${userId}:${expiresAtRaw}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(expiresAtRaw)) return null;
  return userId;
}
