import { BadRequestException } from "@nestjs/common";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestException(`${field} is required`);
  }
  return value;
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new BadRequestException("email is invalid");
  }
  return email;
}

export function requirePassword(value: unknown): string {
  const password = requireString(value, "password");
  if (password.length < 8) {
    throw new BadRequestException("password must be at least 8 characters");
  }
  return password;
}
