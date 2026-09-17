import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/password";

const prisma = new PrismaClient();

// Every seeded test user shares this password (never used outside local/CI
// seed data — real signups always set their own).
const SEED_PASSWORD = "Password123!";

const ALL_ROLES: UserRole[] = [
  "platform_admin",
  "office_admin",
  "checker",
  "payment_authorizer",
  "vendor_manager",
  "compliance_coordinator",
  "facility_staff",
  "office_head",
  "employee",
];

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const org = await prisma.organization.create({
    data: {
      name: "Acme Test Organization",
      defaultCurrency: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  const office = await prisma.office.create({
    data: {
      orgId: org.id,
      name: "Acme HQ",
      address: "1 Test Street, Bengaluru",
      officeType: "head_office",
      ownershipType: "owned",
      setupStatus: "draft",
    },
  });

  await prisma.$transaction(
    ALL_ROLES.map((role) =>
      prisma.user.create({
        data: {
          orgId: org.id,
          email: `${role}@acme-test.example.com`,
          passwordHash,
          role,
          officeScope: [office.id],
          mfaEnabled: false,
        },
      }),
    ),
  );

  console.log(
    `Seeded 1 Organization (${org.id}), 1 Office (${office.id}), and ${ALL_ROLES.length} Users (one per role).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
