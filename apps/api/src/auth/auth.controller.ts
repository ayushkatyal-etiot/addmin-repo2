import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AllowUnverified, CurrentUser, Public, RequiresRole } from "../authz/authz.decorator";
import type { AuthenticatedUser } from "../authz/authz.guard";
import { MFA_CHALLENGE_COOKIE, SESSION_COOKIE, parseCookies } from "./cookie.util";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("signup")
  async signup(
    @Body() body: { orgName: unknown; email: unknown; password: unknown },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(body);
    res.cookie(SESSION_COOKIE, result.sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { userId: result.userId, orgId: result.orgId };
  }

  @Public()
  @Post("login")
  async login(
    @Body() body: { email: unknown; password: unknown },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body);
    if (result.status === "mfa_required") {
      res.cookie(MFA_CHALLENGE_COOKIE, result.mfaChallengeToken, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 5 * 60 * 1000,
      });
      return { status: "mfa_required" };
    }
    res.cookie(SESSION_COOKIE, result.sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { status: "logged_in" };
  }

  @Public()
  @Post("login/mfa")
  async completeMfaLogin(
    @Body() body: { code: unknown },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const challengeToken = parseCookies(req.headers.cookie)[MFA_CHALLENGE_COOKIE];
    if (!challengeToken) throw new UnauthorizedException("No pending MFA challenge");

    const sessionToken = await this.authService.completeMfaLogin(challengeToken, body.code);
    res.clearCookie(MFA_CHALLENGE_COOKIE, SESSION_COOKIE_OPTIONS);
    res.cookie(SESSION_COOKIE, sessionToken, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { status: "logged_in" };
  }

  @AllowUnverified()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    await this.authService.logout(token);
    res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_OPTIONS);
    return { status: "logged_out" };
  }

  @Public()
  @Get("verify-email")
  async verifyEmail(@Query("token") token: string) {
    await this.authService.verifyEmail(token);
    return { status: "verified" };
  }

  @Public()
  @Post("request-password-reset")
  async requestPasswordReset(@Body() body: { email: unknown }) {
    await this.authService.requestPasswordReset(body.email);
    return { status: "ok" };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() body: { token: unknown; password: unknown }) {
    await this.authService.resetPassword(body.token, body.password);
    return { status: "password_reset" };
  }

  @AllowUnverified()
  @Post("mfa/setup")
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupMfa(user.id);
  }

  @AllowUnverified()
  @Post("mfa/enable")
  async enableMfa(@CurrentUser() user: AuthenticatedUser, @Body() body: { code: unknown }) {
    await this.authService.enableMfa(user.id, body.code);
    return { status: "mfa_enabled" };
  }

  @RequiresRole("office_admin", "platform_admin")
  @Post("mfa/admin-reset")
  async adminResetMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { userId: unknown },
  ) {
    await this.authService.adminResetMfa(user.id, String(body.userId));
    return { status: "mfa_reset" };
  }
}
