import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { users } from "./users";

// ---------------------------------------------------------------------------
// Canvas Documents — rich HTML/Markdown strategic docs and SOPs
// ---------------------------------------------------------------------------
export const canvasDocuments = pgTable(
  "canvas_documents",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 512 }).notNull(),
    // docType: STRATEGY | SOP | MANUAL | HR | CLIENT_HANDOUT | PERSONA
    docType: varchar("doc_type", { length: 64 }).notNull(),
    // content: Full HTML string (supports <h1>, <table>, <ul class="task-list">, <pre class="mermaid">)
    content: text("content").notNull().default(""),
    // status: draft | published | archived
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    // Tags for filtering: ["Fear-Free", "RAG", "Marketing"]
    tags: jsonb("tags").default([]),
    // Is this document used as RAG context for the AI?
    isRagSource: jsonb("is_rag_source").default(false),
  },
  (table) => ({
    practiceIdx: index("canvas_documents_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    typeIdx: index("canvas_documents_type_idx").on(
      table.practiceId,
      table.docType,
      table.deletedAt
    ),
    statusIdx: index("canvas_documents_status_idx").on(
      table.practiceId,
      table.status,
      table.deletedAt
    ),
  })
);

// ---------------------------------------------------------------------------
// Canvas Templates — global document starters (not practice-specific)
// ---------------------------------------------------------------------------
export const canvasTemplates = pgTable(
  "canvas_templates",
  {
    ...baseColumns(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    docType: varchar("doc_type", { length: 64 }).notNull(),
    // category: SOP | Strategy | HR | Client_Handout
    category: varchar("category", { length: 64 }).notNull(),
    // contentSkeleton: Template HTML with {{placeholders}}
    contentSkeleton: text("content_skeleton").notNull().default(""),
  },
  (table) => ({
    categoryIdx: index("canvas_templates_category_idx").on(table.category),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const canvasDocumentsRelations = relations(
  canvasDocuments,
  ({ one }) => ({
    practice: one(practices, {
      fields: [canvasDocuments.practiceId],
      references: [practices.id],
    }),
    author: one(users, {
      fields: [canvasDocuments.authorId],
      references: [users.id],
    }),
  })
);
