import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_carts_applied_discounts_category" AS ENUM('auto-percentage', 'auto-amount', 'coupon', 'shipping', 'bundle');
  CREATE TYPE "public"."enum_carts_status" AS ENUM('active', 'converted', 'abandoned');
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD');
  CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_sku" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"option_values_snapshot" jsonb,
  	"unit_price_snapshot" numeric NOT NULL,
  	"title_snapshot" varchar,
  	"reserved_until" timestamp(3) with time zone,
  	"added_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "carts_applied_discounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rule_id" varchar NOT NULL,
  	"rule_title" varchar,
  	"category" "enum_carts_applied_discounts_category",
  	"discount_amount" numeric,
  	"applied_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cart_id" varchar NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"user_id" integer,
  	"guest_session_id" varchar,
  	"guest_email" varchar,
  	"status" "enum_carts_status" DEFAULT 'active' NOT NULL,
  	"coupon_code" varchar,
  	"subtotal" numeric DEFAULT 0,
  	"discount_total" numeric DEFAULT 0,
  	"estimated_total" numeric DEFAULT 0,
  	"currency" "enum_carts_currency" DEFAULT 'TWD',
  	"expires_at" timestamp(3) with time zone,
  	"last_activity_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carts_id" integer;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts_applied_discounts" ADD CONSTRAINT "carts_applied_discounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE INDEX "carts_items_product_idx" ON "carts_items" USING btree ("product_id");
  CREATE INDEX "carts_applied_discounts_order_idx" ON "carts_applied_discounts" USING btree ("_order");
  CREATE INDEX "carts_applied_discounts_parent_id_idx" ON "carts_applied_discounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "carts_cart_id_idx" ON "carts" USING btree ("cart_id");
  CREATE INDEX "carts_tenant_id_idx" ON "carts" USING btree ("tenant_id");
  CREATE INDEX "carts_user_idx" ON "carts" USING btree ("user_id");
  CREATE INDEX "carts_guest_session_id_idx" ON "carts" USING btree ("guest_session_id");
  CREATE INDEX "carts_status_idx" ON "carts" USING btree ("status");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts_applied_discounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts_applied_discounts" CASCADE;
  DROP TABLE "carts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carts_fk";
  
  DROP INDEX "payload_locked_documents_rels_carts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carts_id";
  DROP TYPE "public"."enum_carts_applied_discounts_category";
  DROP TYPE "public"."enum_carts_status";
  DROP TYPE "public"."enum_carts_currency";`)
}
