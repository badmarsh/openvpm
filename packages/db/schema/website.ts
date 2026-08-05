import {
  pgTable, uuid, varchar, text, jsonb, boolean,
  integer, timestamp, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { users } from "./users";
import { communications } from "./communications";

// ---------------------------------------------------------------------------
// Websites — one active website per practice (singleton config)
// ---------------------------------------------------------------------------
export const websites = pgTable(
  "websites",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    // status: draft | published | unpublished
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    // Template identifier (maps to one of the 5 v0 templates)
    templateId: varchar("template_id", { length: 64 }).notNull().default("clean-modern"),
    // Global site settings (JSONB — custom domain, favicon, social links,
    // analytics ID, Google Site Verification, etc.)
    settings: jsonb("settings").default({}).notNull(),
    // SEO metadata
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    ogImage: varchar("og_image", { length: 512 }),
    // Publishing metadata
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: uuid("published_by").references(() => users.id),
    // Locale for seeded content — "sk" | "en" | "hu" (HU supported in templates)
    locale: varchar("locale", { length: 10 }).notNull().default("sk"),
  },
  (table) => ({
    practiceIdx: index("websites_practice_idx").on(
      table.practiceId, table.deletedAt
    ),
    slugUq: uniqueIndex("websites_slug_uq").on(table.slug, table.deletedAt),
    statusIdx: index("websites_status_idx").on(
      table.practiceId, table.status, table.deletedAt
    ),
  })
);

// ---------------------------------------------------------------------------
// Website Pages — individual pages within a website
// ---------------------------------------------------------------------------
export const websitePages = pgTable(
  "website_pages",
  {
    ...baseColumns(),
    websiteId: uuid("website_id")
      .notNull()
      .references(() => websites.id),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    // Page type: home | about | services | contact | blog | custom
    pageType: varchar("page_type", { length: 32 }).notNull().default("custom"),
    // Display order
    sortOrder: integer("sort_order").notNull().default(0),
    // Per-page SEO overrides
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    ogImage: varchar("og_image", { length: 512 }),
    // Whether this page is shown in navigation
    showInNav: boolean("show_in_nav").notNull().default(true),
    // Whether this page is the homepage
    isHome: boolean("is_home").notNull().default(false),
  },
  (table) => ({
    websiteIdx: index("website_pages_website_idx").on(
      table.websiteId, table.deletedAt
    ),
    slugIdx: uniqueIndex("website_pages_slug_idx").on(
      table.websiteId, table.slug, table.deletedAt
    ),
    sortIdx: index("website_pages_sort_idx").on(
      table.websiteId, table.sortOrder
    ),
  })
);

// ---------------------------------------------------------------------------
// Website Blocks — block-based content within pages
// ---------------------------------------------------------------------------
export const websiteBlocks = pgTable(
  "website_blocks",
  {
    ...baseColumns(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => websitePages.id),
    // Block type: hero | services | testimonials | cta | contact_form |
    //   about | gallery | team | pricing | map | faq | blog_feed |
    //   opening_hours | custom_html
    blockType: varchar("block_type", { length: 64 }).notNull(),
    // Display order within the page
    sortOrder: integer("sort_order").notNull().default(0),
    // Block content (JSONB — structure depends on blockType)
    content: jsonb("content").default({}).notNull(),
    // Block-level settings (visibility, animation, background, padding)
    settings: jsonb("settings").default({}).notNull(),
    // Whether the block is visible
    isVisible: boolean("is_visible").notNull().default(true),
  },
  (table) => ({
    pageIdx: index("website_blocks_page_idx").on(
      table.pageId, table.deletedAt
    ),
    sortIdx: index("website_blocks_sort_idx").on(
      table.pageId, table.sortOrder
    ),
  })
);

// ---------------------------------------------------------------------------
// Website Submissions — contact form submissions from the public site
// ---------------------------------------------------------------------------
export const websiteSubmissions = pgTable(
  "website_submissions",
  {
    ...baseColumns(),
    websiteId: uuid("website_id")
      .notNull()
      .references(() => websites.id),
    // submission type: contact | booking_inquiry | newsletter
    submissionType: varchar("submission_type", { length: 32 }).notNull().default("contact"),
    // Form data (JSONB — name, email, phone, message, etc.)
    formData: jsonb("form_data").default({}).notNull(),
    // IP address for spam protection
    ipAddress: varchar("ip_address", { length: 45 }),
    // Read status
    isRead: boolean("is_read").notNull().default(false),
    // Linked communication record (if created)
    communicationId: uuid("communication_id").references(() => communications.id),
  },
  (table) => ({
    websiteIdx: index("website_submissions_website_idx").on(
      table.websiteId, table.deletedAt
    ),
    readIdx: index("website_submissions_read_idx").on(
      table.websiteId, table.isRead
    ),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const websitesRelations = relations(websites, ({ one, many }) => ({
  practice: one(practices, {
    fields: [websites.practiceId],
    references: [practices.id],
  }),
  publisher: one(users, {
    fields: [websites.publishedBy],
    references: [users.id],
  }),
  pages: many(websitePages),
  submissions: many(websiteSubmissions),
}));

export const websitePagesRelations = relations(websitePages, ({ one, many }) => ({
  website: one(websites, {
    fields: [websitePages.websiteId],
    references: [websites.id],
  }),
  blocks: many(websiteBlocks),
}));

export const websiteBlocksRelations = relations(websiteBlocks, ({ one }) => ({
  page: one(websitePages, {
    fields: [websiteBlocks.pageId],
    references: [websitePages.id],
  }),
}));

export const websiteSubmissionsRelations = relations(websiteSubmissions, ({ one }) => ({
  website: one(websites, {
    fields: [websiteSubmissions.websiteId],
    references: [websites.id],
  }),
  communication: one(communications, {
    fields: [websiteSubmissions.communicationId],
    references: [communications.id],
  }),
}));