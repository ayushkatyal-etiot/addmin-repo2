// Minimal RFC 6238 TOTP (HMAC-SHA1, 30s step, 6 digits) built on node:crypto
// + base32 — the whole algorithm is ~30 lines, so this avoids pulling in an
// external MFA library for security-sensitive code that's easier to audit
// in-repo.
import { createHmac, randomBytes } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

export function generateBase32Secret(): string {
  const bytes = randomBytes(20);
  let bits = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) throw new Error("Invalid base32 character");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** DIGITS).padStart(DIGITS, "0");
}

// Accepts the current step and one step of clock drift either side.
export function verifyTotp(base32Secret: string, code: string, now = Date.now()): boolean {
  const secret = base32Decode(base32Secret);
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  for (const drift of [0, -1, 1]) {
    if (hotp(secret, counter + drift) === code) return true;
  }
  return false;
}

// Exposed for tests that need a currently-valid code for a generated secret.
export function currentTotpCode(base32Secret: string, now = Date.now()): string {
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  return hotp(base32Decode(base32Secret), counter);
}

export function otpauthUrl(base32Secret: string, email: string): string {
  const label = encodeURIComponent(`AddMin:${email}`);
  return `otpauth://totp/${label}?secret=${base32Secret}&issuer=AddMin&digits=${DIGITS}&period=${STEP_SECONDS}`;
}
