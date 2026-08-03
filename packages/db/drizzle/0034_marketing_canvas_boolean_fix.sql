-- OpenVPM Migration 0034: Fix boolean columns in marketing and canvas schemas
-- ---------------------------------------------------------------------------
-- The Social Studio migration used jsonb() for boolean flags instead of the
-- native boolean() type used everywhere else in the schema. This migration
-- converts those columns safely using an explicit USING cast.
--
-- jsonb stores true/false as JSON literals whose ::text representation is
-- 'true'/'false', which Postgres accepts as valid boolean input.
-- NULL values are preserved. The DEFAULT is set to match the Drizzle schema.
-- ---------------------------------------------------------------------------

-- marketing_templates: requiresConsent, isGlobal
ALTER TABLE marketing_templates
  ALTER COLUMN requires_consent DROP DEFAULT,
  ALTER COLUMN requires_consent TYPE boolean
    USING (requires_consent::text)::boolean,
  ALTER COLUMN requires_consent SET NOT NULL,
  ALTER COLUMN requires_consent SET DEFAULT false;

--> statement-breakpoint

ALTER TABLE marketing_templates
  ALTER COLUMN is_global DROP DEFAULT,
  ALTER COLUMN is_global TYPE boolean
    USING (is_global::text)::boolean,
  ALTER COLUMN is_global SET NOT NULL,
  ALTER COLUMN is_global SET DEFAULT false;

--> statement-breakpoint

-- marketing_posts: hasConsent, hasWatermark
ALTER TABLE marketing_posts
  ALTER COLUMN has_consent DROP DEFAULT,
  ALTER COLUMN has_consent TYPE boolean
    USING (has_consent::text)::boolean,
  ALTER COLUMN has_consent SET NOT NULL,
  ALTER COLUMN has_consent SET DEFAULT false;

--> statement-breakpoint

ALTER TABLE marketing_posts
  ALTER COLUMN has_watermark DROP DEFAULT,
  ALTER COLUMN has_watermark TYPE boolean
    USING (has_watermark::text)::boolean,
  ALTER COLUMN has_watermark SET NOT NULL,
  ALTER COLUMN has_watermark SET DEFAULT true;

--> statement-breakpoint

-- canvas_documents: isRagSource
ALTER TABLE canvas_documents
  ALTER COLUMN is_rag_source DROP DEFAULT,
  ALTER COLUMN is_rag_source TYPE boolean
    USING (is_rag_source::text)::boolean,
  ALTER COLUMN is_rag_source SET NOT NULL,
  ALTER COLUMN is_rag_source SET DEFAULT false;
