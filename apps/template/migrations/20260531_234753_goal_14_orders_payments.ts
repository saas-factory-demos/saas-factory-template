import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('draft', 'pending-payment', 'paid', 'preparing', 'shipped', 'delivered', 'completed', 'refund-requested', 'refunded', 'cancelled');
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('credit', 'credit-installment', 'atm', 'cvs', 'cvs-barcode', 'webatm', 'linepay', 'jkopay', 'applepay', 'googlepay', 'samsungpay', 'pi-wallet', 'easycard', 'esun-wallet', 'taiwanpay', 'stripe-card', 'paypal', 'cod', 'enterprise-transfer');
  CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('newebpay', 'ecpay', 'linepay-official', 'jkopay-official', 'tappay', 'stripe', 'paypal');
  CREATE TYPE "public"."enum_payments_provider" AS ENUM('newebpay', 'ecpay', 'linepay-official', 'jkopay-official', 'tappay', 'stripe', 'paypal');
  CREATE TYPE "public"."enum_payments_method" AS ENUM('credit', 'credit-installment', 'atm', 'cvs', 'cvs-barcode', 'webatm', 'linepay', 'jkopay', 'applepay', 'googlepay', 'samsungpay', 'pi-wallet', 'easycard', 'esun-wallet', 'taiwanpay', 'stripe-card', 'paypal', 'cod', 'enterprise-transfer');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'succeeded', 'failed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_payments_currency" AS ENUM('TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD');
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"user_id" integer,
  	"guest_email" varchar,
  	"guest_phone" varchar,
  	"status" "enum_orders_status" DEFAULT 'draft' NOT NULL,
  	"items" jsonb NOT NULL,
  	"currency" "enum_orders_currency" DEFAULT 'TWD' NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"discount_total" numeric DEFAULT 0 NOT NULL,
  	"shipping_fee" numeric DEFAULT 0 NOT NULL,
  	"tax_amount" numeric DEFAULT 0 NOT NULL,
  	"total" numeric NOT NULL,
  	"payment_method" "enum_orders_payment_method",
  	"payment_provider" "enum_orders_payment_provider",
  	"payment_txn_id" varchar,
  	"marketing_opt_in" boolean DEFAULT false,
  	"note" varchar,
  	"internal_note" varchar,
  	"shipping_address" jsonb,
  	"billing_address" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"provider" "enum_payments_provider" NOT NULL,
  	"method" "enum_payments_method" NOT NULL,
  	"provider_txn_id" varchar NOT NULL,
  	"status" "enum_payments_status" DEFAULT 'pending' NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" "enum_payments_currency" DEFAULT 'TWD' NOT NULL,
  	"fee_amount" numeric,
  	"is_refund" boolean DEFAULT false,
  	"parent_payment_id" integer,
  	"raw_payload" jsonb,
  	"failure_code" varchar,
  	"failure_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payments_id" integer;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_parent_payment_id_payments_id_fk" FOREIGN KEY ("parent_payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_tenant_id_idx" ON "orders" USING btree ("tenant_id");
  CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");
  CREATE INDEX "payments_tenant_id_idx" ON "payments" USING btree ("tenant_id");
  CREATE INDEX "payments_provider_idx" ON "payments" USING btree ("provider");
  CREATE INDEX "payments_provider_txn_id_idx" ON "payments" USING btree ("provider_txn_id");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_parent_payment_idx" ON "payments" USING btree ("parent_payment_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "payments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payments_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_payments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payments_id";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_currency";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_payment_provider";
  DROP TYPE "public"."enum_payments_provider";
  DROP TYPE "public"."enum_payments_method";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_currency";`)
}
