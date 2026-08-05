# OpenVPM — Website Builder Module Megaprompt (v1)

**Audience:** engineer/agent implementing this (human, Claude Code, Cursor,
future chat session with repo access).

**Status:** Phase 0 pre-flight verification is **COMPLETE**. All facts below
are confirmed directly against the repo (Desktop Commander audit,
2026-08-05) — not assumptions. Start execution at Phase 1.

**Relationship to other megaprompts:**
- `INTEGRATION_MEGAPROMPT.md` (v2) — the Social Studio → OpenVPM migration
  (Phases 0–5). This website module builds on top of that infrastructure
  (getLocaleData(), i18n conventions, design system patterns).
- `INTEGRATION_MEGAPROMPT_V3.md` — Phase 3.5/4/5 completion status. The
  website module must respect all operating rules established there.
- `ANALYSIS-8.0-FINAL.md` — the operational strategic plan for the
  veterinary clinic. The website is **Gate 1 of Month 1** ("GBP & Web
  Ready?") and must deliver a conversion-oriented site with a "Rezervovať
  termín" (Book an Appointment) CTA, bilingual SK/HU support, and local
  SEO optimization.

**Companion file:** `WEBSITE_V0_TEMPLATES.md` — 5 professional veterinary
clinic template prompts for v0.dev generation.

---

## 0. Operating rules (carry forward from v2 — repeated so this stands alone)

1. **Surgical edits only.** Use targeted diffs (`str_replace` / equivalent).
   Never regenerate a whole file for a few-line change.
2. **Backend business logic, RLS, RBAC, and rate limiting stay frozen**
   except the new `website.ts` router described in Phase 2. Anything else
   that looks like it needs to change: stop and flag it, don't just do it.
3. **No `any`, no `@ts-ignore`, no `// TODO`.** If something is incomplete,
   it is not done.
4. **One git commit per phase**, on branch `feature/website-builder`.
   Commit message = phase name + one-line summary. Do not squash across
   phases.
5. **Every phase ends with a verification step.** Do not start the next
   phase until the current one's verification passes.
6. **Report back after each phase:** files touched, line counts before/after,
   and actual terminal output — not a summary of it.
7. **OPEN DECISIONs below block specific steps.** Do not resolve them
   unilaterally — stop and ask the requester.

---

## 1. Repo map — confirmed facts (2026-08-05, via Desktop Commander)

### 1.1 Stack

| Layer | Technology | Confirmed |
|---|---|---|
| Monorepo | pnpm 9.15 + turbo | `package.json` `packageManager` field |
| Web app | Next.js (App Router, `apps/web`) | `apps/web/next.config.js`, `next-env.d.ts` |
| API | tRPC (procedures + routers) | `apps/web/server/trpc.ts` exports `protectedProcedure`, `requireRole`, `publicProcedure` |
| Database | Postgres + Drizzle ORM | `packages/db/schema/`, `packages/db/drizzle.config.ts` |
| Schema convention | `baseColumns()` from `./common` (id, createdAt, updatedAt, deletedAt) + `tenantColumns()` | `packages/db/schema/common.ts` |
| i18n | next-intl, flat dotted keys, no namespace argument, `useTranslations()` | `apps/web/app/(dashboard)/marketing/page.tsx` (golden reference) |
| i18n messages | `apps/web/messages/{en,sk}.json`, camelCase for new keys | confirmed by v2 §0.2 |
| UI primitives | `apps/web/components/ui/` — badge, button, card, checkbox, form-field, input, popover, progress, tabs, tooltip | confirmed inventory, **no `dialog.tsx` exists** |
| Loading states | `<TableSkeleton rows cols />` from `@/components/common/loading` | confirmed real |
| Empty states | `<EmptyState icon title description action />` from `@/components/common/empty-state` | confirmed real |
| Toasts | `sonner` via `toast()` | confirmed across 17+ dashboard pages |
| Icons | `lucide-react` | confirmed on marketing, documents, sidebar |
| Auth | NextAuth (session-based), roles: admin, veterinarian, technician, front_desk, viewer | `apps/web/server/trpc.ts` |
| Practice context | `ctx.practiceId`, `ctx.user.id` available on `protectedProcedure` | confirmed |
| Public routing | Middleware `PUBLIC_PATH_PREFIXES` — `/portal`, `/capture`, `/legal`, `/sign`, etc. | `apps/web/middleware.ts` |
| Seed data pattern | `packages/db/data/{sk}/index.ts` + `getLocaleData(locale)` | `packages/db/data/index.ts` |
| Email | `packages/email` — templates + render | confirmed directory structure |

### 1.2 Existing modules the Website Builder must integrate with

| Module | Integration point | How |
|---|---|---|
| **Marketing** (`marketingRouter`) | Published posts → website blog/news section | Query `marketingPosts` where `status = "published"`, ordered by `scheduledDate` desc |
| **Scheduling / Portal** (`portalRouter`) | "Book an Appointment" CTA → existing public booking flow | `portalRouter.requestAppointment` + `portalRouter.availableSlots` (already public procedures) |
| **Practice data** (`practices` table) | Clinic name, address, phone, email, logo, website URL, opening hours | Read from `practices` + `practice.settings` JSONB |
| **Inbox / Communications** (`communicationsRouter`) | Contact form submissions → inbox messages | New mutation: insert into existing communications table with `source = "website"` |
| **Reviews** (`marketing/planner` — reviews sub-page) | Google review link/widget on site | Read `practice.settings.googleReviewUrl` |
| **Branding** (`settingsRouter.getBranding`) | Logo, name, colors for the public site | Existing `settings.getBranding` query |
| **Automations** (`automationsRouter`) | Auto-reply on contact form submission | New trigger type `"website_form_submission"` in automations |
| **Wellness** (`wellness` table) | Wellness plans pricing/CTA on services page | Query published wellness plans |

### 1.3 Confirmed constraints

- **`packages/db/data/en/` directory does NOT exist yet** — only `sk/` is
  present. `getLocaleData()` currently ignores the locale parameter and
  returns only Slovak data. **This website module must add the `en/` data
  directory and fix `getLocaleData()` to actually switch on locale.**
  (This is pre-existing Phase 2 incomplete work from the Social Studio
  migration — flag to requester as a dependency.)
- **No `dialog.tsx`** exists in `components/ui/` — confirmed again.
  The website editor needs a dialog for block editing, page settings, and
  template selection. This is OPEN DECISION #1.
- **Public route prefix** for the website: recommend `/site/[slug]`
  (clearer than `/w/`, avoids clash with `/sign`). Must be added to
  `PUBLIC_PATH_PREFIXES` in `middleware.ts`.
- **Scheduling portal already has public booking procedures** — the "Book
  an Appointment" CTA can link directly to the existing portal booking
  flow via a token URL, or embed a booking widget component.
- **Onboarding wizard** (`journey-overlay.tsx`) has 7 steps ending with
  "allSet". Website setup could be offered as a post-onboarding CTA on
  the dashboard (similar to activation checklist items), or added as an
  optional 8th step. OPEN DECISION #2.
- **29 route loading skeletons** were recently added — the new
  `app/(dashboard)/website/loading.tsx` and `app/site/[slug]/loading.tsx`
  must follow the same pattern.

### 1.4 Module scope — what this IS and IS NOT

**This module IS:**
- A click-and-build website builder inside the OpenVPM dashboard
- Block-based page editor (drag-and-drop sections)
- Template selection (5 veterinary-specific templates)
- Public-facing website rendering (SSR, SEO-optimized)
- Contact form → inbox integration
- Bilingual SK/HU content
- Local SEO (schema.org, sitemap, Open Graph, meta tags)

**This module IS NOT:**
- A general-purpose CMS (no arbitrary content types)
- An e-commerce platform (no shopping cart)
- A blog platform (blog posts come from the Marketing module)
- A standalone site hosting service (lives within OpenVPM's domain)
- A replacement for Medplum (client portal stays separate)

---

## Phase 0 — Pre-flight verification: COMPLETE

### 0.1 Practice data available for the website — ANSWERED
- `practices` table: `name`, `address`, `phone`, `email`, `website`,
  `logoUrl`, `settings` (JSONB — extensible for opening hours, social
  links, Google review URL, etc.)
- `locations` table: multi-location support (name, address, phone,
  isPrimary)
- **No `openingHours` column exists** — must be stored in
  `practices.settings` JSONB or as a new table. OPEN DECISION #3.

### 0.2 Public rendering pattern — ANSWERED
- Existing public pages: `/portal/[token]`, `/capture/[token]`,
  `/legal/{terms,privacy}`, `/sign`
- Token-based (portal/capture) vs. slug-based (legal)
- **Decision: website uses slug-based routing** — each practice gets a
  unique slug (e.g., `/site/sykora-rs`), stored in the `websites` table.
  The slug is the public identifier, not the practice ID (security +
  SEO-friendly URLs).

### 0.3 Sidebar navigation pattern — ANSWERED
- `navSections` array in `components/layout/sidebar.tsx`
- Each item: `{ href, key, icon, roles, badge?, exact? }`
- **New item to add to `sectionMarketing`:**
  ```ts
  { href: "/website", key: "nav.website", icon: Globe, roles: ["admin", "veterinarian", "front_desk"] }
  ```
- Icon: `Globe` from `lucide-react`
- Roles: admin, veterinarian, front_desk (same as Marketing)

### 0.4 i18n current state for new namespace — ANSWERED
- `website` namespace does **not** exist yet in either `en.json` or
  `sk.json` — confirmed by full read. No clobber risk.
- Pattern: `useTranslations()` with no namespace argument, full dotted
  keys at every call site.
- New keys use **camelCase** (confirmed convention for newer pages).

### 0.5 Database seeding architecture — ANSWERED (with caveat)
- Seed data pattern: `packages/db/data/{locale}/index.ts`
- `getLocaleData(locale)` helper in `packages/db/data/index.ts`
- **Caveat (flagged in §1.3):** `en/` directory does not exist yet.
  This module must create it as a dependency of Phase 2.

**Phase 0 exit criteria:** all five answered above. Three OPEN DECISIONs
to resolve before the relevant step:
1. How to handle modal/dialog UI for the editor (blocks Phase 4).
2. Where website setup belongs in the onboarding wizard (blocks Phase 7).
3. How to store opening hours — JSONB settings vs. new table (blocks
   Phase 1).

---

## Phase 1 — Database schema & migration

### 1.1 Create `packages/db/schema/website.ts`

```ts
import {
  pgTable, uuid, varchar, text, jsonb, boolean,
  integer, timestamp, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { users } from "./users";

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
    //   about | gallery | team | pricing | map | faq | blog_feed | custom_html
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
    communicationId: uuid("communication_id"),
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
}));
```

### 1.2 Register the new schema

- [ ] Add `export * from "./website"` to `packages/db/schema/index.ts`
- [ ] Run `pnpm --filter @openpims/db db:generate` to create the migration
- [ ] Run `pnpm --filter @openpims/db db:push` to apply (dev only)
- [ ] Verify tables exist via `pnpm --filter @openpims/db db:studio`

### 1.3 ~~OPEN DECISION #3~~ RESOLVED — Opening hours storage

**Decision: Option A — JSONB in `practices.settings`.** Both this megaprompt
and the companion template ZIP (`INTEGRATION.md`) agree on this approach.
No further discussion needed — implement Option A directly.

- Store as `practices.settings.openingHours` with shape compatible with
  `HoursRow[]` from `lib/templates/metadata.ts`:
  ```ts
  // Human-readable format used by templates
  type HoursRow = {
    day: { sk: string; en: string; hu: string };
    time: string;     // e.g. "8:00 – 18:00" or "Zatvorené"
    isEmergency?: boolean;
  };
  ```
- The `opening_hours` block's `source: "practice_settings"` reads this
  field at render time (no separate block content needed).

**Phase 1 verification:**
```
pnpm --filter @openpims/db db:generate
pnpm --filter @openpims/db db:push
pnpm --filter @openpims/db db:studio  # visually confirm new tables
pnpm -w type-check
```
Report: migration diff, table names confirmed, type-check output.

---

## Phase 2 — tRPC router & seed data

### 2.1 Create `apps/web/server/routers/website.ts`

Following the exact pattern of `marketing.ts` (confirmed structure):

```ts
import { z } from "zod";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, publicProcedure, requireRole } from "../trpc";
import {
  websites, websitePages, websiteBlocks, websiteSubmissions,
  practices, communications,
} from "@openpims/db";
import { getLocaleData } from "@openpims/db/data";
import { rateLimit } from "@/lib/rate-limit";

export const websiteRouter = createRouter({
  // -------------------------------------------------------------------------
  // Website CRUD (protected, admin/veterinarian only)
  // -------------------------------------------------------------------------

  /** Get the active website for this practice (or null if none) */
  getSite: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.websites.findFirst({
      where: and(
        eq(websites.practiceId, ctx.practiceId),
        isNull(websites.deletedAt)
      ),
      with: {
        pages: {
          where: isNull(websitePages.deletedAt),
          orderBy: [asc(websitePages.sortOrder)],
          with: {
            blocks: {
              where: isNull(websiteBlocks.deletedAt),
              orderBy: [asc(websiteBlocks.sortOrder)],
            },
          },
        },
      },
    });
  }),

  /** Create a new website for this practice */
  createSite: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      slug: z.string().min(3).max(128).regex(/^[a-z0-9-]+$/),
      title: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      templateId: z.string().max(64).default("clean-modern"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.query.websites.findFirst({
        where: and(eq(websites.slug, input.slug), isNull(websites.deletedAt)),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Slug already taken" });
      }
      const [site] = await ctx.db.insert(websites).values({
        practiceId: ctx.practiceId,
        ...input,
        locale: practice?.country === "HU" ? "hu" : practice?.country === "SK" ? "sk" : "en",
      }).returning();
      return site;
    }),

  /** Update website settings */
  updateSite: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().max(1000).optional(),
      settings: z.record(z.any()).optional(),
      seoTitle: z.string().max(255).optional(),
      seoDescription: z.string().max(500).optional(),
      ogImage: z.string().max(512).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.db.update(websites)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(websites.id, id), eq(websites.practiceId, ctx.practiceId)));
      return { updated: true };
    }),

  /** Publish the website */
  publishSite: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(websites)
        .set({
          status: "published",
          publishedAt: new Date(),
          publishedBy: ctx.user.id,
          updatedAt: new Date(),
        })
        .where(and(
          eq(websites.id, input.id),
          eq(websites.practiceId, ctx.practiceId)
        ));
      return { published: true };
    }),

  /** Unpublish the website */
  unpublishSite: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(websites)
        .set({ status: "unpublished", updatedAt: new Date() })
        .where(and(
          eq(websites.id, input.id),
          eq(websites.practiceId, ctx.practiceId)
        ));
      return { unpublished: true };
    }),

  // -------------------------------------------------------------------------
  // Page management
  // -------------------------------------------------------------------------

  createPage: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      websiteId: z.string().uuid(),
      title: z.string().min(1).max(255),
      slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
      pageType: z.enum(["home", "about", "services", "contact", "blog", "custom"]).default("custom"),
      sortOrder: z.number().default(0),
      showInNav: z.boolean().default(true),
      isHome: z.boolean().default(false),
    }))
    .mutation(/* ... insert into websitePages, validate website belongs to practice ... */),

  updatePage: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/).optional(),
      pageType: z.enum(["home", "about", "services", "contact", "blog", "custom"]).optional(),
      sortOrder: z.number().optional(),
      seoTitle: z.string().max(255).optional(),
      seoDescription: z.string().max(500).optional(),
      showInNav: z.boolean().optional(),
      isHome: z.boolean().optional(),
    }))
    .mutation(/* ... update websitePages ... */),

  deletePage: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(/* ... soft delete (set deletedAt) ... */),

  reorderPages: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      pageOrders: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(/* ... batch update sortOrder in a transaction ... */),

  // -------------------------------------------------------------------------
  // Block management
  // -------------------------------------------------------------------------

  addBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      pageId: z.string().uuid(),
      blockType: z.enum([
        "hero", "services", "testimonials", "cta", "contact_form",
        "about", "gallery", "team", "pricing", "map", "faq",
        "blog_feed", "opening_hours", "custom_html"
      ]),
      content: z.record(z.any()).default({}),
      settings: z.record(z.any()).default({}),
      sortOrder: z.number().default(0),
    }))
    .mutation(/* ... insert into websiteBlocks ... */),

  updateBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      id: z.string().uuid(),
      content: z.record(z.any()).optional(),
      settings: z.record(z.any()).optional(),
      sortOrder: z.number().optional(),
      isVisible: z.boolean().optional(),
    }))
    .mutation(/* ... update websiteBlocks ... */),

  removeBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(/* ... soft delete ... */),

  reorderBlocks: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      blockOrders: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(/* ... batch update sortOrder in a transaction ... */),

  // -------------------------------------------------------------------------
  // Submissions (protected read, public write)
  // -------------------------------------------------------------------------

  /** List submissions for this practice's website */
  getSubmissions: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(200).default(50),
      offset: z.number().default(0),
      isRead: z.boolean().optional(),
    }).optional())
    .query(/* ... query websiteSubmissions with practice scoping ... */),

  /** Mark submission as read */
  markSubmissionRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(/* ... set isRead = true ... */),

  // -------------------------------------------------------------------------
  // PUBLIC endpoints (no auth required)
  // -------------------------------------------------------------------------

  /** Get published website data by slug (for public rendering) */
  getPublicSite: publicProcedure
    .input(z.object({ slug: z.string().min(3).max(128) }))
    .query(async ({ ctx, input }) => {
      const site = await ctx.db.query.websites.findFirst({
        where: and(
          eq(websites.slug, input.slug),
          eq(websites.status, "published"),
          isNull(websites.deletedAt)
        ),
        with: {
          // SECURITY: select only public-safe columns — never expose staff email or internal settings
          practice: {
            columns: {
              name: true,
              phone: true,
              address: true,
              logoUrl: true,
            },
          },
          pages: {
            where: isNull(websitePages.deletedAt),
            orderBy: [asc(websitePages.sortOrder)],
            with: {
              blocks: {
                where: and(
                  isNull(websiteBlocks.deletedAt),
                  eq(websiteBlocks.isVisible, true)
                ),
                orderBy: [asc(websiteBlocks.sortOrder)],
              },
            },
          },
        },
      });
      if (!site) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
      }
      return site;
    }),

  /** Submit a contact form (public, rate-limited) */
  submitContactForm: publicProcedure
    .input(z.object({
      websiteSlug: z.string().min(3).max(128),
      name: z.string().min(1).max(255),
      email: z.string().email().max(255),
      phone: z.string().max(32).optional(),
      message: z.string().min(1).max(5000),
      pageSlug: z.string().max(128).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limit: 5 submissions per IP per hour
      // Resolve website from slug
      // Insert into websiteSubmissions
      // Optionally create a communication record (inbox)
      // Return success
    }),

  /** Get published blog posts for a practice (reads from marketingPosts) */
  getPublicPosts: publicProcedure
    .input(z.object({
      websiteSlug: z.string().min(3).max(128),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().default(0),
    }))
    .query(/* ... query marketingPosts where status="published", join via practice ... */),

  // -------------------------------------------------------------------------
  // Seed default website from template
  // -------------------------------------------------------------------------

  /** Seed a default website from a template (idempotent, locale-aware) */
  seedDefaultWebsite: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      templateId: z.string().max(64).default("clean-modern"),
      slug: z.string().min(3).max(128).regex(/^[a-z0-9-]+$/),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.websites.findFirst({
        where: and(
          eq(websites.practiceId, ctx.practiceId),
          isNull(websites.deletedAt)
        ),
      });
      if (existing) return { seeded: false, message: "Website already exists" };

      const [practice] = await ctx.db
        .select({ country: practices.country })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);
      const locale: "sk" | "en" | "hu" = practice?.country === "HU" ? "hu" : practice?.country === "SK" ? "sk" : "en";
      const { websiteTemplatesData } = getLocaleData(locale);

      const template = websiteTemplatesData?.[input.templateId];
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Create website + pages + blocks in a transaction
      // ... (see Phase 2.3 for full implementation)

      return { seeded: true };
    }),
});
```

### 2.2 Add `en/` data directory and fix `getLocaleData()`

**This is a dependency on the Social Studio migration Phase 2 incomplete work.**

- [ ] Create `packages/db/data/en/index.ts` with English translations
  of all seed data (marketingTemplatesData, crmAutomationsData,
  canvasMasterDocumentsData).
- [ ] Create `packages/db/data/en/website-templates.ts` with English
  website template data.
- [ ] Create `packages/db/data/sk/website-templates.ts` with Slovak
  website template data.
- [ ] Fix `packages/db/data/index.ts`:
  ```ts
  import * as sk from "./sk/index";
  import * as en from "./en/index";

  export type Locale = "sk" | "en" | "hu";

  export function getLocaleData(locale: Locale = "sk") {
    if (locale === "sk") return sk;
    if (locale === "hu") return hu; // future: import * as hu from "./hu/index"
    return en;
  }
  ```

### 2.3 Register the router in `_app.ts`

```ts
import { websiteRouter } from "./website";

// In the appRouter:
website: websiteRouter,
```

### 2.4 Website template seed data structure

Each template defines a complete website structure:

```ts
// packages/db/data/sk/website-templates.ts
export const websiteTemplatesData = {
  "clean-modern": {
    title: "Moderná veterinárna klinika",
    description: "Čistý, profesionálny dizajn pre modernú kliniku",
    pages: [
      {
        title: "Domov",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Starostlivosť, ktorej môžete dôverovať",
              subheading: "Profesionálna veterinárna starostlivosť s láskavým prístupom",
              ctaText: "Rezervovať termín",
              ctaLink: "/portal/booking",
              backgroundImage: null,
            },
          },
          {
            blockType: "services",
            sortOrder: 1,
            content: {
              heading: "Naše služby",
              services: [
                { icon: "stethoscope", title: "Preventívna starostlivosť", description: "..." },
                { icon: "heart-pulse", title: "Chirurgia", description: "..." },
                { icon: "pill", title: "Farmácia", description: "..." },
                { icon: "microscope", title: "Diagnostika", description: "..." },
              ],
            },
          },
          // ... more blocks
        ],
      },
      // ... more pages (about, services, contact)
    ],
  },
  // ... 4 more templates
};
```

**Phase 2 verification:**
```
pnpm -w type-check
pnpm --filter @openpims/web test  # new website-router tests
```
Report: router file stats, seed data files, type-check output.

---

## Phase 3 — Full i18n extraction

### 3.1 Add `website` namespace to both `en.json` and `sk.json`

- [ ] Namespace: `"website"` (top-level, consistent with `marketing`,
  `automations`, `canvas`).
- [ ] All keys use **camelCase** (confirmed convention for newer pages).
- [ ] Sub-namespaces per concern: `website.editor`, `website.blocks`,
  `website.templates`, `website.settings`, `website.public`.

### 3.2 Key structure (Slovak → English examples)

```json
{
  "nav": {
    "website": "Webstránka / Website"
  },
  "website": {
    "title": "Webstránka / Website",
    "subtitle": "Vytvorte a spravujte webstránku vašej kliniky / Build and manage your clinic's website",
    "status": {
      "draft": "Koncept / Draft",
      "published": "Publikované / Published",
      "unpublished": "Nepublikované / Unpublished"
    },
    "editor": {
      "addBlock": "Pridať blok / Add block",
      "saveChanges": "Uložiť zmeny / Save changes",
      "preview": "Náhľad / Preview",
      "publish": "Publikovať / Publish",
      "unpublish": "Zrušiť publikovanie / Unpublish",
      "template": "Šablóna / Template",
      "pages": "Stránky / Pages",
      "settings": "Nastavenia / Settings",
      "dragToReorder": "Potiahnutím zmeníte poradie / Drag to reorder"
    },
    "blocks": {
      "hero": "Hlavný banner / Hero Banner",
      "services": "Služby / Services",
      "testimonials": "Recenzie / Testimonials",
      "cta": "Výzva k akcii / Call to Action",
      "contactForm": "Kontaktný formulár / Contact Form",
      "about": "O nás / About Us",
      "gallery": "Galéria / Gallery",
      "team": "Tím / Team",
      "pricing": "Cenník / Pricing",
      "map": "Mapa / Map",
      "faq": "Časté otázky / FAQ",
      "blogFeed": "Blog / Blog Feed",
      "openingHours": "Ordinačné hodiny / Opening Hours",
      "customHtml": "Vlastný HTML / Custom HTML"
    },
    "templates": {
      "cleanModern": "Čistý a moderný / Clean & Modern",
      "warmTrusting": "Teplý a dôveryhodný / Warm & Trusting",
      "clinicalProfessional": "Klinický a profesionálny / Clinical & Professional",
      "playfulFriendly": "Hravý a priateľský / Playful & Friendly",
      "emergencyFocus": "Pohotovostný / Emergency Focus"
    },
    "public": {
      "bookAppointment": "Rezervovať termín / Book an Appointment",
      "contactUs": "Kontaktujte nás / Contact Us",
      "ourServices": "Naše služby / Our Services",
      "aboutUs": "O nás / About Us",
      "emergencyBanner": "V prípade núdze volajte / For emergencies call"
    }
  }
}
```

### 3.3 Verification

```
rg "[áäéíóôúýčďĺľňŕšťž]" apps/web/app/(dashboard)/website --type tsx
# Must return zero hits outside comments
pnpm run i18n:compare  # confirm key parity between en.json and sk.json
pnpm -w type-check
```

---

## Phase 4 — Dashboard editor UI

### 4.1 OPEN DECISION #1 — Dialog primitive

Before building the editor, resolve the missing `dialog.tsx`:
- **Option A (recommended):** Build a shared `dialog.tsx` primitive in
  `components/ui/` using `@radix-ui/react-dialog` (already in
  dependencies per the existing `popover.tsx` pattern). This serves
  the website editor AND the existing marketing/automations/documents
  modals (v2 OPEN DECISION #2).
- **Option B:** Use ad-hoc modal markup per module (current state).
- **Ask the requester before implementing.**

### 4.2 Create the editor page

- [ ] `apps/web/app/(dashboard)/website/page.tsx` — main editor view
- [ ] `apps/web/app/(dashboard)/website/loading.tsx` — skeleton loader
  (follow the pattern from the 29 recently added skeletons)

### 4.3 Editor components

- [ ] `apps/web/components/website/site-editor.tsx` — main editor shell
- [ ] `apps/web/components/website/block-palette.tsx` — block type picker
- [ ] `apps/web/components/website/block-renderer.tsx` — renders each
  block type with inline editing
- [ ] `apps/web/components/website/page-sidebar.tsx` — page list +
  add/reorder pages
- [ ] `apps/web/components/website/site-preview.tsx` — live preview
  (iframe or side-by-side)
- [ ] `apps/web/components/website/template-picker.tsx` — template
  selection dialog
- [ ] `apps/web/components/website/publish-controls.tsx` — publish/
  unpublish with URL display

### 4.4 Design system compliance

- [ ] **Header pattern:** `<h2 className="font-heading text-xl font-semibold">` +
  `<p className="text-sm text-muted-foreground">` — no icon box,
  no invented header component (v2 §0.3 golden pattern).
- [ ] **Loading:** `<TableSkeleton rows={6} cols={3} />` for the
  initial load.
- [ ] **Empty state:** `<EmptyState>` when no website exists yet,
  with CTA to create one or pick a template.
- [ ] **Mutation feedback:** `sonner` toasts on every mutation
  (success + error), `disabled={isPending}` on buttons.
- [ ] **Icons:** all from `lucide-react`.

### 4.5 Drag-and-drop for blocks and pages

- [ ] Use `@dnd-kit/core` + `@dnd-kit/sortable` (check if already in
  dependencies — if not, evaluate alternatives like native HTML5
  drag-and-drop).
- [ ] If no DnD library is in the project: OPEN DECISION #4 — add a
  DnD dependency or implement with native browser APIs.

**Phase 4 verification:**
```
pnpm -w type-check
pnpm -w lint
pnpm -w build
```
Manual pass at 375px / 768px / 1440px for the editor page.

---

## Phase 5 — Public site rendering

### 5.1 Public route: `apps/web/app/site/[slug]/page.tsx`

- [ ] Server-side rendered (SSR) for SEO
- [ ] Reads from `websiteRouter.getPublicSite` (or direct DB query)
- [ ] Renders blocks server-side based on `blockType`
- [ ] Includes full SEO metadata (title, description, Open Graph,
  Twitter cards, schema.org LocalBusiness)
- [ ] Bilingual: content served based on the website's locale setting

### 5.2 Public sub-pages: `apps/web/app/site/[slug]/[page]/page.tsx`

- [ ] Renders individual pages by slug
- [ ] Shared navigation from `websitePages` (where `showInNav = true`)
- [ ] Shared header/footer with practice branding

### 5.3 SEO & metadata

- [ ] Dynamic `metadata()` function reading from the website record
- [ ] `schema.org` JSON-LD for LocalBusiness (name, address, phone,
  opening hours, geo coordinates)
- [ ] Sitemap at `apps/web/app/site/[slug]/sitemap.ts`
- [ ] `robots.txt` at `apps/web/app/site/[slug]/robots.ts`

### 5.4 Add `/site` to middleware PUBLIC_PATH_PREFIXES

```ts
const PUBLIC_PATH_PREFIXES = [
  // ... existing entries ...
  "/site",
];
```

### 5.5 Loading skeleton

- [ ] `apps/web/app/site/[slug]/loading.tsx` — public site skeleton

**Phase 5 verification:**
```
pnpm -w type-check
pnpm -w lint
pnpm -w build
# Manual: visit /site/{test-slug} and confirm SSR rendering
# Check schema.org output via Google Rich Results Test
```

---

## Phase 6 — Template system (v0.dev integration)

### 6.1 Template architecture

Each of the 5 templates defines:
- A complete page structure (home, about, services, contact)
- A set of default blocks per page
- Default content (translated SK/EN)
- CSS/Tailwind class overrides for the template's visual style

Templates are stored as data (not code) — they seed the database
tables created in Phase 1.

### 6.2 Template definitions

See companion file `WEBSITE_V0_TEMPLATES.md` for the full v0.dev
prompts used to generate each template's visual design. The 5
templates are:

| # | Template ID | Name (SK) | Name (EN) | Style |
|---|---|---|---|---|
| 1 | `clean-modern` | Čistý a moderný | Clean & Modern | Minimalist, lots of whitespace, sharp typography |
| 2 | `warm-trusting` | Teplý a dôveryhodný | Warm & Trusting | Earth tones, testimonials-heavy, family-oriented |
| 3 | `clinical-professional` | Klinická & Profesionálna | Clinical & Professional | Data-driven, services-list, authority signals |
| 4 | `playful-friendly` | Hravá & Priateľská | Playful & Friendly | Illustrated, colorful, pet-friendly aesthetic |
| 5 | `emergency-first` | Pohotovosť na prvom mieste | Emergency First | Urgent care CTA prominent, after-hours focus |

### 6.3 Template rendering

- [ ] `apps/web/components/website/templates/clean-modern.tsx`
- [ ] `apps/web/components/website/templates/warm-trusting.tsx`
- [ ] `apps/web/components/website/templates/clinical-professional.tsx`
- [ ] `apps/web/components/website/templates/playful-friendly.tsx`
- [ ] `apps/web/components/website/templates/emergency-first.tsx`

Each template is a React component that takes the block data and
renders it with the template's specific styling. Templates share
block-level components but differ in layout, colors, and typography.

### 6.4 Template switching

- [ ] User can switch templates from the editor without losing content
- [ ] Content (blocks, text, images) is preserved; only the visual
  rendering changes
- [ ] Template switch is a single mutation: `updateSite({ templateId })`

### 6.5 Shared OpenVPM component library (`components/openvpm/`)

The companion ZIP (`open-vpm-website-templates.zip`) includes a ready-made
shared component library. **Do not reinvent these — copy and adapt:**

```
components/openvpm/
  BookingCTA.tsx          ← "Rezervovať termín" button, variant-aware
  ContactBlock.tsx        ← address + phone + email + maps link
  FearFreeBadge.tsx       ← Fear-Free badge (minimal | full | playful variants)
  OpeningHoursTable.tsx   ← reads HoursRow[], accent-color aware
  ServiceCard.tsx         ← icon + title + description card
  TestimonialCard.tsx     ← stars + quote + author
  index.ts                ← barrel export
```

These components accept an `accentColor` prop that maps to the template's
`palette.accent` from `lib/templates/metadata.ts`. Copy them to
`apps/web/components/openvpm/` unchanged as the public-site rendering layer.

**Phase 6 verification:**
```
pnpm -w type-check
pnpm -w build
# Manual: switch between all 5 templates and confirm rendering
# Verify openvpm/ components render with all 5 accentColor variants
```

---

## Phase 7 — Integration with existing modules

### 7.1 Sidebar registration

- [ ] Add to `navSections` in `components/layout/sidebar.tsx`:
  ```ts
  // In sectionMarketing:
  { href: "/website", key: "nav.website", icon: Globe, roles: ["admin", "veterinarian", "front_desk"] }
  ```
- [ ] Add `"website": "Website"` / `"website": "Webstránka"` to `nav`
  in `en.json` / `sk.json`.

### 7.2 Marketing module integration

- [ ] Published marketing posts (`status = "published"`) appear in the
  website's blog section (via `websiteRouter.getPublicPosts`).
- [ ] Blog feed block type (`blog_feed`) queries and renders recent
  published posts with title, excerpt, image, and date.

### 7.3 Booking CTA integration

- [ ] The "Book an Appointment" CTA button links to the existing portal
  booking flow.
- [ ] Two implementation options:
  - **Link mode:** CTA links to `/portal/{token}` with the practice's
    portal token (simplest, works with existing portal UI).
  - **Embed mode:** Embed the portal booking widget inline within the
    website (requires extracting portal booking components).
- [ ] OPEN DECISION #5 — link mode vs. embed mode for booking CTA.

### 7.4 Contact form → Inbox integration

- [ ] `websiteRouter.submitContactForm` (public procedure) creates a
  `websiteSubmissions` record AND optionally a `communications` record
  (so it appears in the inbox).
- [ ] Rate limiting: 5 submissions per IP per hour (use existing
  `rateLimit` utility).
- [ ] Email notification: trigger `packages/email` to send a
  notification email to the practice's admin email.

### 7.5 Practice data sync

- [ ] The website automatically reads from `practices` table:
  - `name` → site title / header
  - `address` → contact page, schema.org, map
  - `phone` → contact page, click-to-call
  - `email` → contact page
  - `logoUrl` → header logo
  - `settings.openingHours` → opening hours block
  - `settings.googleReviewUrl` → reviews/testimonials section
  - `settings.socialLinks` → footer social icons
- [ ] Changes in Settings automatically reflect on the published site
  (no manual sync needed — SSR reads fresh data on each request).

### 7.6 Automations integration

- [ ] New automation trigger type: `"website_form_submission"`.
- [ ] When a contact form is submitted, the automation engine can:
  - Send an auto-reply email
  - Create a follow-up task
  - Add the contact to a mailing list
- [ ] Wire the trigger into `automationsRouter` (additive only — do not
  modify existing trigger types).

### 7.7 OPEN DECISION #2 — Onboarding wizard integration

- [ ] **Option A (recommended):** Add a post-onboarding CTA on the
  dashboard welcome panel ("Set up your clinic's website") that links
  to `/website`.
- [ ] **Option B:** Add an optional 8th step to the onboarding wizard
  (after "branding") for quick website setup.
- [ ] Ask the requester before implementing.

**Phase 7 verification:**
```
pnpm -w type-check
pnpm -w lint
pnpm -w build
# Manual: test full integration flow
#   1. Create a practice → seed website → publish
#   2. Visit public site → verify branding from settings
#   3. Submit contact form → verify inbox entry
#   4. Create a marketing post → publish → verify blog feed on site
```

---

## Phase 8 — Final verification & definition of done

### 8.1 Full gate

```
pnpm install
pnpm -w type-check
pnpm -w lint
pnpm -w build
pnpm -w test              # all existing tests must still pass
pnpm exec playwright test  # full e2e suite
```

### 8.2 Definition of done — all must be true

- [ ] `packages/db/schema/website.ts` exists with 4 new tables
  (websites, websitePages, websiteBlocks, websiteSubmissions).
- [ ] `apps/web/server/routers/website.ts` exists with full CRUD +
  public endpoints + seed mutation.
- [ ] `website` router registered in `_app.ts`.
- [ ] `packages/db/data/en/` directory created with English seed data
  (fixing the pre-existing incomplete migration from Social Studio).
- [ ] `getLocaleData()` properly switches on locale parameter.
- [ ] `website` i18n namespace added to both `en.json` and `sk.json`
  with matching key sets.
- [ ] Dashboard editor at `/website` with block palette, page
  management, template picker, and publish controls.
- [ ] Public site at `/site/[slug]` with SSR, SEO metadata,
  schema.org, sitemap.
- [ ] `/site` added to `PUBLIC_PATH_PREFIXES` in middleware.
- [ ] Contact form submission creates inbox entry + rate-limited.
- [ ] Booking CTA links to existing portal booking flow.
- [ ] Published marketing posts appear in blog feed block.
- [ ] Practice data (name, address, phone, logo, hours) auto-syncs
  to the public site.
- [ ] All 5 templates render correctly with seed content.
- [ ] Sidebar nav item visible to admin/veterinarian/front_desk.
- [ ] No `any`, no `@ts-ignore`, no `// TODO` introduced.
- [ ] All existing tests pass unmodified.
- [ ] Full gate (type-check / lint / build / test / e2e) passes with
  pasted terminal output.
- [ ] **OPEN DECISION #1** (dialog primitive) resolved with requester.
- [ ] **OPEN DECISION #2** (onboarding integration) resolved with
  requester.
- [ ] **OPEN DECISION #3** (opening hours storage) resolved with
  requester.
- [ ] **OPEN DECISION #4** (drag-and-drop library) resolved if
  applicable.
- [ ] **OPEN DECISION #5** (booking CTA: link vs. embed) resolved
  with requester.

### 8.3 Report format

One section per phase (1–8), each with:
- Files changed
- Line-count delta
- Verification output (pasted, not paraphrased)
- Any OPEN DECISION status
- Anything that couldn't be cleanly resolved

---

## Appendix A — Block type content schemas

Each block type has a defined JSONB content structure:

### hero
```json
{
  "heading": "string (max 255)",
  "subheading": "string (max 1000)",
  "ctaText": "string (max 128)",
  "ctaLink": "string (max 512)",
  "secondaryCtaText": "string (max 128, optional)",
  "secondaryCtaLink": "string (max 512, optional)",
  "backgroundImage": "string (URL, optional)",
  "backgroundVideo": "string (URL, optional)"
}
```

### services
```json
{
  "heading": "string",
  "layout": "grid | list",
  "services": [
    {
      "icon": "lucide icon name",
      "title": "string",
      "description": "string",
      "price": "string (optional, e.g. 'od 35€')",
      "link": "string (optional)"
    }
  ]
}
```

### testimonials
```json
{
  "heading": "string",
  "layout": "carousel | grid",
  "testimonials": [
    {
      "name": "string",
      "text": "string (max 500)",
      "rating": "number (1-5)",
      "avatar": "string (URL, optional)",
      "source": "google | internal"
    }
  ]
}
```

### cta
```json
{
  "heading": "string",
  "description": "string",
  "buttonText": "string",
  "buttonLink": "string",
  "style": "primary | secondary | outlined"
}
```

### contact_form
```json
{
  "heading": "string",
  "description": "string",
  "fields": ["name", "email", "phone", "message"],
  "submitText": "string",
  "successMessage": "string"
}
```

### about
```json
{
  "heading": "string",
  "content": "string (rich text / HTML)",
  "image": "string (URL, optional)",
  "imageAlt": "string (optional)"
}
```

### gallery
```json
{
  "heading": "string",
  "layout": "grid | masonry | carousel",
  "images": [
    { "url": "string", "alt": "string", "caption": "string (optional)" }
  ]
}
```

### team
```json
{
  "heading": "string",
  "members": [
    {
      "name": "string",
      "role": "string",
      "bio": "string (max 300)",
      "photo": "string (URL, optional)"
    }
  ]
}
```

### pricing
```json
{
  "heading": "string",
  "plans": [
    {
      "name": "string",
      "price": "string",
      "period": "string (e.g. '/mesiac')",
      "features": ["string"],
      "ctaText": "string",
      "highlighted": "boolean"
    }
  ]
}
```

### map
```json
{
  "heading": "string",
  "address": "string",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "embedUrl": "string (Google Maps embed URL, optional)"
}
```

### faq
```json
{
  "heading": "string",
  "items": [
    { "question": "string", "answer": "string" }
  ]
}
```

### blog_feed
```json
{
  "heading": "string",
  "maxPosts": "number (default 6)",
  "layout": "grid | list",
  "showExcerpt": "boolean",
  "showDate": "boolean"
}
```

### opening_hours
```json
{
  "heading": "string",
  "source": "practice_settings",
  "showEmergency": "boolean",
  "emergencyPhone": "string (optional)"
}
```

### custom_html
```json
{
  "html": "string (sanitized — use DOMPurify allowlist)",
  "css": "string (optional, scoped)"
}
```

---

## Appendix B — Security considerations

1. **XSS protection for `custom_html` blocks:** Use the existing
   `sanitizeCanvasHtml()` function from `canvas.ts` (confirmed
   CANVAS_ALLOWED_TAGS / CANVAS_ALLOWED_ATTR allowlist). Import and
   reuse — do not create a new sanitizer.
2. **Rate limiting on contact form:** 5 submissions per IP per hour.
3. **Slug validation:** Only `[a-z0-9-]`, min 3, max 128 characters.
4. **Practice scoping:** Every protected mutation must verify
   `website.practiceId === ctx.practiceId`.
5. **Public endpoint security:** No sensitive data exposed in
   `getPublicSite` (no internal IDs, no staff emails, no patient data).
6. **Image upload:** Use the existing `storage-bounds.ts` for file
   size limits. Store in the existing storage system (check `packages/db/schema/files.ts`).
7. **GDPR compliance:** Contact form submissions must include a
   consent checkbox ("I agree to the processing of my personal data").
   The submission record must store the consent timestamp.

---

## Appendix C — Performance considerations

1. **SSR caching:** Public site pages should use Next.js ISR
   (Incremental Static Regeneration) with a 5-minute revalidation
   window. This gives near-static performance with automatic updates
   when content changes.
2. **Image optimization:** Use Next.js `<Image>` component with
   automatic format conversion (WebP/AVIF).
3. **Bundle size:** Template-specific CSS should be loaded per-template
   (not all 5 at once). Use dynamic imports for template components.
4. **Database queries:** The `getPublicSite` query should be a single
  join query (not N+1). Use Drizzle's `with` option for eager loading
   (confirmed in the router sketch above).

---

## Appendix D — OPEN DECISIONS summary

| # | Decision | Blocks | Recommendation | Status |
|---|---|---|---|---|
| 1 | Dialog primitive strategy | Phase 4 | Build shared `dialog.tsx` with Radix UI | 🔴 Open |
| 2 | Onboarding wizard integration | Phase 7 | Post-onboarding dashboard CTA | 🔴 Open |
| 3 | ~~Opening hours storage~~ | ~~Phase 1~~ | ~~JSONB in `practices.settings`~~ | ✅ **RESOLVED** — see §1.3 |
| 4 | Drag-and-drop library | Phase 4 | `@dnd-kit` (if not already in deps) | 🔴 Open |
| 5 | Booking CTA: link vs. embed | Phase 7 | Link mode (simpler, reuses portal) | 🔴 Open |

