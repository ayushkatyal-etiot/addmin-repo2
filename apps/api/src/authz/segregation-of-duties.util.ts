import { ForbiddenException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";

// A Maker who created a record cannot also be the Checker who approves it,
// unless the organization has explicitly opted into the override. Step 07/08
// call this from their approve-endpoint handlers (bill approval etc.) before
// mutating status — the guard itself can't enforce this generically since
// "who created this record" is data, not route metadata.
export async function assertNotSameActor(
  audit: AuditService,
  params: {
    actorUserId: string;
    creatorUserId: string;
    sodOverrideEnabled: boolean;
    entityType: string;
    entityId: string;
  },
): Promise<void> {
  const isSameActor = params.actorUserId === params.creatorUserId;
  if (isSameActor && !params.sodOverrideEnabled) {
    await audit.write({
      actorUserId: params.actorUserId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: "unauthorized_access_attempt",
      afterValue: { reason: "segregation_of_duties_violation" },
    });
    throw new ForbiddenException("Maker cannot approve their own record");
  }
}
