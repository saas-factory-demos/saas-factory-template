import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_factory_support_logs_action" AS ENUM('provision', 'rotate-password', 'disable', 'enable', 'status', 'login', 'manual-action');
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'factory-support';
  CREATE TABLE "factory_support_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_factory_support_logs_action" NOT NULL,
  	"actor_email" varchar NOT NULL,
  	"client_ip" varchar,
  	"user_agent" varchar,
  	"payload_summary" varchar NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"related_user_id_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "is_factory_managed" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "factory_access_disabled_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "factory_support_logs_id" integer;
  ALTER TABLE "factory_support_logs" ADD CONSTRAINT "factory_support_logs_related_user_id_id_users_id_fk" FOREIGN KEY ("related_user_id_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "factory_support_logs_action_idx" ON "factory_support_logs" USING btree ("action");
  CREATE INDEX "factory_support_logs_timestamp_idx" ON "factory_support_logs" USING btree ("timestamp");
  CREATE INDEX "factory_support_logs_related_user_id_idx" ON "factory_support_logs" USING btree ("related_user_id_id");
  CREATE INDEX "factory_support_logs_updated_at_idx" ON "factory_support_logs" USING btree ("updated_at");
  CREATE INDEX "factory_support_logs_created_at_idx" ON "factory_support_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_factory_support_logs_fk" FOREIGN KEY ("factory_support_logs_id") REFERENCES "public"."factory_support_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_factory_support_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("factory_support_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "factory_support_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "factory_support_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_factory_support_logs_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'admin', 'editor', 'viewer');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  DROP INDEX "payload_locked_documents_rels_factory_support_logs_id_idx";
  ALTER TABLE "users" DROP COLUMN "is_factory_managed";
  ALTER TABLE "users" DROP COLUMN "factory_access_disabled_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "factory_support_logs_id";
  DROP TYPE "public"."enum_factory_support_logs_action";`)
}
