CREATE TABLE "website_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"page_id" uuid NOT NULL,
	"block_type" varchar(64) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"website_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"page_type" varchar(32) DEFAULT 'custom' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"og_image" varchar(512),
	"show_in_nav" boolean DEFAULT true NOT NULL,
	"is_home" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"website_id" uuid NOT NULL,
	"submission_type" varchar(32) DEFAULT 'contact' NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(45),
	"is_read" boolean DEFAULT false NOT NULL,
	"communication_id" uuid
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"template_id" varchar(64) DEFAULT 'clean-modern' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"og_image" varchar(512),
	"published_at" timestamp with time zone,
	"published_by" uuid,
	"locale" varchar(10) DEFAULT 'sk' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketing_posts" ALTER COLUMN "has_consent" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "marketing_posts" ALTER COLUMN "has_consent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "marketing_posts" ALTER COLUMN "has_watermark" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "marketing_posts" ALTER COLUMN "has_watermark" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "marketing_posts" ALTER COLUMN "has_watermark" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "marketing_templates" ALTER COLUMN "requires_consent" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "marketing_templates" ALTER COLUMN "requires_consent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "marketing_templates" ALTER COLUMN "is_global" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "marketing_templates" ALTER COLUMN "is_global" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "canvas_documents" ALTER COLUMN "is_rag_source" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "canvas_documents" ALTER COLUMN "is_rag_source" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "website_blocks" ADD CONSTRAINT "website_blocks_page_id_website_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."website_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_pages" ADD CONSTRAINT "website_pages_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_submissions" ADD CONSTRAINT "website_submissions_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "website_blocks_page_idx" ON "website_blocks" USING btree ("page_id","deleted_at");--> statement-breakpoint
CREATE INDEX "website_blocks_sort_idx" ON "website_blocks" USING btree ("page_id","sort_order");--> statement-breakpoint
CREATE INDEX "website_pages_website_idx" ON "website_pages" USING btree ("website_id","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "website_pages_slug_idx" ON "website_pages" USING btree ("website_id","slug","deleted_at");--> statement-breakpoint
CREATE INDEX "website_pages_sort_idx" ON "website_pages" USING btree ("website_id","sort_order");--> statement-breakpoint
CREATE INDEX "website_submissions_website_idx" ON "website_submissions" USING btree ("website_id","deleted_at");--> statement-breakpoint
CREATE INDEX "website_submissions_read_idx" ON "website_submissions" USING btree ("website_id","is_read");--> statement-breakpoint
CREATE INDEX "websites_practice_idx" ON "websites" USING btree ("practice_id","deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "websites_slug_uq" ON "websites" USING btree ("slug","deleted_at");--> statement-breakpoint
CREATE INDEX "websites_status_idx" ON "websites" USING btree ("practice_id","status","deleted_at");