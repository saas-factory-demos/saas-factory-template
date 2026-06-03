import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_product_type" AS ENUM('simple', 'bundle');
  CREATE TYPE "public"."enum_orders_shipments_carrier" AS ENUM('tcat', 'hct', 'pelican', 'seven', 'family-mart', 'hilife', 'okmart', 'pickup', 'international');
  CREATE TYPE "public"."enum_orders_shipments_status" AS ENUM('pending', 'shipped', 'delivered', 'returned');
  CREATE TABLE "products_bundle_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_sku" varchar,
  	"quantity" numeric DEFAULT 1
  );
  
  CREATE TABLE "orders_shipments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"shipment_number" varchar,
  	"tracking_number" varchar,
  	"carrier" "enum_orders_shipments_carrier",
  	"status" "enum_orders_shipments_status" DEFAULT 'pending' NOT NULL,
  	"items" jsonb,
  	"shipped_at" timestamp(3) with time zone,
  	"delivered_at" timestamp(3) with time zone,
  	"notes" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "product_type" "enum_products_product_type" DEFAULT 'simple' NOT NULL;
  ALTER TABLE "products_bundle_items" ADD CONSTRAINT "products_bundle_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_bundle_items" ADD CONSTRAINT "products_bundle_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_shipments" ADD CONSTRAINT "orders_shipments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_bundle_items_order_idx" ON "products_bundle_items" USING btree ("_order");
  CREATE INDEX "products_bundle_items_parent_id_idx" ON "products_bundle_items" USING btree ("_parent_id");
  CREATE INDEX "products_bundle_items_product_idx" ON "products_bundle_items" USING btree ("product_id");
  CREATE INDEX "orders_shipments_order_idx" ON "orders_shipments" USING btree ("_order");
  CREATE INDEX "orders_shipments_parent_id_idx" ON "orders_shipments" USING btree ("_parent_id");
  CREATE INDEX "products_product_type_idx" ON "products" USING btree ("product_type");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_bundle_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_shipments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_bundle_items" CASCADE;
  DROP TABLE "orders_shipments" CASCADE;
  DROP INDEX "products_product_type_idx";
  ALTER TABLE "products" DROP COLUMN "product_type";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_orders_shipments_carrier";
  DROP TYPE "public"."enum_orders_shipments_status";`)
}
