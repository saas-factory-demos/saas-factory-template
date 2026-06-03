import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_subscription_interval" AS ENUM('day', 'week', 'month', 'year');
  CREATE TYPE "public"."enum_subscriptions_provider" AS ENUM('newebpay', 'ecpay', 'linepay-official', 'jkopay-official', 'tappay', 'stripe', 'paypal');
  CREATE TYPE "public"."enum_subscriptions_status" AS ENUM('pending', 'active', 'paused', 'cancelled', 'failed');
  CREATE TYPE "public"."enum_subscriptions_currency" AS ENUM('TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD');
  CREATE TYPE "public"."enum_subscriptions_interval" AS ENUM('day', 'week', 'month', 'year');
  CREATE TABLE "subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"user_id" integer,
  	"guest_email" varchar,
  	"guest_phone" varchar,
  	"product_id" integer NOT NULL,
  	"provider" "enum_subscriptions_provider" NOT NULL,
  	"provider_subscription_id" varchar NOT NULL,
  	"status" "enum_subscriptions_status" DEFAULT 'pending' NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" "enum_subscriptions_currency" DEFAULT 'TWD' NOT NULL,
  	"interval" "enum_subscriptions_interval" NOT NULL,
  	"interval_count" numeric DEFAULT 1 NOT NULL,
  	"next_billing_at" timestamp(3) with time zone,
  	"last_payment_at" timestamp(3) with time zone,
  	"cancelled_at" timestamp(3) with time zone,
  	"cancel_reason" varchar,
  	"raw_payload" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "is_subscription" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "subscription_interval" "enum_products_subscription_interval" DEFAULT 'month';
  ALTER TABLE "products" ADD COLUMN "subscription_interval_count" numeric DEFAULT 1;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscriptions_id" integer;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions" USING btree ("tenant_id");
  CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");
  CREATE INDEX "subscriptions_product_idx" ON "subscriptions" USING btree ("product_id");
  CREATE INDEX "subscriptions_provider_idx" ON "subscriptions" USING btree ("provider");
  CREATE UNIQUE INDEX "subscriptions_provider_subscription_id_idx" ON "subscriptions" USING btree ("provider_subscription_id");
  CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");
  CREATE INDEX "subscriptions_updated_at_idx" ON "subscriptions" USING btree ("updated_at");
  CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriptions_fk" FOREIGN KEY ("subscriptions_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriptions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subscriptions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscriptions_fk";
  
  DROP INDEX "payload_locked_documents_rels_subscriptions_id_idx";
  ALTER TABLE "products" DROP COLUMN "is_subscription";
  ALTER TABLE "products" DROP COLUMN "subscription_interval";
  ALTER TABLE "products" DROP COLUMN "subscription_interval_count";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscriptions_id";
  DROP TYPE "public"."enum_products_subscription_interval";
  DROP TYPE "public"."enum_subscriptions_provider";
  DROP TYPE "public"."enum_subscriptions_status";
  DROP TYPE "public"."enum_subscriptions_currency";
  DROP TYPE "public"."enum_subscriptions_interval";`)
}
