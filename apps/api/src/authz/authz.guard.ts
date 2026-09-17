import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@addmin/db";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { parseCookies, SESSION_COOKIE } from "../auth/cookie.util";
import { hashToken } from "../auth/token.util";
import {
  ALLOW_UNVERIFIED_KEY,
  IS_PUBLIC_KEY,
  REQUIRES_OFFICE_SCOPE_KEY,
  REQUIRES_ROLE_KEY,
} from "./authz.decorator";

// Admin-tier roles: PRD requires MFA enrollment before these can do anything,
// per Step 03's rubric ("admin-tier role cannot complete signup without MFA").
const ADMIN_TIER_ROLES: UserRole[] = ["platform_admin", "office_admin"];

export interface AuthenticatedUser {
  id: string;
  orgId: string;
  email: string;
  role: UserRole;
  officeScope: string[];
  mfaEnabled: boolean;
  emailVerifiedAt: Date | null;
}

@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    const cookies = parseCookies(request.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE];
    if (!rawToken) throw new UnauthorizedException("No session");

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });

    // Re-checked from the DB on every request, never from a cached claim —
    // this is what makes role revocation take effect immediately (F-02).
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session invalid or expired");
    }

    const user: AuthenticatedUser = {
      id: session.user.id,
      orgId: session.user.orgId,
      email: session.user.email,
      role: session.user.role,
      officeScope: (session.user.officeScope as string[]) ?? [],
      mfaEnabled: session.user.mfaEnabled,
      emailVerifiedAt: session.user.emailVerifiedAt,
    };
    request.user = user;

    const allowUnverified = this.reflector.getAllAndOverride<boolean>(ALLOW_UNVERIFIED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowUnverified) {
      if (!user.emailVerifiedAt) {
        throw new ForbiddenException("Email not verified");
      }
      if (ADMIN_TIER_ROLES.includes(user.role) && !user.mfaEnabled) {
        throw new ForbiddenException("MFA enrollment required");
      }
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(REQUIRES_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      await this.denyAndLog(request, user, "role_not_permitted");
      throw new ForbiddenException("Role not permitted");
    }

    const requiresOfficeScope = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_OFFICE_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiresOfficeScope && user.role !== "platform_admin") {
      const officeId =
        request.params?.officeId ?? request.body?.officeId ?? request.query?.officeId;
      if (!officeId || !user.officeScope.includes(officeId)) {
        await this.denyAndLog(request, user, "office_scope_mismatch");
        throw new ForbiddenException("Office out of scope");
      }
    }

    return true;
  }

  private async denyAndLog(
    request: { url?: string; method?: string },
    user: AuthenticatedUser,
    reason: string,
  ): Promise<void> {
    await this.audit.write({
      actorUserId: user.id,
      entityType: "route",
      entityId: `${request.method ?? ""} ${request.url ?? ""}`,
      action: "unauthorized_access_attempt",
      afterValue: { reason },
    });
  }
}
