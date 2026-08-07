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
ALTER TABLE "canvas_documents" ALTER COLUMN "is_rag_source" SET NOT NULL;