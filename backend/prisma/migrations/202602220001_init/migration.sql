-- Real initial migration for MVP schema.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('estimator', 'pricing_admin', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "QuoteStatus" AS ENUM ('Draft', 'Finalized', 'Archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "QuoteRowType" AS ENUM ('db_part', 'manual_part', 'note');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "parts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "part_number" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "cost" NUMERIC(12,4) NOT NULL,
  "status" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by_user_id" UUID NULL,
  "updated_by_user_id" UUID NULL
);

CREATE INDEX IF NOT EXISTS "parts_part_number_idx" ON "parts" ("part_number");

CREATE TABLE IF NOT EXISTS "quotes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quote_number" TEXT NOT NULL,
  "version_group_id" UUID NOT NULL,
  "version_no" INTEGER NOT NULL,
  "status" "QuoteStatus" NOT NULL DEFAULT 'Draft',
  "quote_date" DATE NOT NULL,
  "customer_name" TEXT NOT NULL,
  "customer_attn" TEXT NULL,
  "customer_address1" TEXT NULL,
  "customer_address2" TEXT NULL,
  "customer_city" TEXT NULL,
  "customer_state" TEXT NULL,
  "customer_zip" TEXT NULL,
  "project_name" TEXT NULL,
  "estimator_name" TEXT NULL,
  "estimator_email" TEXT NULL,
  "estimator_phone" TEXT NULL,
  "rep_code" TEXT NOT NULL DEFAULT 'HOUSE',
  "rja_markup_pct" NUMERIC(8,4) NOT NULL DEFAULT 0,
  "rep_markup_pct" NUMERIC(8,4) NOT NULL DEFAULT 0,
  "total_markup_pct" NUMERIC(8,4) NOT NULL DEFAULT 0,
  "subtotal_sell" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "grand_total" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "notes_footer" TEXT NULL,
  "created_by_user_id" UUID NOT NULL,
  "revised_from_quote_id" UUID NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "quotes_quote_number_version_no_key" UNIQUE ("quote_number", "version_no")
);

CREATE INDEX IF NOT EXISTS "quotes_quote_number_idx" ON "quotes" ("quote_number");
CREATE INDEX IF NOT EXISTS "quotes_version_group_id_idx" ON "quotes" ("version_group_id");

CREATE TABLE IF NOT EXISTS "quote_rows" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quote_id" UUID NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
  "line_order" INTEGER NOT NULL,
  "row_type" "QuoteRowType" NOT NULL,
  "source_part_id" UUID NULL,
  "part_number" TEXT NULL,
  "qty" NUMERIC(12,3) NULL,
  "description" TEXT NULL,
  "master_cost_snapshot" NUMERIC(12,4) NULL,
  "override_cost" NUMERIC(12,4) NULL,
  "effective_cost" NUMERIC(12,4) NULL,
  "sell_unit_price" NUMERIC(12,4) NULL,
  "line_total" NUMERIC(14,2) NULL,
  "is_price_overridden" BOOLEAN NOT NULL DEFAULT false,
  "override_reason" TEXT NULL,
  "created_by_user_id" UUID NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "quote_rows_quote_id_idx" ON "quote_rows" ("quote_id");
CREATE INDEX IF NOT EXISTS "quote_rows_line_order_idx" ON "quote_rows" ("line_order");

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_type" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" UUID NULL,
  "quote_id" UUID NULL,
  "quote_row_id" UUID NULL,
  "part_id" UUID NULL,
  "part_number" TEXT NULL,
  "user_id" UUID NULL,
  "user_name_snapshot" TEXT NULL,
  "old_values_json" JSONB NULL,
  "new_values_json" JSONB NULL,
  "reason" TEXT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "rep_markup_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rep_code" TEXT NOT NULL UNIQUE,
  "rep_label" TEXT NOT NULL,
  "default_rep_markup_pct" NUMERIC(8,4) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_by_user_id" UUID NULL
);
