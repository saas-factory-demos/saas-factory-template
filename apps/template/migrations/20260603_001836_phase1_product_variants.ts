import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_inventory_strategy" AS ENUM('normal', 'limited');
  CREATE TABLE "products_option_defs_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_option_defs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"option_values" jsonb,
  	"unit_price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"stock" numeric DEFAULT 0,
  	"reserved_stock" numeric DEFAULT 0,
  	"image_id" integer,
  	"weight_grams" numeric
  );
  
  ALTER TABLE "products" ADD COLUMN "inventory_strategy" "enum_products_inventory_strategy" DEFAULT 'normal' NOT NULL;
  ALTER TABLE "products_option_defs_values" ADD CONSTRAINT "products_option_defs_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_option_defs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_option_defs" ADD CONSTRAINT "products_option_defs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_option_defs_values_order_idx" ON "products_option_defs_values" USING btree ("_order");
  CREATE INDEX "products_option_defs_values_parent_id_idx" ON "products_option_defs_values" USING btree ("_parent_id");
  CREATE INDEX "products_option_defs_order_idx" ON "products_option_defs" USING btree ("_order");
  CREATE INDEX "products_option_defs_parent_id_idx" ON "products_option_defs" USING btree ("_parent_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_variants_sku_idx" ON "products_variants" USING btree ("sku");
  CREATE INDEX "products_variants_image_idx" ON "products_variants" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_option_defs_values" CASCADE;
  DROP TABLE "products_option_defs" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  ALTER TABLE "products" DROP COLUMN "inventory_strategy";
  DROP TYPE "public"."enum_products_inventory_strategy";`)
}
