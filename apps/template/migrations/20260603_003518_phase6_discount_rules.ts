import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_discount_rules_category" AS ENUM('auto-percentage', 'auto-amount', 'coupon', 'shipping', 'bundle');
  CREATE TYPE "public"."enum_discount_rules_type" AS ENUM('percentage_off', 'fixed_off', 'free_shipping', 'buy_x_get_y', 'tiered', 'bundle', 'nth_item_off', 'gift', 'first_purchase', 'subscription_loyalty');
  CREATE TABLE "discount_rules_mutex_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "discount_rules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"display_label" varchar,
  	"tenant_id" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"category" "enum_discount_rules_category" NOT NULL,
  	"type" "enum_discount_rules_type" NOT NULL,
  	"params" jsonb,
  	"conditions" jsonb,
  	"priority" numeric DEFAULT 50,
  	"coupon_code" varchar,
  	"max_uses" numeric,
  	"used_count" numeric DEFAULT 0,
  	"max_uses_per_user" numeric,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"stackable" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "discount_rules_id" integer;
  ALTER TABLE "discount_rules_mutex_tags" ADD CONSTRAINT "discount_rules_mutex_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."discount_rules"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "discount_rules_mutex_tags_order_idx" ON "discount_rules_mutex_tags" USING btree ("_order");
  CREATE INDEX "discount_rules_mutex_tags_parent_id_idx" ON "discount_rules_mutex_tags" USING btree ("_parent_id");
  CREATE INDEX "discount_rules_tenant_id_idx" ON "discount_rules" USING btree ("tenant_id");
  CREATE INDEX "discount_rules_active_idx" ON "discount_rules" USING btree ("active");
  CREATE INDEX "discount_rules_category_idx" ON "discount_rules" USING btree ("category");
  CREATE INDEX "discount_rules_updated_at_idx" ON "discount_rules" USING btree ("updated_at");
  CREATE INDEX "discount_rules_created_at_idx" ON "discount_rules" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discount_rules_fk" FOREIGN KEY ("discount_rules_id") REFERENCES "public"."discount_rules"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_discount_rules_id_idx" ON "payload_locked_documents_rels" USING btree ("discount_rules_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "discount_rules_mutex_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "discount_rules" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "discount_rules_mutex_tags" CASCADE;
  DROP TABLE "discount_rules" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_discount_rules_fk";
  
  DROP INDEX "payload_locked_documents_rels_discount_rules_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "discount_rules_id";
  DROP TYPE "public"."enum_discount_rules_category";
  DROP TYPE "public"."enum_discount_rules_type";`)
}
