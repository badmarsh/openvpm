import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { users } from "./users";

// ---------------------------------------------------------------------------
// Marketing Templates — reusable post skeletons for the AI Generation Wizard
// ---------------------------------------------------------------------------
export const marketingTemplates = pgTable(
  "marketing_templates",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    // Platforms: IG | FB | GBP | TikTok | Reels
    platforms: jsonb("platforms").default([]).notNull(),
    // Aspect ratios: 1:1 | 4:5 | 16:9 | 9:16
    aspectRatios: jsonb("aspect_ratios").default([]).notNull(),
    mediaType: varchar("media_type", { length: 32 }).notNull().default("image"),
    promptSkeleton: text("prompt_skeleton").notNull(),
    exampleCaption: text("example_caption"),
    requiresConsent: jsonb("requires_consent").default(false),
    isGlobal: jsonb("is_global").default(false), // true = available to all practices
  },
  (table) => ({
    practiceIdx: index("marketing_templates_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    categoryIdx: index("marketing_templates_category_idx").on(
      table.category,
      table.practiceId
    ),
  })
);

// ---------------------------------------------------------------------------
// Marketing Posts — individual scheduled/published social posts
// ---------------------------------------------------------------------------
export const marketingPosts = pgTable(
  "marketing_posts",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    templateId: uuid("template_id").references(() => marketingTemplates.id),
    // status: draft | in_review | approved | scheduled | published | archived
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    // variants: Record<Platform, PostVariant> — full JSON blob
    variants: jsonb("variants").default({}).notNull(),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    // Approval workflow
    reviewNotes: jsonb("review_notes").default([]),
    history: jsonb("history").default([]),
    // Extra metadata
    topicInputs: jsonb("topic_inputs").default({}),
    overlayText: varchar("overlay_text", { length: 512 }),
    hasConsent: jsonb("has_consent").default(false),
    hasWatermark: jsonb("has_watermark").default(true),
  },
  (table) => ({
    practiceIdx: index("marketing_posts_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    statusIdx: index("marketing_posts_status_idx").on(
      table.practiceId,
      table.status,
      table.deletedAt
    ),
    scheduledIdx: index("marketing_posts_scheduled_idx").on(
      table.practiceId,
      table.scheduledDate,
      table.deletedAt
    ),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const marketingTemplatesRelations = relations(
  marketingTemplates,
  ({ one, many }) => ({
    practice: one(practices, {
      fields: [marketingTemplates.practiceId],
      references: [practices.id],
    }),
    posts: many(marketingPosts),
  })
);

export const marketingPostsRelations = relations(
  marketingPosts,
  ({ one }) => ({
    practice: one(practices, {
      fields: [marketingPosts.practiceId],
      references: [practices.id],
    }),
    author: one(users, {
      fields: [marketingPosts.authorId],
      references: [users.id],
    }),
    template: one(marketingTemplates, {
      fields: [marketingPosts.templateId],
      references: [marketingTemplates.id],
    }),
  })
);
