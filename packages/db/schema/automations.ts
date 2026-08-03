import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { users } from "./users";

// ---------------------------------------------------------------------------
// CRM Automations — trigger-based communication rules (reminders, reviews, etc.)
// ---------------------------------------------------------------------------
export const crmAutomations = pgTable(
  "crm_automations",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    name: varchar("name", { length: 255 }).notNull(),
    // triggerType: APPOINTMENT_DISCHARGE | ANNUAL_REMINDER | BIRTHDAY | WELLNESS_DUE | REVIEW_REQUEST
    triggerType: varchar("trigger_type", { length: 64 }).notNull(),
    // JSON conditions: { delayDays?: number, patientSpecies?: string, languageFilter?: "SK" | "HU" }
    conditions: jsonb("conditions").default({}).notNull(),
    // actionType: sms | email | webhook
    actionType: varchar("action_type", { length: 32 }).notNull(),
    // Payload: { templatePrompt?: string, webhookUrl?: string, channel?: string }
    actionPayload: jsonb("action_payload").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    // Optional: link to n8n workflow or external automation ID
    externalWorkflowId: varchar("external_workflow_id", { length: 255 }),
  },
  (table) => ({
    practiceIdx: index("crm_automations_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    activeIdx: index("crm_automations_active_idx").on(
      table.practiceId,
      table.isActive,
      table.deletedAt
    ),
  })
);

// ---------------------------------------------------------------------------
// CRM Automation Logs — record of every fired automation
// ---------------------------------------------------------------------------
export const crmAutomationLogs = pgTable(
  "crm_automation_logs",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    automationId: uuid("automation_id")
      .notNull()
      .references(() => crmAutomations.id),
    // clientId from the clients table (foreign key defined loosely to avoid circular schema deps)
    clientId: uuid("client_id").notNull(),
    // status: sent | failed | pending
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    channel: varchar("channel", { length: 32 }).notNull(),
    messageContent: text("message_content"),
    errorMessage: text("error_message"),
    firedAt: timestamp("fired_at", { withTimezone: true }),
  },
  (table) => ({
    practiceIdx: index("crm_automation_logs_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    automationIdx: index("crm_automation_logs_automation_idx").on(
      table.automationId,
      table.status
    ),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const crmAutomationsRelations = relations(
  crmAutomations,
  ({ one, many }) => ({
    practice: one(practices, {
      fields: [crmAutomations.practiceId],
      references: [practices.id],
    }),
    logs: many(crmAutomationLogs),
  })
);

export const crmAutomationLogsRelations = relations(
  crmAutomationLogs,
  ({ one }) => ({
    automation: one(crmAutomations, {
      fields: [crmAutomationLogs.automationId],
      references: [crmAutomations.id],
    }),
  })
);
