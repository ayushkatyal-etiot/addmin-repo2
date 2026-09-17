// Random, high-entropy tokens (session ids, email-verification / password-
// reset tokens) — unlike passwords these aren't attacker-guessable via a
// dictionary, so a plain fast hash (sha256) of the token is enough to avoid
// storing the raw secret at rest.
import { createHash, randomBytes } from "node:crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
