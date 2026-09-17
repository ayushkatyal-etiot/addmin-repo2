import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthzGuard } from "./authz.guard";

@Module({
  providers: [{ provide: APP_GUARD, useClass: AuthzGuard }],
})
export class AuthzModule {}
