CREATE TYPE "public"."ai_consultation_status" AS ENUM('RECORDING', 'TRANSCRIBING', 'ANALYZING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "ai_consultation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"practice_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"audio_url" text,
	"raw_transcript" text,
	"generated_soap" jsonb,
	"suggested_billing_items" jsonb,
	"status" "ai_consultation_status" DEFAULT 'RECORDING' NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "ai_consultation_sessions" ADD CONSTRAINT "ai_consultation_sessions_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_consultation_sessions" ADD CONSTRAINT "ai_consultation_sessions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_consultation_sessions" ADD CONSTRAINT "ai_consultation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_sessions_practice_patient_idx" ON "ai_consultation_sessions" USING btree ("practice_id","patient_id","deleted_at");--> statement-breakpoint
CREATE INDEX "ai_sessions_user_idx" ON "ai_consultation_sessions" USING btree ("user_id","deleted_at");