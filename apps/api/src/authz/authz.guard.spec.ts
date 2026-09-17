import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthzGuard } from "./authz.guard";
import { hashToken } from "../auth/token.util";

function makeContext(overrides: {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}): ExecutionContext {
  const request = {
    headers: overrides.headers ?? {},
    params: overrides.params ?? {},
    body: overrides.body ?? {},
    query: overrides.query ?? {},
    method: "GET",
    url: "/test",
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("AuthzGuard", () => {
  const baseUser = {
    id: "user-1",
    orgId: "org-1",
    email: "a@example.com",
    role: "employee" as const,
    officeScope: ["office-1"],
    mfaEnabled: false,
    emailVerifiedAt: new Date(),
  };

  function makeGuard(metadata: Record<string, unknown>, session: unknown) {
    const reflector = {
      getAllAndOverride: (key: string) => metadata[key],
    } as unknown as Reflector;
    const prisma = {
      session: { findUnique: jest.fn().mockResolvedValue(session) },
    };
    const audit = { write: jest.fn().mockResolvedValue(undefined) };
    const guard = new AuthzGuard(reflector, prisma as never, audit as never);
    return { guard, prisma, audit };
  }

  it("allows @Public() routes with no session at all", async () => {
    const { guard } = makeGuard({ isPublic: true }, null);
    const ctx = makeContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("rejects with 401 when there is no session cookie", async () => {
    const { guard } = makeGuard({}, null);
    const ctx = makeContext({});
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects with 401 when the session is revoked", async () => {
    const { guard } = makeGuard(
      {},
      {
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
        user: baseUser,
      },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${"a".repeat(64)}` } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects with 403 when email is unverified", async () => {
    const { guard } = makeGuard(
      {},
      {
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user: { ...baseUser, emailVerifiedAt: null },
      },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${"a".repeat(64)}` } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects an admin-tier user who has not enrolled MFA", async () => {
    const { guard } = makeGuard(
      {},
      {
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user: { ...baseUser, role: "office_admin", mfaEnabled: false },
      },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${"a".repeat(64)}` } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows a non-admin user with verified email and no MFA requirement", async () => {
    const { guard } = makeGuard(
      {},
      {
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user: baseUser,
      },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${"a".repeat(64)}` } });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("denies and audit-logs a role mismatch", async () => {
    const { guard, audit } = makeGuard(
      { requiresRole: ["office_admin"] },
      { revokedAt: null, expiresAt: new Date(Date.now() + 10_000), user: baseUser },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${"a".repeat(64)}` } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
    expect(audit.write).toHaveBeenCalledWith(
      expect.objectContaining({ action: "unauthorized_access_attempt" }),
    );
  });

  it("denies and audit-logs cross-office access", async () => {
    const { guard, audit } = makeGuard(
      { requiresOfficeScope: true },
      { revokedAt: null, expiresAt: new Date(Date.now() + 10_000), user: baseUser },
    );
    const ctx = makeContext({
      headers: { cookie: `addmin_session=${"a".repeat(64)}` },
      params: { officeId: "office-2" },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
    expect(audit.write).toHaveBeenCalledWith(
      expect.objectContaining({ action: "unauthorized_access_attempt" }),
    );
  });

  it("allows access to an office within the caller's scope", async () => {
    const { guard } = makeGuard(
      { requiresOfficeScope: true },
      { revokedAt: null, expiresAt: new Date(Date.now() + 10_000), user: baseUser },
    );
    const ctx = makeContext({
      headers: { cookie: `addmin_session=${"a".repeat(64)}` },
      params: { officeId: "office-1" },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("exempts platform_admin from office-scope checks", async () => {
    const { guard } = makeGuard(
      { requiresOfficeScope: true },
      {
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
        user: { ...baseUser, role: "platform_admin", officeScope: [], mfaEnabled: true },
      },
    );
    const ctx = makeContext({
      headers: { cookie: `addmin_session=${"a".repeat(64)}` },
      params: { officeId: "office-99" },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it("looks the session up by a hash of the raw cookie token, never the raw token", async () => {
    const rawToken = "raw-session-token";
    const { guard, prisma } = makeGuard(
      {},
      { revokedAt: null, expiresAt: new Date(Date.now() + 10_000), user: baseUser },
    );
    const ctx = makeContext({ headers: { cookie: `addmin_session=${rawToken}` } });
    await guard.canActivate(ctx);
    expect(prisma.session.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });
  });
});
