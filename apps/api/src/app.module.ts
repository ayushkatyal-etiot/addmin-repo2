import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { AuthzModule } from "./authz/authz.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [PrismaModule, AuditModule, AuthzModule, AuthModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
