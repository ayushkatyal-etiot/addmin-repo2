import { SetMetadata, createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { UserRole } from "@addmin/db";
import type { AuthenticatedUser } from "./authz.guard";

export const IS_PUBLIC_KEY = "isPublic";
// Bypasses AuthzGuard entirely — no session required. Use only for routes
// that must work with no logged-in user (signup, login, email verification).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ALLOW_UNVERIFIED_KEY = "allowUnverified";
// Still requires a valid session, but skips the "email verified" / "MFA
// enrolled" checks — for the handful of endpoints that exist precisely to
// get a new account past those states (verify-email, mfa/setup, mfa/enable).
export const AllowUnverified = () => SetMetadata(ALLOW_UNVERIFIED_KEY, true);

export const REQUIRES_ROLE_KEY = "requiresRole";
export const RequiresRole = (...roles: UserRole[]) => SetMetadata(REQUIRES_ROLE_KEY, roles);

export const REQUIRES_OFFICE_SCOPE_KEY = "requiresOfficeScope";
// Marks a route as operating on a single officeId, read from params, then
// body, then query (first present wins). AuthzGuard rejects the request if
// the resolved office isn't in the caller's granted office scope.
// platform_admin is exempt (platform operations are cross-org by design).
export const RequiresOfficeScope = () => SetMetadata(REQUIRES_OFFICE_SCOPE_KEY, true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
