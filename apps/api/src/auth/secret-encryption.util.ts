// Encrypts credential material (MFA TOTP seeds) at rest — never store them
// in plaintext, same standard as password hashing. Keyed from SESSION_SECRET
// so no separate secret needs provisioning; AES-256-GCM (stdlib) gives
// authenticated encryption so tampered ciphertext is rejected, not decrypted
// into garbage.
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

function deriveKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set to encrypt/decrypt secrets");
  return scryptSync(secret, "addmin-mfa-secret-salt", 32);
}

export function encryptSecret(plain: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((b) => b.toString("hex")).join(":");
}

export function decryptSecret(stored: string): string {
  const [ivHex, authTagHex, ciphertextHex] = stored.split(":");
  const key = deriveKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
