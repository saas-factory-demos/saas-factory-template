import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_invoices_provider" AS ENUM('ezpay', 'ecpay-invoice');
  CREATE TYPE "public"."enum_invoices_category" AS ENUM('B2C', 'B2B');
  CREATE TYPE "public"."enum_invoices_issue_mode" AS ENUM('immediate', 'on-trigger', 'scheduled');
  CREATE TYPE "public"."enum_invoices_status" AS ENUM('issued', 'voided', 'pending');
  CREATE TYPE "public"."enum_invoices_tax_type" AS ENUM('taxable', 'zero-tax', 'tax-free', 'mixed');
  CREATE TYPE "public"."enum_invoices_carrier_type" AS ENUM('mobile-barcode', 'natural-person-cert', 'company-tax-id', 'donation', 'member', 'paper');
  CREATE TYPE "public"."enum_invoice_allowances_status" AS ENUM('issued', 'failed');
  CREATE TYPE "public"."enum_invoice_logs_provider" AS ENUM('ezpay', 'ecpay-invoice');
  CREATE TYPE "public"."enum_invoice_logs_action" AS ENUM('issue', 'issueAllowance', 'void', 'query');
  CREATE TABLE "invoices_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"unit" varchar,
  	"tax_type" varchar,
  	"category" varchar
  );
  
  CREATE TABLE "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"order_id" varchar NOT NULL,
  	"invoice_number" varchar NOT NULL,
  	"provider" "enum_invoices_provider" NOT NULL,
  	"category" "enum_invoices_category" NOT NULL,
  	"issue_mode" "enum_invoices_issue_mode" DEFAULT 'immediate',
  	"scheduled_at" timestamp(3) with time zone,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_invoices_status" DEFAULT 'pending' NOT NULL,
  	"total_amount" numeric NOT NULL,
  	"tax_amount" numeric,
  	"tax_type" "enum_invoices_tax_type",
  	"carrier_type" "enum_invoices_carrier_type" NOT NULL,
  	"carrier_value" varchar,
  	"carrier_donation_code" varchar,
  	"buyer_name" varchar,
  	"buyer_tax_id" varchar,
  	"buyer_address" varchar,
  	"buyer_email" varchar,
  	"buyer_phone" varchar,
  	"raw" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invoice_allowances_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL
  );
  
  CREATE TABLE "invoice_allowances" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"invoice_id" varchar NOT NULL,
  	"allowance_number" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"tax_amount" numeric,
  	"reason" varchar,
  	"status" "enum_invoice_allowances_status" NOT NULL,
  	"raw" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invoice_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"order_id" varchar,
  	"invoice_id" varchar,
  	"provider" "enum_invoice_logs_provider" NOT NULL,
  	"action" "enum_invoice_logs_action" NOT NULL,
  	"success" boolean DEFAULT false,
  	"error" varchar,
  	"request" jsonb,
  	"response" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "invoices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "invoice_allowances_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "invoice_logs_id" integer;
  ALTER TABLE "invoices_items" ADD CONSTRAINT "invoices_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "invoice_allowances_items" ADD CONSTRAINT "invoice_allowances_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."invoice_allowances"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "invoices_items_order_idx" ON "invoices_items" USING btree ("_order");
  CREATE INDEX "invoices_items_parent_id_idx" ON "invoices_items" USING btree ("_parent_id");
  CREATE INDEX "invoices_tenant_id_idx" ON "invoices" USING btree ("tenant_id");
  CREATE INDEX "invoices_order_id_idx" ON "invoices" USING btree ("order_id");
  CREATE INDEX "invoices_invoice_number_idx" ON "invoices" USING btree ("invoice_number");
  CREATE INDEX "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX "invoice_allowances_items_order_idx" ON "invoice_allowances_items" USING btree ("_order");
  CREATE INDEX "invoice_allowances_items_parent_id_idx" ON "invoice_allowances_items" USING btree ("_parent_id");
  CREATE INDEX "invoice_allowances_tenant_id_idx" ON "invoice_allowances" USING btree ("tenant_id");
  CREATE INDEX "invoice_allowances_invoice_id_idx" ON "invoice_allowances" USING btree ("invoice_id");
  CREATE INDEX "invoice_allowances_allowance_number_idx" ON "invoice_allowances" USING btree ("allowance_number");
  CREATE INDEX "invoice_allowances_updated_at_idx" ON "invoice_allowances" USING btree ("updated_at");
  CREATE INDEX "invoice_allowances_created_at_idx" ON "invoice_allowances" USING btree ("created_at");
  CREATE INDEX "invoice_logs_tenant_id_idx" ON "invoice_logs" USING btree ("tenant_id");
  CREATE INDEX "invoice_logs_order_id_idx" ON "invoice_logs" USING btree ("order_id");
  CREATE INDEX "invoice_logs_invoice_id_idx" ON "invoice_logs" USING btree ("invoice_id");
  CREATE INDEX "invoice_logs_updated_at_idx" ON "invoice_logs" USING btree ("updated_at");
  CREATE INDEX "invoice_logs_created_at_idx" ON "invoice_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoice_allowances_fk" FOREIGN KEY ("invoice_allowances_id") REFERENCES "public"."invoice_allowances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoice_logs_fk" FOREIGN KEY ("invoice_logs_id") REFERENCES "public"."invoice_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");
  CREATE INDEX "payload_locked_documents_rels_invoice_allowances_id_idx" ON "payload_locked_documents_rels" USING btree ("invoice_allowances_id");
  CREATE INDEX "payload_locked_documents_rels_invoice_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("invoice_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "invoices_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invoice_allowances_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invoice_allowances" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invoice_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "invoices_items" CASCADE;
  DROP TABLE "invoices" CASCADE;
  DROP TABLE "invoice_allowances_items" CASCADE;
  DROP TABLE "invoice_allowances" CASCADE;
  DROP TABLE "invoice_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_invoices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_invoice_allowances_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_invoice_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_invoices_id_idx";
  DROP INDEX "payload_locked_documents_rels_invoice_allowances_id_idx";
  DROP INDEX "payload_locked_documents_rels_invoice_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "invoices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "invoice_allowances_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "invoice_logs_id";
  DROP TYPE "public"."enum_invoices_provider";
  DROP TYPE "public"."enum_invoices_category";
  DROP TYPE "public"."enum_invoices_issue_mode";
  DROP TYPE "public"."enum_invoices_status";
  DROP TYPE "public"."enum_invoices_tax_type";
  DROP TYPE "public"."enum_invoices_carrier_type";
  DROP TYPE "public"."enum_invoice_allowances_status";
  DROP TYPE "public"."enum_invoice_logs_provider";
  DROP TYPE "public"."enum_invoice_logs_action";`)
}
