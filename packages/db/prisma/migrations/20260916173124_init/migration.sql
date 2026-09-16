-- CreateEnum
CREATE TYPE "OfficeType" AS ENUM ('head_office', 'regional', 'branch', 'warehouse', 'other');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('owned', 'rented');

-- CreateEnum
CREATE TYPE "OfficeSetupStatus" AS ENUM ('draft', 'setup_incomplete', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "ChecklistCategory" AS ENUM ('utility', 'facility', 'compliance', 'vendor', 'asset', 'role');

-- CreateEnum
CREATE TYPE "ChecklistApplicability" AS ENUM ('yes', 'no', 'not_applicable');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('pending', 'configured', 'complete');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('electricity', 'water', 'internet', 'telephone', 'gas', 'dg', 'ups', 'solar', 'other');

-- CreateEnum
CREATE TYPE "UtilityBillingCycle" AS ENUM ('monthly', 'bimonthly', 'quarterly');

-- CreateEnum
CREATE TYPE "UtilityAccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ObligationScopeType" AS ENUM ('utility', 'rent', 'cam', 'amc', 'compliance');

-- CreateEnum
CREATE TYPE "ObligationFrequency" AS ENUM ('monthly', 'bimonthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "ObligationInstanceStatus" AS ENUM ('expected', 'received', 'missing', 'in_process', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "UtilityBillStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'partially_paid', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('draft', 'active', 'expiring', 'renewed', 'terminated');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('utility_provider', 'dg', 'ups', 'solar', 'amc', 'building_mgmt', 'other');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('pending_activation', 'active', 'suspended', 'inactive');

-- CreateEnum
CREATE TYPE "AMCContractStatus" AS ENUM ('active', 'due_for_renewal', 'expired', 'closed');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "MaintenanceRequestStatus" AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('assigned', 'in_progress', 'completed', 'verified');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('available', 'assigned', 'under_service', 'retired');

-- CreateEnum
CREATE TYPE "ComplianceItemStatus" AS ENUM ('missing', 'valid', 'expiring', 'expired', 'not_applicable');

-- CreateEnum
CREATE TYPE "PayableType" AS ENUM ('utility_bill', 'rent', 'cam', 'vendor');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'initiated', 'paid', 'failed', 'partially_paid', 'overdue');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('platform_admin', 'office_admin', 'checker', 'payment_authorizer', 'vendor_manager', 'compliance_coordinator', 'facility_staff', 'office_head', 'employee');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "default_currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "office_type" "OfficeType" NOT NULL,
    "ownership_type" "OwnershipType" NOT NULL,
    "setup_status" "OfficeSetupStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_setup_profiles" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "completion_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "activated_at" TIMESTAMP(3),
    "activated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_setup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_checklist_items" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "template_item_code" TEXT NOT NULL,
    "category" "ChecklistCategory" NOT NULL,
    "applicability" "ChecklistApplicability" NOT NULL DEFAULT 'not_applicable',
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'pending',
    "owner_user_id" TEXT,
    "linked_entity_type" TEXT,
    "linked_entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_accounts" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "utility_type" "UtilityType" NOT NULL,
    "provider_name" TEXT NOT NULL,
    "meter_account_no" TEXT NOT NULL,
    "billing_cycle" "UtilityBillingCycle" NOT NULL,
    "vendor_id" TEXT,
    "status" "UtilityAccountStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_obligation_schedules" (
    "id" TEXT NOT NULL,
    "scope_type" "ObligationScopeType" NOT NULL,
    "scope_ref_id" TEXT NOT NULL,
    "frequency" "ObligationFrequency" NOT NULL,
    "expected_window_days" INTEGER NOT NULL,
    "due_rule" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "active_from" DATE NOT NULL,
    "active_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_obligation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligation_instances" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "expected_date" DATE NOT NULL,
    "due_date" DATE,
    "status" "ObligationInstanceStatus" NOT NULL DEFAULT 'expected',
    "linked_ref_type" TEXT,
    "linked_ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligation_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_bills" (
    "id" TEXT NOT NULL,
    "utility_account_id" TEXT NOT NULL,
    "obligation_instance_id" TEXT,
    "billing_period" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "UtilityBillStatus" NOT NULL DEFAULT 'draft',
    "invoice_doc_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landlords" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pan" TEXT,
    "bank_details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "rent_amount" DECIMAL(14,2) NOT NULL,
    "cam_amount" DECIMAL(14,2),
    "security_deposit" DECIMAL(14,2),
    "escalation_pct" DECIMAL(5,2),
    "status" "LeaseStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL,
    "pan_gstin" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'pending_activation',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amc_contracts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "linked_entity_type" TEXT NOT NULL,
    "linked_entity_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "AMCContractStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amc_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'medium',
    "status" "MaintenanceRequestStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "maintenance_request_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "sla_due_at" TIMESTAMP(3) NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'assigned',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serial_no" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'available',
    "warranty_end" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_items" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "status" "ComplianceItemStatus" NOT NULL DEFAULT 'missing',
    "expiry_date" DATE,
    "document_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payable_type" "PayableType" NOT NULL,
    "payable_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "tds_amount" DECIMAL(14,2),
    "net_amount" DECIMAL(14,2) NOT NULL,
    "mode" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "authorized_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "office_scope" JSONB NOT NULL DEFAULT '[]',
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_value" JSONB,
    "after_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offices_org_id_idx" ON "offices"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "office_setup_profiles_office_id_key" ON "office_setup_profiles"("office_id");

-- CreateIndex
CREATE INDEX "office_checklist_items_office_id_idx" ON "office_checklist_items"("office_id");

-- CreateIndex
CREATE INDEX "utility_accounts_office_id_idx" ON "utility_accounts"("office_id");

-- CreateIndex
CREATE INDEX "recurring_obligation_schedules_scope_type_scope_ref_id_idx" ON "recurring_obligation_schedules"("scope_type", "scope_ref_id");

-- CreateIndex
CREATE INDEX "obligation_instances_schedule_id_idx" ON "obligation_instances"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "obligation_instances_schedule_id_period_key" ON "obligation_instances"("schedule_id", "period");

-- CreateIndex
CREATE INDEX "utility_bills_utility_account_id_idx" ON "utility_bills"("utility_account_id");

-- CreateIndex
CREATE INDEX "utility_bills_obligation_instance_id_idx" ON "utility_bills"("obligation_instance_id");

-- CreateIndex
CREATE INDEX "landlords_org_id_idx" ON "landlords"("org_id");

-- CreateIndex
CREATE INDEX "leases_office_id_idx" ON "leases"("office_id");

-- CreateIndex
CREATE INDEX "leases_landlord_id_idx" ON "leases"("landlord_id");

-- CreateIndex
CREATE INDEX "vendors_org_id_idx" ON "vendors"("org_id");

-- CreateIndex
CREATE INDEX "amc_contracts_vendor_id_idx" ON "amc_contracts"("vendor_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_office_id_idx" ON "maintenance_requests"("office_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_maintenance_request_id_key" ON "work_orders"("maintenance_request_id");

-- CreateIndex
CREATE INDEX "work_orders_vendor_id_idx" ON "work_orders"("vendor_id");

-- CreateIndex
CREATE INDEX "assets_office_id_idx" ON "assets"("office_id");

-- CreateIndex
CREATE INDEX "compliance_items_office_id_idx" ON "compliance_items"("office_id");

-- CreateIndex
CREATE INDEX "payments_payable_type_payable_id_idx" ON "payments"("payable_type", "payable_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_org_id_idx" ON "users"("org_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_setup_profiles" ADD CONSTRAINT "office_setup_profiles_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_setup_profiles" ADD CONSTRAINT "office_setup_profiles_activated_by_fkey" FOREIGN KEY ("activated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_checklist_items" ADD CONSTRAINT "office_checklist_items_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_checklist_items" ADD CONSTRAINT "office_checklist_items_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_obligation_schedules" ADD CONSTRAINT "recurring_obligation_schedules_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligation_instances" ADD CONSTRAINT "obligation_instances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "recurring_obligation_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_bills" ADD CONSTRAINT "utility_bills_utility_account_id_fkey" FOREIGN KEY ("utility_account_id") REFERENCES "utility_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_bills" ADD CONSTRAINT "utility_bills_obligation_instance_id_fkey" FOREIGN KEY ("obligation_instance_id") REFERENCES "obligation_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_authorized_by_fkey" FOREIGN KEY ("authorized_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
