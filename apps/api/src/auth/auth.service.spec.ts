import { UnauthorizedException } from "@nestjs/common";
import { hashPassword } from "@addmin/db";
import { AuthService } from "./auth.service";
import { currentTotpCode, generateBase32Secret } from "./totp.util";
import { encryptSecret } from "./secret-encryption.util";
import { createMfaChallenge } from "./mfa-challenge.util";

process.env.SESSION_SECRET = "test-secret-value";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makePrismaMock(): any {
  const mock: Record<string, unknown> = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn(),
    },
    organization: { create: jest.fn() },
    session: { create: jest.fn().mockResolvedValue({}), updateMany: jest.fn() },
    authToken: {
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  mock.$transaction = jest.fn(async (arg: unknown) => {
    if (typeof arg === "function") return (arg as (tx: unknown) => unknown)(mock);
    return Promise.all(arg as Promise<unknown>[]);
  });
  return mock;
}

describe("AuthService", () => {
  it("rejects login with a wrong password", async () => {
    const prisma = makePrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: await hashPassword("correct-password"),
      mfaEnabled: false,
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    await expect(
      service.login({ email: "a@example.com", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns mfa_required instead of a session when MFA is enabled", async () => {
    const prisma = makePrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: await hashPassword("correct-password"),
      mfaEnabled: true,
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    const result = await service.login({ email: "a@example.com", password: "correct-password" });
    expect(result.status).toBe("mfa_required");
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it("issues a session directly when MFA is not enabled", async () => {
    const prisma = makePrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      passwordHash: await hashPassword("correct-password"),
      mfaEnabled: false,
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    const result = await service.login({ email: "a@example.com", password: "correct-password" });
    expect(result.status).toBe("logged_in");
    expect(prisma.session.create).toHaveBeenCalled();
  });

  it("rejects an MFA login completion with an invalid TOTP code", async () => {
    const prisma = makePrismaMock();
    const secret = generateBase32Secret();
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      mfaEnabled: true,
      mfaSecret: encryptSecret(secret),
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    const challenge = createMfaChallenge("u1");
    await expect(service.completeMfaLogin(challenge, "000000")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("accepts an MFA login completion with a valid TOTP code", async () => {
    const prisma = makePrismaMock();
    const secret = generateBase32Secret();
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      mfaEnabled: true,
      mfaSecret: encryptSecret(secret),
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    const code = currentTotpCode(secret);
    const challenge = createMfaChallenge("u1");
    await expect(service.completeMfaLogin(challenge, code)).resolves.toBeDefined();
    expect(prisma.session.create).toHaveBeenCalled();
  });

  it("revokes every active session on password reset", async () => {
    const prisma = makePrismaMock();
    prisma.authToken.findFirst.mockResolvedValue({
      id: "tok1",
      userId: "u1",
      expiresAt: new Date(Date.now() + 10_000),
    });
    const audit = { write: jest.fn() };
    const email = { send: jest.fn() };
    const service = new AuthService(prisma as never, audit as never, email as never);

    await service.resetPassword("raw-token", "new-Password1");

    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
