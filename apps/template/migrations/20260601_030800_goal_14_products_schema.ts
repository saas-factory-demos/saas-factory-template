import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_products_currency" AS ENUM('TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD');
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "sku" varchar;
  ALTER TABLE "products" ADD COLUMN "status" "enum_products_status" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "products" ADD COLUMN "unit_price" numeric NOT NULL;
  ALTER TABLE "products" ADD COLUMN "compare_at_price" numeric;
  ALTER TABLE "products" ADD COLUMN "currency" "enum_products_currency" DEFAULT 'TWD' NOT NULL;
  ALTER TABLE "products" ADD COLUMN "stock" numeric DEFAULT 0;
  ALTER TABLE "products" ADD COLUMN "short_description" varchar;
  ALTER TABLE "products" ADD COLUMN "long_description" jsonb;
  ALTER TABLE "products" ADD COLUMN "tenant_id" varchar;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE INDEX "products_status_idx" ON "products" USING btree ("status");
  CREATE INDEX "products_tenant_id_idx" ON "products" USING btree ("tenant_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_gallery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_gallery" CASCADE;
  DROP INDEX "products_sku_idx";
  DROP INDEX "products_status_idx";
  DROP INDEX "products_tenant_id_idx";
  ALTER TABLE "products" DROP COLUMN "sku";
  ALTER TABLE "products" DROP COLUMN "status";
  ALTER TABLE "products" DROP COLUMN "unit_price";
  ALTER TABLE "products" DROP COLUMN "compare_at_price";
  ALTER TABLE "products" DROP COLUMN "currency";
  ALTER TABLE "products" DROP COLUMN "stock";
  ALTER TABLE "products" DROP COLUMN "short_description";
  ALTER TABLE "products" DROP COLUMN "long_description";
  ALTER TABLE "products" DROP COLUMN "tenant_id";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum_products_currency";`)
}
