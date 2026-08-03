import {
  pgTable,
  pgEnum,
  uuid,
  text,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { patients } from "./patients";
import { users } from "./users";

export const aiConsultationStatusEnum = pgEnum("ai_consultation_status", [
  "RECORDING",
  "TRANSCRIBING",
  "ANALYZING",
  "COMPLETED",
  "FAILED",
]);

export const aiConsultationSessions = pgTable(
  "ai_consultation_sessions",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    
    // Zvuková stopa - vyriešené dočasným zahodením po spracovaní (null) alebo dočasným base64 pre malé nahrávky
    audioUrl: text("audio_url"),
    
    // Výstupy z Whisperu/Gemini
    rawTranscript: text("raw_transcript"),
    
    // Generovaný SOAP (strukturou { subjective: string, objective: string, assessment: string, plan: string })
    generatedSoap: jsonb("generated_soap"),
    
    // Extrahované položky na vyfakturovanie: array [{ id: string, name: string, quantity: number, type: "product"|"service" }]
    suggestedBillingItems: jsonb("suggested_billing_items"),
    
    status: aiConsultationStatusEnum("status").notNull().default("RECORDING"),
    errorMessage: text("error_message"),
  },
  (table) => ({
    practicePatientIdx: index("ai_sessions_practice_patient_idx").on(
      table.practiceId,
      table.patientId,
      table.deletedAt
    ),
    userIdx: index("ai_sessions_user_idx").on(
      table.userId,
      table.deletedAt
    ),
  })
);

export const aiConsultationSessionsRelations = relations(
  aiConsultationSessions,
  ({ one }) => ({
    practice: one(practices, {
      fields: [aiConsultationSessions.practiceId],
      references: [practices.id],
    }),
    patient: one(patients, {
      fields: [aiConsultationSessions.patientId],
      references: [patients.id],
    }),
    user: one(users, {
      fields: [aiConsultationSessions.userId],
      references: [users.id],
    }),
  })
);
