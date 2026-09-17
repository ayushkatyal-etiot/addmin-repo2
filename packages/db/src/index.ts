export { PrismaClient } from "@prisma/client";
export { Prisma } from "@prisma/client";
export { hashPassword, verifyPassword } from "./password";

export type UserRole =
  | "platform_admin"
  | "office_admin"
  | "checker"
  | "payment_authorizer"
  | "vendor_manager"
  | "compliance_coordinator"
  | "facility_staff"
  | "office_head"
  | "employee";
