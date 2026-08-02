import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const aiModels = pgTable("ai_models", {
  id: text("id").primaryKey(), // using text because ai-vet had hardcoded string IDs like '1', '2'
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  type: text("type").notNull(), // 'llm' | 'vision' | 'speech' | 'multimodal'
  status: text("status").default("inactive").notNull(), // 'active' | 'inactive' | 'testing'
  apiKey: text("api_key").notNull(),
  endpoint: text("endpoint").notNull(),
  model: text("model").notNull(),
  maxTokens: integer("max_tokens").default(4000).notNull(),
  temperature: real("temperature").default(0.3).notNull(),
  accuracy: real("accuracy").default(90).notNull(),
  speed: real("speed").default(80).notNull(),
  cost: real("cost").default(0.03).notNull(),
  features: jsonb("features").default([]).notNull(), // string[]
  lastTest: timestamp("last_test", { mode: "string" }).defaultNow().notNull(),
  testResults: jsonb("test_results").default({ accuracy: 90, responseTime: 2.0, reliability: 90 }).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiModelSchema = createInsertSchema(aiModels);
export const selectAiModelSchema = createSelectSchema(aiModels);

export type AiModel = InferSelectModel<typeof aiModels>;
export type NewAiModel = InferInsertModel<typeof aiModels>;
