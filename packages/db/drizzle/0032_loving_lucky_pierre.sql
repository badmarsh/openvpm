CREATE TYPE "public"."ekasa_payment_method" AS ENUM('CASH', 'CARD', 'TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."ekasa_pokladnica_type" AS ENUM('ORP', 'VRP', 'CLOUD');--> statement-breakpoint
CREATE TYPE "public"."ekasa_receipt_status" AS ENUM('PENDING', 'SENT', 'CONFIRMED', 'FAILED', 'OFFLINE_STORED');--> statement-breakpoint
CREATE TYPE "public"."ekasa_vat_rate" AS ENUM('ZERO', 'REDUCED', 'STANDARD');--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"api_key" text NOT NULL,
	"endpoint" text NOT NULL,
	"model" text NOT NULL,
	"max_tokens" integer DEFAULT 4000 NOT NULL,
	"temperature" real DEFAULT 0.3 NOT NULL,
	"accuracy" real DEFAULT 90 NOT NULL,
	"speed" real DEFAULT 80 NOT NULL,
	"cost" real DEFAULT 0.03 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_test" timestamp DEFAULT now() NOT NULL,
	"test_results" jsonb DEFAULT '{"accuracy":90,"responseTime":2,"reliability":90}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"template_id" uuid,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"variants" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scheduled_date" timestamp with time zone,
	"review_notes" jsonb DEFAULT '[]'::jsonb,
	"history" jsonb DEFAULT '[]'::jsonb,
	"topic_inputs" jsonb DEFAULT '{}'::jsonb,
	"overlay_text" varchar(512),
	"has_consent" jsonb DEFAULT 'false'::jsonb,
	"has_watermark" jsonb DEFAULT 'true'::jsonb
);
--> statement-breakpoint
CREATE TABLE "marketing_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aspect_ratios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"media_type" varchar(32) DEFAULT 'image' NOT NULL,
	"prompt_skeleton" text NOT NULL,
	"example_caption" text,
	"requires_consent" jsonb DEFAULT 'false'::jsonb,
	"is_global" jsonb DEFAULT 'false'::jsonb
);
--> statement-breakpoint
CREATE TABLE "crm_automation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"automation_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"channel" varchar(32) NOT NULL,
	"message_content" text,
	"error_message" text,
	"fired_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "crm_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"trigger_type" varchar(64) NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"action_type" varchar(32) NOT NULL,
	"action_payload" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"external_workflow_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "canvas_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" varchar(512) NOT NULL,
	"doc_type" varchar(64) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_rag_source" jsonb DEFAULT 'false'::jsonb
);
--> statement-breakpoint
CREATE TABLE "canvas_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"title" varchar(255) NOT NULL,
	"description" text,
	"doc_type" varchar(64) NOT NULL,
	"category" varchar(64) NOT NULL,
	"content_skeleton" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ekasa_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"dic" text NOT NULL,
	"ic_dph" text,
	"pokladnica_id" text NOT NULL,
	"pokladnica_type" "ekasa_pokladnica_type" DEFAULT 'CLOUD' NOT NULL,
	"ekasa_api_url" text DEFAULT 'https://ekasa.financnasprava.sk/oto/api' NOT NULL,
	"cert_base64" text,
	"cert_password" text,
	"offline_mode_enabled" boolean DEFAULT false NOT NULL,
	"cashless_enabled" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ekasa_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"invoice_id" uuid,
	"receipt_number" text NOT NULL,
	"uid" text,
	"okp" text,
	"pkp" text,
	"amount_base" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"amount_vat" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"amount_total" numeric(12, 2) NOT NULL,
	"vat_rate" "ekasa_vat_rate" DEFAULT 'ZERO' NOT NULL,
	"payment_method" "ekasa_payment_method" DEFAULT 'CARD' NOT NULL,
	"status" "ekasa_receipt_status" DEFAULT 'PENDING' NOT NULL,
	"raw_response" jsonb,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retry_count" numeric(4, 0) DEFAULT '0' NOT NULL,
	"last_retry_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "ico" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" varchar(10);--> statement-breakpoint
ALTER TABLE "marketing_posts" ADD CONSTRAINT "marketing_posts_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_posts" ADD CONSTRAINT "marketing_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_posts" ADD CONSTRAINT "marketing_posts_template_id_marketing_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."marketing_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_templates" ADD CONSTRAINT "marketing_templates_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_automation_logs" ADD CONSTRAINT "crm_automation_logs_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_automation_logs" ADD CONSTRAINT "crm_automation_logs_automation_id_crm_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."crm_automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_automations" ADD CONSTRAINT "crm_automations_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvas_documents" ADD CONSTRAINT "canvas_documents_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvas_documents" ADD CONSTRAINT "canvas_documents_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ekasa_config" ADD CONSTRAINT "ekasa_config_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ekasa_receipts" ADD CONSTRAINT "ekasa_receipts_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ekasa_receipts" ADD CONSTRAINT "ekasa_receipts_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "marketing_posts_practice_idx" ON "marketing_posts" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE INDEX "marketing_posts_status_idx" ON "marketing_posts" USING btree ("practice_id","status","deleted_at");--> statement-breakpoint
CREATE INDEX "marketing_posts_scheduled_idx" ON "marketing_posts" USING btree ("practice_id","scheduled_date","deleted_at");--> statement-breakpoint
CREATE INDEX "marketing_templates_practice_idx" ON "marketing_templates" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE INDEX "marketing_templates_category_idx" ON "marketing_templates" USING btree ("category","practice_id");--> statement-breakpoint
CREATE INDEX "crm_automation_logs_practice_idx" ON "crm_automation_logs" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE INDEX "crm_automation_logs_automation_idx" ON "crm_automation_logs" USING btree ("automation_id","status");--> statement-breakpoint
CREATE INDEX "crm_automations_practice_idx" ON "crm_automations" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE INDEX "crm_automations_active_idx" ON "crm_automations" USING btree ("practice_id","is_active","deleted_at");--> statement-breakpoint
CREATE INDEX "canvas_documents_practice_idx" ON "canvas_documents" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE INDEX "canvas_documents_type_idx" ON "canvas_documents" USING btree ("practice_id","doc_type","deleted_at");--> statement-breakpoint
CREATE INDEX "canvas_documents_status_idx" ON "canvas_documents" USING btree ("practice_id","status","deleted_at");--> statement-breakpoint
CREATE INDEX "canvas_templates_category_idx" ON "canvas_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ekasa_config_practice_idx" ON "ekasa_config" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ekasa_config_practice_active_uq" ON "ekasa_config" USING btree ("practice_id","is_active");--> statement-breakpoint
CREATE INDEX "ekasa_receipts_practice_idx" ON "ekasa_receipts" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ekasa_receipts_number_practice_uq" ON "ekasa_receipts" USING btree ("practice_id","receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "ekasa_receipts_uid_uq" ON "ekasa_receipts" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "ekasa_receipts_status_idx" ON "ekasa_receipts" USING btree ("practice_id","status","deleted_at");--> statement-breakpoint
CREATE INDEX "ekasa_receipts_issued_at_idx" ON "ekasa_receipts" USING btree ("practice_id","issued_at","deleted_at");