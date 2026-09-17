import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface WriteLogInput {
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeValue?: unknown;
  afterValue?: unknown;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // Writes must be synchronous with the state change they describe (per
  // 04-architecture.md's background-jobs note) — callers await this inside
  // the same transaction/request as the action, never fire-and-forget.
  async write(input: WriteLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        beforeValue: input.beforeValue as never,
        afterValue: input.afterValue as never,
      },
    });
  }
}
