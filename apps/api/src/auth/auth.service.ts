import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { hashPassword, verifyPassword, Prisma } from "@addmin/db";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../notification/email.service";
import { generateToken, hashToken } from "./token.util";
import { decryptSecret, encryptSecret } from "./secret-encryption.util";
import { generateBase32Secret, otpauthUrl, verifyTotp } from "./totp.util";
import { createMfaChallenge, verifyMfaChallenge } from "./mfa-challenge.util";
import { requireEmail, requirePassword, requireString } from "./validation.util";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface LoginResult {
  status: "logged_in" | "mfa_required";
  sessionToken?: string;
  mfaChallengeToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly email: EmailService,
  ) {}

  async signup(input: { orgName: unknown; email: unknown; password: unknown }): Promise<{
    userId: string;
    orgId: string;
    sessionToken: string;
  }> {
    const orgName = requireString(input.orgName, "orgName");
    const email = requireEmail(input.email);
    const password = requirePassword(input.password);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException("An account with this email already exists");

    const passwordHash = await hashPassword(password);

    const { user, org } = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const org = await tx.organization.create({ data: { name: orgName } });
      const user = await tx.user.create({
        data: {
          orgId: org.id,
          email,
          passwordHash,
          role: "office_admin",
          officeScope: [],
        },
      });
      return { user, org };
    });

    await this.sendEmailVerification(user.id, user.email);
    const sessionToken = await this.createSession(user.id);

    return { userId: user.id, orgId: org.id, sessionToken };
  }

  async login(input: { email: unknown; password: unknown }): Promise<LoginResult> {
    const email = requireEmail(input.email);
    const password = requirePassword(input.password);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.mfaEnabled) {
      return { status: "mfa_required", mfaChallengeToken: createMfaChallenge(user.id) };
    }

    const sessionToken = await this.createSession(user.id);
    return { status: "logged_in", sessionToken };
  }

  async completeMfaLogin(challengeToken: string, code: unknown): Promise<string> {
    const userId = verifyMfaChallenge(challengeToken);
    if (!userId) throw new UnauthorizedException("MFA challenge expired or invalid");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException("MFA is not enrolled for this account");
    }

    const totpCode = requireString(code, "code");
    if (!verifyTotp(decryptSecret(user.mfaSecret), totpCode)) {
      throw new UnauthorizedException("Invalid MFA code");
    }

    return this.createSession(user.id);
  }

  async logout(rawSessionToken: string | undefined): Promise<void> {
    if (!rawSessionToken) return;
    await this.prisma.session.updateMany({
      where: { tokenHash: hashToken(rawSessionToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async setupMfa(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const secret = generateBase32Secret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: encryptSecret(secret), mfaEnabled: false },
    });
    return { secret, otpauthUrl: otpauthUrl(secret, user.email) };
  }

  async enableMfa(userId: string, code: unknown): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.mfaSecret) throw new BadRequestException("Call mfa/setup first");

    const totpCode = requireString(code, "code");
    if (!verifyTotp(decryptSecret(user.mfaSecret), totpCode)) {
      throw new UnauthorizedException("Invalid MFA code");
    }

    await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    await this.audit.write({
      actorUserId: userId,
      entityType: "user",
      entityId: userId,
      action: "mfa_enrolled",
    });
  }

  // Explicit admin-assisted recovery for a lost MFA device — never a silent
  // bypass. Forces the target back through mfa/setup + mfa/enable.
  async adminResetMfa(actorUserId: string, targetUserId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { mfaSecret: null, mfaEnabled: false },
    });
    await this.audit.write({
      actorUserId,
      entityType: "user",
      entityId: targetUserId,
      action: "mfa_admin_reset",
    });
  }

  async verifyEmail(rawToken: unknown): Promise<void> {
    const token = requireString(rawToken, "token");
    const record = await this.prisma.authToken.findFirst({
      where: {
        tokenHash: hashToken(token),
        type: "email_verification",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!record) throw new BadRequestException("Invalid or expired verification token");

    await this.prisma.$transaction([
      this.prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  }

  async requestPasswordReset(rawEmail: unknown): Promise<void> {
    const email = requireEmail(rawEmail);
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Never reveal whether the email exists.
    if (!user) return;

    const token = generateToken();
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: "password_reset",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });
    await this.email.send(
      user.email,
      "Reset your AddMin password",
      `Reset token: ${token} (expires in 1 hour)`,
    );
  }

  async resetPassword(rawToken: unknown, rawPassword: unknown): Promise<void> {
    const token = requireString(rawToken, "token");
    const password = requirePassword(rawPassword);

    const record = await this.prisma.authToken.findFirst({
      where: {
        tokenHash: hashToken(token),
        type: "password_reset",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!record) throw new BadRequestException("Invalid or expired reset token");

    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction([
      this.prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      // Password reset invalidates every previously issued session.
      this.prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    await this.audit.write({
      actorUserId: record.userId,
      entityType: "user",
      entityId: record.userId,
      action: "password_reset",
    });
  }

  private async sendEmailVerification(userId: string, email: string): Promise<void> {
    const token = generateToken();
    await this.prisma.authToken.create({
      data: {
        userId,
        type: "email_verification",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });
    await this.email.send(
      email,
      "Verify your AddMin account",
      `Verification token: ${token} (expires in 24 hours)`,
    );
  }

  private async createSession(userId: string): Promise<string> {
    const token = generateToken();
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    return token;
  }
}
