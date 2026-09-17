// Adaptive password hashing via Node's built-in scrypt (stdlib, no extra
// dependency) — never a fast hash like SHA-256. Format: "scrypt:N:salt:hash",
// so the cost parameter travels with the hash and can be tuned later without
// breaking already-stored hashes.
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const SCRYPT_N = 16384; // CPU/memory cost factor
const KEY_LENGTH = 64;

function scryptAsync(plain: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, keyLength, options, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(plain, salt, KEY_LENGTH, { N: SCRYPT_N });
  return `scrypt:${SCRYPT_N}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [scheme, nRaw, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt") return false;
  const n = Number(nRaw);
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scryptAsync(plain, salt, expected.length, { N: n });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
