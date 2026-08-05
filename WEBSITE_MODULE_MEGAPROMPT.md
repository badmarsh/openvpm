# OpenVPM — Website Builder Module Megaprompt (v1.1 — Quality Reviewed)

**Audience:** engineer/agent implementing this (human, Claude Code, Cursor,
future chat session with repo access).

**Status:** Phase 0 pre-flight verification is **COMPLETE**. Quality review audit
(`website_megaprompt_quality_review.md`) has been **FULLY INCORPORATED** into this
version. All critical fixes (syntax errors, template slug alignment, Tailwind v4 specs,
i18n conventions, and security column scoping) are applied. Start execution at Phase 1.

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

**Companion files:**
- `WEBSITE_V0_TEMPLATES.md` — 5 professional veterinary clinic template prompts for v0.dev generation.
- `website_megaprompt_quality_review.md` — Quality review audit log (all 12 items resolved in this document; see Appendix E).
- `legislativa.txt` — e-Kasa & SK Compliance module megaprompt (incorporated as Appendix F).
- `RICH_TEXT_IMPLEMENTATION.md` — TipTap rich text editor implementation for SOAP notes (incorporated as Appendix G).
- `archive/INTEGRATION_MEGAPROMPT.md` + `INTEGRATION_MEGAPROMPT_V3.md` — Social Studio integration megaprompts; blockers consolidated in Appendix H.

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
| Web app | Next.js (App Router, `apps/web`) | `apps/web/next.config.js`, `next-env.d.ts` (Templates use Next.js 15/16 App Router) |
| Styling | Tailwind CSS v4 | Template package.json / `app/globals.css` uses `@import "tailwindcss"` (no `tailwind.config.js`). Note shadcn v4 compatibility. |
| API | tRPC (procedures + routers) | `apps/web/server/trpc.ts` exports `protectedProcedure`, `requireRole`, `publicProcedure` |
| Database | Postgres + Drizzle ORM | `packages/db/schema/`, `packages/db/drizzle.config.ts` |
| Schema convention | `baseColumns()` from `./common` (id, createdAt, updatedAt, deletedAt) + `tenantColumns()` | `packages/db/schema/common.ts` |
| i18n (Dashboard) | next-intl, flat dotted keys, no namespace argument (`useTranslations()`) | `apps/web/app/(dashboard)/marketing/page.tsx` (golden reference) |
| i18n (Templates) | next-intl, namespace support (`useTranslations('website')` supported for standalone template components) | Zip `INTEGRATION.md` §4c pattern adapter |
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
      const [practice] = await ctx.db
        .select({ country: practices.country })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);
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

## Phase 6 — Template system (v0.dev integration & ZIP šablóny)

> [!IMPORTANT]
> **DO NOT REINVENT TEMPLATE COMPONENTS FROM SCRATCH.** Reálné šablóny (Next.js 16, Tailwind v4) už existujú v `open-vpm-website-templates.zip` a v `lib/templates/metadata.ts`. Vašou úlohou je ich **prebrať a zadaptovať**, nie ich písať od zera!

### 6.1 Single Source of Truth — Template Metadata & Slugs

Pri seedovaní a rendrovaní sa MUSIA použiť presné slugy a ID z `lib/templates/metadata.ts` (akákoľvek odchýlka spôsobí 404 pri `seedDefaultWebsite`):

| # | Template ID (Zip `id`) | Template Slug (Zip `slug`) | Názov (SK) | Názov (EN) | Štýl |
|---|---|---|---|---|---|
| 1 | `template-1` | `clean-modern` | Čistý a moderný | Clean & Modern | Minimalistický, veľa bieleho priestoru, ostrá typografia |
| 2 | `template-2` | `warm-trusting` | Teplý a dôveryhodný | Warm & Trusting | Zemské tóny, dôraz na recenzie, rodinná atmosféra |
| 3 | `template-3` | `clinical-professional` | Klinická & Profesionálna | Clinical & Professional | Dáta a fakty, zoznam služieb, autorita (pozn: NOT `clinical-pro`) |
| 4 | `template-4` | `playful-friendly` | Hravá & Priateľská | Playful & Friendly | Ilustrovaný, farebný, priateľský k zvieratám (pozn: NOT `playful-paws`) |
| 5 | `template-5` | `emergency-first` | Pohotovosť na prvom mieste | Emergency First | Pohotovosť a urgentné kontakty v popredí |

### 6.2 Architektúra adaptéra: `ClinicContent` vs. `website_blocks`

ZIP šablóny očakávajú monolitický objekt `ClinicContent` (`INTEGRATION.md` §2a):
```ts
interface ClinicContent {
  clinicName: string; tagline: string; address: string; phone: string; email: string;
  googleMapsUrl?: string; foundedYear?: number; heroHeadline: string; heroSubtext: string;
  services: ServiceItem[]; testimonials: TestimonialItem[]; team: TeamMember[]; hours: HoursRow[];
}
```

V databáze OpenVPM sú však dáta uložené granulárne v tabuľke `website_blocks` (per-blok JSONB schémy — Appendix A).

**Riešenie — Adaptér v Phase 6.3:**
Pre verejný rendering šablóny použite adaptér `mapBlocksToClinicContent(blocks: WebsiteBlock[], practice: Practice)`:
1. Ak stránka obsahuje blok `hero`, jeho obsah namapuje na `heroHeadline`, `heroSubtext`.
2. Ak stránka obsahuje blok `services`, jeho obsah sa použije pre `services[]`.
3. Ak blok chýba alebo má `source: "practice_settings"`, načítajú sa dáta priamo z `practice` / `practices.settings.openingHours`.
4. Šablónový komponent renderuje buď monoliticky cez `ClinicContent`, alebo priamo sekvenciu `website_blocks` s použitím zdieľaných UI komponentov z `components/openvpm/`.

### 6.3 Prebratie komponentov šablón zo ZIP

Kopírujte existujúce šablóny zo ZIP archívu do príslušných adresárov:
- [ ] `apps/web/components/website/templates/clean-modern.tsx`
- [ ] `apps/web/components/website/templates/warm-trusting.tsx`
- [ ] `apps/web/components/website/templates/clinical-professional.tsx`
- [ ] `apps/web/components/website/templates/playful-friendly.tsx`
- [ ] `apps/web/components/website/templates/emergency-first.tsx`

### 6.4 Template switching

- [ ] Používateľ môže zmeniť šablónu v editore bez straty obsahu.
- [ ] Obsah (bloky, texty, obrázky) zostáva zachovaný v `website_blocks`; mení sa len vizuálny renderer.
- [ ] Zmena šablóny je jedna mutácia: `updateSite({ templateId })`.

### 6.5 Zdieľaná OpenVPM knižnica komponentov (`components/openvpm/`)

Zoberte komponenty z balíčka `open-vpm-website-templates.zip` a umiestnite ich do `apps/web/components/openvpm/`:

```
components/openvpm/
  BookingCTA.tsx          ← Tlačidlo "Rezervovať termín", variant-aware
  ContactBlock.tsx        ← Adresa + telefón + email + mapa link
  FearFreeBadge.tsx       ← Fear-Free odznak (minimal | full | playful varianty)
  OpeningHoursTable.tsx   ← Tabuľka ordinačných hodín (akceptuje HoursRow[])
  ServiceCard.tsx         ← Karta služby (ikona + názov + popis)
  TestimonialCard.tsx     ← Karta recenzie (hviezdičky + citát + autor)
  index.ts                ← Barrel export
```

Tieto komponenty akceptujú prop `accentColor`, ktorý sa mapuje na `palette.accent` šablóny z `lib/templates/metadata.ts`.

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
- [ ] **Decision: use link mode.** CTA links to `/portal/{token}` with the
  practice's portal token. This is the simplest approach and reuses the
  existing portal UI. Embed mode is out of scope for this version.

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
  "emergencyPhone": "string (optional)",
  "hours": [
    {
      "day": { "sk": "Pondelok", "en": "Monday", "hu": "Hétfő" },
      "time": "08:00 – 18:00",
      "isEmergency": false
    }
  ]
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

### ClinicContent (ZIP template adapter)

ZIP templates from `open-vpm-website-templates.zip` expect a single
`ClinicContent` object. The dashboard editor stores the same data as
granular `website_blocks`. Use the adapter described in §6.2 to map
between these two shapes.

```ts
interface ClinicContent {
  clinicName: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  googleMapsUrl?: string;
  foundedYear?: number;
  heroHeadline: string;
  heroSubtext: string;
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  team: TeamMember[];
  hours: HoursRow[];
}

interface ServiceItem {
  icon?: string;
  title: string;
  description?: string;
  price?: string;
  link?: string;
}

interface TestimonialItem {
  name: string;
  text: string;
  rating?: number;
  avatar?: string;
  source?: "google" | "internal";
}

interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
}

interface HoursRow {
  day: { sk: string; en: string; hu: string };
  time: string;
  isEmergency?: boolean;
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
| 5 | Booking CTA: link vs. embed | Phase 7 | Link mode (simpler, reuses portal) | ✅ **RESOLVED** — see §7.3 |

---

## Appendix E — Quality Review Incorporation Log

**Source:** `C:\Users\marek\.gemini\antigravity-ide\brain\5a15227b-1edd-4c20-9547-ee4ff8a4dfcf\website_megaprompt_quality_review.md`

This appendix records how each finding from the quality review was
addressed in this version of the megaprompt.

| # | Finding | Severity | Resolution | Section |
|---|---|---|---|---|
| 1 | Syntax error in `createSite` locale value | 🔴 Critical | Fixed: real expression `practice?.country === "HU" ? "hu" : practice?.country === "SK" ? "sk" : "en"` | §2.1 |
| 2 | Template slugs `clinical-pro` and `playful-paws` mismatched ZIP | 🔴 Critical | Fixed: slugs now `clinical-professional` and `playful-friendly`; full ID/slug table added | §6.1 |
| 3 | Tailwind version unspecified | 🔴 Critical | Documented: Tailwind CSS v4 with `@import "tailwindcss"`; shadcn v4 compatibility noted | §1.1 |
| 4 | Next.js version unspecified | 🔴 Critical | Documented: Next.js App Router; templates use Next.js 15/16; verifier must confirm `apps/web/package.json` | §1.1 |
| 5 | i18n namespace convention conflict | 🔴 Critical | Documented: dashboard uses no namespace; template components may use `useTranslations('website')` | §1.1, §3 |
| 6 | `ClinicContent` interface missing | 🟡 Medium | Added to Appendix A; adapter architecture described | §6.2, Appendix A |
| 7 | `HoursRow` shape mismatch | 🟡 Medium | Resolved to human-readable ZIP format with trilingual day object | §1.3, Appendix A |
| 8 | `openingHours` scope still marked open | 🟡 Medium | Resolved: Option A JSONB in `practices.settings` | §1.3 |
| 9 | `components/openvpm/` library missing | 🟡 Medium | Added component inventory and migration instructions | §6.5 |
| 10 | `getPublicSite` returned full practice record | 🟡 Medium | Fixed: only `name`, `phone`, `address`, `logoUrl` selected | §2.1 |
| 11 | Tailwind v4 / shadcn compatibility risk | 🟡 Medium | Acknowledged; verifier must confirm shadcn setup works with v4 | §1.1 |
| 12 | `locale` enum missing `hu` | 🟡 Medium | Fixed: `locale` supports `"sk"`, `"en"`, `"hu"` throughout | §1.1, §2.1 |

### Applied v2 recommendations

| Recommendation | Application |
|---|---|
| Use `lib/templates/metadata.ts` as single source of truth | §6.1 template ID/slug table |
| Add "ZIP šablóny ako vstupný bod" section | §6 entire phase |
| Explicitly ban regenerating template components | §6 warning box and §6.3 |
| Add `ClinicContent` interface to Appendix A | Appendix A |
| Close obvious OPEN DECISIONs (#3 and #5) | #3 in §1.3; #5 in §7.3 and Appendix D |

---

## Appendix F — e-Kasa & SK Compliance Module Megaprompt

> Source file: `legislativa.txt`
>
> The following content preserves the original e-Kasa & SK compliance
> implementation prompt. It is included here for cross-reference while
> building the website module.

# MEGAPROMPT: e-Kasa & SK Compliance modul pre OpenVPM
# Repozitár: badmarsh/openvpm (fork z evangauer/openvpm)
# Stack: Next.js 14 App Router, TypeScript, tRPC, Drizzle ORM, PostgreSQL 16, shadcn/ui

## KONTEXT A CIEĽ
Implementuj minimálny, produkčne použiteľný compliance modul pre veterinárnu súkromnú kliniku
na Slovensku (SK). Modul musí spĺňať zákon č. 384/2025 Z. z. o evidencii tržieb (e-kasa,
účinný od 1.1.2026). Pracuješ v existujúcom monorepo (Turborepo + pnpm).
Zachovaj existujúcu architektúru: tRPC routre, Drizzle schémy, shadcn/ui komponenty.

## PRAVIDLÁ PRED KÓDOVANÍM
1. Prečítaj CLAUDE.md — dodržuj Jaz API kontrakt (IDs = resourceId, dátumy = valueDate,
   riadky = name nie description, saveAsDraft defaultne false pre finalizáciu).
2. Každý nový tRPC router pridaj do apps/web/server/ a zaregistruj v hlavnom routri.
3. Každú novú Drizzle schému pridaj do packages/db/ a exportuj z index.ts.
4. UI komponenty len v apps/web/components/ekasa/ (shadcn/ui + Tailwind, žiadne nové deps).
5. Všetky texty v SK a EN (i18n-ready, použiť translation keys v sk namespace).
6. Multi-tenant: každý záznam musí mať practice_id (existujúci vzor v DB).
7. NIKDY neloguj API kľúče ani tajné hodnoty.
8. TypeScript strict mode, Zod validácia na každom tRPC vstupe.

---

## TASK 1 — DB SCHÉMA: ekasa_receipts

Vytvor súbor: packages/db/src/schema/ekasa-receipts.ts

Polia (Drizzle + PostgreSQL):
- id: uuid primary key default crypto.randomUUID()
- practice_id: uuid NOT NULL references practices(id)
- invoice_id: uuid references invoices(id) (nullable — môže byť aj priama platba)
- receipt_number: text NOT NULL UNIQUE — generovaný podľa vzoru: {YYYYMMDD}-{SEQ}
- uid: text UNIQUE — UID dokladu pridelený FR SR systémom
- okp: text — OKP (overovací kód podnikateľa)
- pkp: text — PKP (podpisový kód podnikateľa)
- qr_code_data: text — obsah QR kódu pre tlač
- amount_base: numeric(12,2) NOT NULL — základ bez DPH
- amount_vat: numeric(12,2) NOT NULL DEFAULT 0
- amount_total: numeric(12,2) NOT NULL — celková suma
- vat_rate: numeric(5,2) NOT NULL DEFAULT 0 — sadzba DPH (veterinár zvyčajne 0% na lieky,
  20% na ostatné — použiť enum: 'ZERO' | 'REDUCED' | 'STANDARD')
- payment_method: text NOT NULL CHECK IN ('CASH', 'CARD', 'TRANSFER', 'OTHER')
- currency: text NOT NULL DEFAULT 'EUR'
- issued_at: timestamp NOT NULL DEFAULT now()
- sent_to_ekasa_at: timestamp — null = ešte neodoslané
- ekasa_status: text NOT NULL DEFAULT 'PENDING'
  CHECK IN ('PENDING', 'SENT', 'CONFIRMED', 'FAILED', 'OFFLINE_STORED')
- raw_response: jsonb — surová odpoveď z FR SR API
- created_by: uuid references users(id)
- created_at: timestamp NOT NULL DEFAULT now()
- updated_at: timestamp NOT NULL DEFAULT now()

Index: practice_id, issued_at DESC
Index: ekasa_status WHERE ekasa_status IN ('PENDING', 'FAILED') — pre retry queue

---

## TASK 2 — DB SCHÉMA: ekasa_config

Vytvor súbor: packages/db/src/schema/ekasa-config.ts

Polia:
- id: uuid primary key
- practice_id: uuid NOT NULL UNIQUE references practices(id)
- dic: text NOT NULL — DIČ podnikateľa (formát SK + 10 číslic)
- ic_dph: text — IČ DPH (ak platca DPH)
- pokladnica_id: text NOT NULL — ID pokladnice pridelené FR SR
- pokladnica_type: text NOT NULL CHECK IN ('ORP', 'VRP', 'CLOUD')
  — ORP = online reg. pokladnica, VRP = virtuálna, CLOUD = cloudová SW
- certificate_path: text — cesta k certifikátu (pre ORP podpisovanie)
- certificate_password_encrypted: text — zašifrované heslo (AES-256, kľúč z env)
- ekasa_api_url: text DEFAULT 'https://ekasa.financnasprava.sk/oto/api'
- offline_mode_enabled: boolean DEFAULT false — povolenie offline režimu (§11 zákona)
- notice_displayed: boolean DEFAULT false — označenie že oznámenie je fyzicky umiestnené
- cashless_payment_enabled: boolean DEFAULT false — Splnenie povinnosti od 1.5.2026
- created_at / updated_at: timestamps

---

## TASK 3 — BACKEND SERVICE: ekasa.service.ts

Vytvor: apps/web/lib/ekasa/ekasa.service.ts

Implementuj tieto funkcie (každá musí mať JSDoc s odkazom na paragraf zákona 384/2025):

### 3a. generateReceiptNumber(practiceId: string): Promise<string>
- Atomický counter per practice_id, formát: YYYYMMDD-NNNNNN (6-miestne číslo)
- Použiť PostgreSQL sequence alebo SELECT FOR UPDATE na zamedzenie duplikátov

### 3b. signReceipt(data: EkasaReceiptData): Promise<{okp: string, pkp: string}>
- OKP = SHA-1 hash z: DIC|POKLADNICA_ID|PORADOVE_CISLO|DATUM|SUMA (pipe-separated)
- PKP = RSA-SHA256 podpis tých istých dát súkromným kľúčom (§8 ods. 1 zákona)
- Ak certifikát chýba (VRP mode), vráť prázdne OKP/PKP
- Použiť Node.js crypto module, NIKDY externé podpisové knižnice

### 3c. sendToEkasa(receiptId: string): Promise<EkasaResponse>
- POST na FR SR API: ekasa_config.ekasa_api_url + '/pokladnica/doklad'
- Body: { dic, pokladnicaId, poradoveCislo, datumCas, celkovaSuma, zakladDph, dph,
         sadzbaDph, platobnyProstriedok, okp, pkp }
- Pri odpovedi 200: ulož uid, pkp z odpovede, nastav ekasa_status = 'CONFIRMED',
  sent_to_ekasa_at = now()
- Pri HTTP chybe alebo timeout: nastav ekasa_status = 'FAILED', loguj do raw_response
- Pri offline_mode_enabled: ulož lokálne, ekasa_status = 'OFFLINE_STORED',
  naplánuj retry (§11 zákona 384/2025 — odoslanie do 48h po obnovení spojenia)

### 3d. generateQrCode(uid: string, dic: string, suma: number): Promise<string>
- Formát QR: https://ekasa.financnasprava.sk/mdu/qr?uid={uid}&dic={dic}&s={suma}
- Vráť base64 data URL (použiť knižnicu 'qrcode' — je už v package.json alebo pridaj)

### 3e. retryFailedReceipts(practiceId: string): Promise<number>
- Nájdi všetky záznamy s ekasa_status IN ('FAILED', 'OFFLINE_STORED')
  WHERE sent_to_ekasa_at < now() - interval '5 minutes'
- Skús opätovne odoslať, vráť počet úspešných

---

## TASK 4 — tRPC ROUTER: ekasa.router.ts

Vytvor: apps/web/server/routers/ekasa.ts
Zaregistruj v: apps/web/server/root.ts ako ekasa: ekasaRouter

Procedúry:

### createReceipt (mutation)
Input (Zod):
  invoiceId?: string (uuid)
  amountBase: number (positive)
  amountVat: number (non-negative)
  amountTotal: number (positive)
  vatRate: 'ZERO' | 'REDUCED' | 'STANDARD'
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'
Logika:
  1. Skontroluj existujúci invoice (ak invoiceId) — musí patriť tej istej practice
  2. Generuj receiptNumber
  3. Podpíš doklad (signReceipt)
  4. Ulož do DB s ekasa_status = 'PENDING'
  5. Asynchrónne: sendToEkasa (neblokuj odpoveď)
  6. Generuj QR kód
  7. Vráť kompletný receipt s qr_code_data

### getReceipts (query)
Input: { page: number, limit: number (max 50), status?: EkasaStatus, dateFrom?: string, dateTo?: string }
Vráť: paginated list + summary (pending count, failed count)

### getConfig (query)
Vráť ekasa_config pre aktuálnu practice (bez certificate_password_encrypted!)

### updateConfig (mutation) — len Admin role
Input: Zod schema pre ekasa_config (všetky polia okrem id, practice_id, timestamps)
Ulož certifikát zašifrovaný: AES-256-GCM, kľúč z process.env.EKASA_CERT_ENCRYPTION_KEY

### retryFailed (mutation) — len Admin/Vet role
Spusti retryFailedReceipts, vráť { retried: number, succeeded: number }

### printReceipt (query)
Input: { receiptId: string }
Vráť: HTML string pre tlač (thermal printer 80mm formát) s QR kódom

---

## TASK 5 — UI STRÁNKY (Next.js App Router)

### 5a. Stránka: /app/(dashboard)/billing/ekasa/page.tsx

Zobraz:
- StatusBadge (shadcn Badge): PENDING=yellow, CONFIRMED=green, FAILED=red, OFFLINE=orange
- Tabuľka dokladov (shadcn DataTable): číslo, dátum, suma, DPH, metóda platby, stav
- Filter: dátum, stav
- Button "Retry neúspešných" (len Admin/Vet)
- Button "Tlačiť doklad" — otvorí printReceipt HTML v novom okne

### 5b. Stránka: /app/(dashboard)/settings/ekasa/page.tsx

Formulár pre ekasa_config:
- DIČ, IČ DPH, ID pokladnice, typ pokladnice (Select), API URL
- Upload certifikátu (file input → base64)
- Toggle: Offline mode, Oznámenie umiestnené, Bezhotovostná platba povolená
- Compliance checklist (§ zákona 384/2025):
  ☐ Pokladnica eKasa registrovaná na FR SR
  ☐ Oznámenie o evidencii tržieb umiestnené na viditeľnom mieste
  ☐ Bezhotovostná platba nad 1 EUR umožnená (povinné od 1.5.2026)
  ☐ Doklady obsahujú QR kód
- Ulož cez updateConfig mutation

### 5c. Komponent: EkasaReceiptButton (reusable)
Umiestni v billing/invoice detail strane ako tlačidlo "Vydať doklad eKasa"
- Disabled ak invoice.status !== 'PAID'
- Po kliknutí: zavolaj createReceipt, zobraz toast s výsledkom
- Ak CONFIRMED: zobraz QR kód v dialógu (shadcn Dialog), ponúkni tlač

---

## TASK 6 — TLAČOVÝ DOKLAD (80mm thermal)

Vytvor: apps/web/lib/ekasa/receipt-template.ts

Funkcia generateReceiptHtml(receipt, practice, config): string
Povinné náležitosti dokladu podľa §8 zákona 384/2025:
- Obchodné meno a adresa predávajúceho
- DIČ
- ID pokladnice
- Poradové číslo dokladu
- Dátum a čas vystavenia (formát: DD.MM.YYYY HH:mm:ss)
- Zoznam položiek (názov, množstvo, jedn. cena, sadzba DPH, suma)
- Základ DPH per sadzba, suma DPH per sadzba
- Celková suma (EUR, 2 desatinné miesta)
- Spôsob platby
- OKP a PKP (skrátené — prvých 8 znakov)
- QR kód (img tag s base64)
- Text: "Doklad bol zaevidovaný v systéme eKasa FS SR" (pri CONFIRMED)
  alebo "OFFLINE DOKLAD — bude odoslaný po obnovení spojenia" (pri OFFLINE_STORED)

CSS: max-width 80mm, font-size 10px, monospace, print-friendly (@media print)

---

## TASK 7 — BACKGROUND JOB: retry queue

Vytvor: apps/web/lib/ekasa/retry-queue.ts

Implementuj setInterval-based retry (alebo ak existuje cron/queue systém v repo, použi ho):
- Spúšťaj každých 5 minút
- Zavolaj retryFailedReceipts pre všetky active practices
- Loguj výsledky (winston/pino — použiť existujúci logger)
- Inicializuj v apps/web/app/api/cron/ekasa-retry/route.ts
  (Next.js Route Handler, volateľný Vercel Cron alebo externým cron jobom)

---

## TASK 8 — ENV VARIABLES

Pridaj do .env.example tieto premenné (s komentármi):

# e-Kasa (Zákon 384/2025 Z. z. — Finančná správa SR)
EKASA_CERT_ENCRYPTION_KEY=          # 32-byte hex string pre AES-256 šifrovanie certif.
EKASA_DEFAULT_API_URL=https://ekasa.financnasprava.sk/oto/api
EKASA_OFFLINE_RETRY_INTERVAL_MS=300000   # 5 minút

---

## TASK 9 — NAVIGÁCIA

V existujúcom sidebar/nav (nájdi v apps/web/components/):
1. Do sekcie "Billing" pridaj: "eKasa doklady" → /billing/ekasa
2. Do sekcie "Settings" pridaj: "eKasa konfigurácia" → /settings/ekasa
3. Ak existuje ComplianceBadge alebo notification systém, zobraz badge ak:
   - existujú FAILED doklady (červený badge s počtom)
   - ekasa_config.notice_displayed = false (žltá warning ikona)

---

## TASK 10 — TESTY

Vytvor: apps/web/__tests__/ekasa/

### ekasa.service.test.ts (Vitest)
- Test generateReceiptNumber — unikátnosť, formát YYYYMMDD-NNNNNN
- Test signReceipt — OKP hash overenie, PKP podpis (mock certifikát)
- Test generateQrCode — validný base64 data URL
- Test sendToEkasa — mock fetch, test CONFIRMED aj FAILED scenár
- Test retryFailedReceipts — len záznamy staršie ako 5 min

### ekasa.router.test.ts (Vitest + trpc caller)
- Test createReceipt — kompletný flow s mock FR SR API
- Test getReceipts — paginovanie, filtrovanie
- Test updateConfig — šifrovanie certifikátu, len Admin role

---

## QUALITY GATES (splniť pred dokončením každého tasku)

1. `pnpm typecheck` — 0 TS chýb
2. `pnpm lint` — 0 ESLint chýb
3. `pnpm test` — všetky nové testy prechádzajú
4. `pnpm db:push` — schéma sa aplikuje bez chýb
5. Každý nový endpoint musí byť chránený: overTRPCAuth + practice_id check
6. Žiadne `any` typy — použiť inferované typy z Drizzle a Zod

---

## PRIORITA IMPLEMENTÁCIE (poradie)

1. Tasks 1+2 (DB schémy)
2. Task 8 (ENV)
3. Task 3 (service)
4. Task 4 (tRPC router)
5. Task 5 + 6 (UI + tlač)
6. Task 7 (retry job)
7. Task 9 (navigácia)
8. Task 10 (testy)

---

## ZÁKONNÉ MINIMÁ — CHECKLIST (essential only, §384/2025 Z. z.)

- [x] Evidencia každej tržby v eKasa systéme bez odkladu (§3 ods. 1)
- [x] Vydanie dokladu s QR kódom (§8)
- [x] OKP a PKP podpis (§8 ods. 1 písm. g, h)
- [x] Offline režim: uloženie a odoslanie do 48h (§11)
- [x] Oznámenie na predajnom mieste (§14)
- [x] Bezhotovostná platba nad 1 EUR (§3a, účinné od 1.5.2026)
- [x] Archivácia dokladov min. 10 rokov (Zákon č. 431/2002 Z. z. o účtovníctve)

---

## Appendix G — TipTap Rich Text Editor Implementation for SOAP Notes

> Source file: `RICH_TEXT_IMPLEMENTATION.md`
>
> The following content preserves the original TipTap rich text editor
> implementation guide. It is included here for cross-reference with the
> website module (e.g., rich text blocks such as `about` and `custom_html`).

# TipTap Rich Text Editor Implementation for SOAP Notes

## Overview

This PR adds professional rich text editing capabilities to OpenVPM's SOAP note workflow using TipTap, a modern, headless editor built on ProseMirror.

### What's New
- **WYSIWYG Editing**: Veterinary staff can now make text **bold**, *italic*, <u>underlined</u>, and create lists
- **Professional UX**: Clean toolbar similar to Google Docs/Microsoft Word
- **No Database Migration**: Rich text is stored as clean HTML in existing `text` columns
- **Mobile-Friendly**: Full functionality on iPad/tablets in exam rooms
- **AI-Ready**: Can be extended for Chipmunk (AI agent) to generate formatted SOAP notes

## Files Changed

### 1. **apps/web/package.json**
Added TipTap dependencies:
```json
"@tiptap/react": "^2.1.0",
"@tiptap/starter-kit": "^2.1.0",
"@tiptap/extension-underline": "^2.1.0",
"@tiptap/extension-highlight": "^2.1.0"
```

### 2. **apps/web/app/components/SoapNoteEditor.tsx** (NEW)
A reusable rich text editor component featuring:
- **Formatting buttons**: Bold, Italic, Underline, Lists
- **Clear formatting**: Remove all formatting from selected text
- **Keyboard shortcuts**: Ctrl+B, Ctrl+I, Ctrl+U
- **Real-time HTML output**: Stored in component state
- **Mobile-responsive toolbar**: Works on any screen size

#### Usage
```tsx
<SoapNoteEditor
  value={subjective}
  onChange={setSubjective}
  placeholder="What the owner reports..."
/>
```

### 3. **apps/web/app/(dashboard)/records/new-soap/[patientId]/page.tsx** (MODIFIED)
Replaced four `<textarea>` elements with `<SoapNoteEditor>` components:
- Subjective
- Objective
- Assessment
- Plan

No other business logic changes.

### 4. **apps/web/app/components/SoapNoteDisplay.tsx** (NEW)
Display component for rendering stored HTML SOAP notes:
```tsx
<SoapNoteDisplay
  subjective={soapNote.subjective}
  objective={soapNote.objective}
  assessment={soapNote.assessment}
  plan={soapNote.plan}
/>
```

Renders each section with proper typography and HTML safety (using `dangerouslySetInnerHTML` - safe here because we control the data source).

## Database Compatibility

**No migration needed!** The current schema already supports this:

```typescript
// Existing schema (unchanged)
subjective: text("subjective"),  // Can now store HTML like "<p>Patient is <strong>lame</strong></p>"
objective: text("objective"),
assessment: text("assessment"),
plan: text("plan"),
```

The HTML output from TipTap is clean and semantic:
```html
<p>Patient presented with <strong>lameness</strong> in <u>left front</u> limb.</p>
<ul>
  <li>Temperature: 102.5°F</li>
  <li>Heart rate: 85 bpm</li>
</ul>
```

## Features Included

### Toolbar Buttons
1. **Bold** - Make text bold (`**text**` in Markdown terms)
2. **Italic** - Make text italic
3. **Underline** - Underline text
4. **Bullet List** - Create unordered lists (useful for vitals, symptoms)
5. **Ordered List** - Create numbered lists
6. **Clear Formatting** - Remove all formatting from selected text

### Keyboard Shortcuts
- `Ctrl+B` (Cmd+B on Mac) - Toggle bold
- `Ctrl+I` (Cmd+I on Mac) - Toggle italic
- `Ctrl+U` (Cmd+U on Mac) - Toggle underline
- `Ctrl+Shift+B` - Toggle bullet list
- `Ctrl+Shift+O` - Toggle ordered list

### Coming in Future PRs
- Highlight/color support
- Superscript/subscript (for medical abbreviations)
- Tables (for recording vitals in grid format)
- Image embedding (for diagnostic photos)
- Comments/annotations (for multi-vet collaboration)

## Testing Checklist

### Frontend Testing
- [ ] Create new SOAP note
- [ ] Format text: bold, italic, underline
- [ ] Create bullet list (e.g., vitals list)
- [ ] Create ordered list (e.g., treatment steps)
- [ ] Clear formatting on selected text
- [ ] Save note and verify formatting persists
- [ ] Load note and verify rich text displays correctly
- [ ] Test on mobile/tablet
- [ ] Test keyboard shortcuts

### Edge Cases
- [ ] Very long SOAP notes (1000+ characters)
- [ ] Paste from Word/Google Docs
- [ ] Copy formatting between sections
- [ ] Special characters (°, μ, etc.)
- [ ] Multiple line breaks
- [ ] Mixed formatting (bold + italic + underline)

### Integration Testing
- [ ] SOAP notes appear correctly in patient record view
- [ ] PDF export includes formatting
- [ ] JSON API returns proper HTML
- [ ] Search/filter still works on plain text content

## Performance Notes

- **Bundle Size**: ~150KB added (gzipped: ~50KB)
- **Runtime**: Minimal (ProseMirror is highly optimized)
- **Load Time**: Editor initializes in <100ms for typical notes
- **Storage**: No change (same text columns)

### Lazy Loading (Optional Future Optimization)
If bundle size becomes a concern, TipTap can be loaded on-demand:
```tsx
const SoapNoteEditor = dynamic(() => import('@/components/SoapNoteEditor'), {
  ssr: false
});
```

## Migration Path

### For Existing Data
Old plain-text SOAP notes will continue to work as-is. No data loss. When edited, they'll be converted to HTML automatically.

### For Future Expansion
If LOVS wants to add more advanced features:
1. **Mentions** - `@Dr. Smith` to tag colleagues
2. **AI Integration** - Chipmunk generates pre-formatted SOAP notes
3. **Comments** - Specialists annotate sections
4. **Collaboration** - Real-time multi-vet editing
5. **Templates** - Pre-formatted SOAP note templates by specialty

## Security Considerations

- **XSS Protection**: TipTap sanitizes output automatically
- **Input Validation**: All HTML is generated by TipTap (user cannot inject code)
- **Display Safety**: `dangerouslySetInnerHTML` is safe here because source is controlled

## Accessibility

- Toolbar buttons have `title` attributes for tooltips
- Keyboard shortcuts work for power users
- Focus management: Tab through toolbar, then to editor
- Screen reader support: TipTap has built-in ARIA labels

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (iOS/Android)

## Troubleshooting

### Editor not showing?
- Check browser console for errors
- Ensure TipTap packages are installed: `pnpm install`
- Verify no CSS conflicts with existing styles

### Formatting not saving?
- Check that backend is storing the HTML correctly
- Verify SOAP note schema accepts the HTML string
- Look for any HTML sanitization on the backend

### Performance issues?
- Monitor bundle size: `next/bundle-analyzer`
- Check for multiple editor instances in DOM
- Consider lazy loading for large documents

## Related Issues

- Closes: OpenVPM #[issue-number]
- Related: Rich text for prescriptions, exam notes, etc.

## References

- TipTap Docs: https://tiptap.dev
- ProseMirror: https://prosemirror.net
- OpenVPM Architecture: [link to docs]

---

## For Reviewers

This PR is ready for:
1. ✅ Code review (clean, well-commented)
2. ✅ Testing (comprehensive test cases included)
3. ✅ Accessibility review (ARIA compliant)
4. ✅ Performance review (bundle size analyzed)
5. ✅ Security review (no XSS vectors)

### Questions for Maintainers
1. Should we add PDF export support for formatted SOAP notes?
2. Any preference on additional formatting options (tables, code blocks)?
3. Should we version the HTML format or accept any TipTap output?

---

**Estimated Merge Time**: 1-2 weeks for testing and feedback
**Deployment Risk**: Low (backwards compatible, no schema changes)
**Rollback Difficulty**: None (no database migration)

---

## Appendix H — Integration Megaprompt Blockers (v2 & v3)

The following open decisions and blockers are carried over from the Social
Studio integration megaprompts (`archive/INTEGRATION_MEGAPROMPT.md` and
`INTEGRATION_MEGAPROMPT_V3.md`) so that this file can serve as a single
execution megaprompt.

### Open decisions from integration megaprompts

| # | Decision | Blocks | Current state |
|---|---|---|---|
| 1 | Duplicate `seed-suppliers.ts` — keep root copy or `packages/db/` copy? | Phase 1.2 | 🔴 Open — neither file is referenced; root copy uses workspace aliases, `packages/db/` copy uses relative imports |
| 2 | Dialog primitive strategy — build shared `dialog.tsx` or keep ad-hoc modal markup? | Phase 4.1 | 🔴 Open — no `dialog.tsx` exists in `components/ui/`; website module also needs this (coordinate with OPEN DECISION #1 in this document) |

### Phase 3.5 blockers from INTEGRATION_MEGAPROMPT_V3.md

| # | Blocker | Location | Required action |
|---|---|---|---|
| 1 | 11 `as any` casts in i18n component code | `apps/web/app/(dashboard)/{marketing,automations,documents}/**` | Diagnose compiler error, replace with typed maps using `satisfies Record<...>` |
| 2 | Hardcoded Slovak history note | `apps/web/server/routers/marketing.ts` (`createPost`) | Replace with i18n key (e.g., `marketing.postCreatedNote`) |
| 3 | `compare-i18n-keys.js` at repo root | repo root | Decide: formalize as pnpm script, move to `scripts/`, or delete |

### Phase 4 blockers from v3

| # | Blocker | Status |
|---|---|---|
| 1 | Header pattern not applied — 5 pages still use old icon-box wrapper | Not started |
| 2 | Loading/empty states missing — zero uses of `TableSkeleton`, `EmptyState`, `sonner` in marketing/automations/documents | Not started |
| 3 | Mutation feedback missing `onError` on 8 `useMutation()` calls | Not started |
| 4 | Modal/dialog work blocked by OPEN DECISION #2 above | Open |

### Phase 5 full gate from integration megaprompts

```
pnpm install
pnpm -w typecheck
pnpm -w lint
pnpm -w build
pnpm -w test
pnpm exec playwright test
```

### Definition-of-done blockers

- [ ] Zero `fix*.js`, `rewrite.js`, `translate_sk.ts`, `test-login.ts` at repo root; no duplicate `seed-suppliers.ts`.
- [ ] `SEED_TEMPLATES`, `DEFAULT_AUTOMATIONS`, `MASTER_DOCUMENTS` moved to `packages/db/data/{sk,en}/`.
- [ ] No Slovak diacritics in marketing/automations/documents component files outside JSON/comments.
- [ ] `sk.json`/`en.json` key sets match for new namespaces.
- [ ] All 5 integration pages match `patients/page.tsx` inline header pattern and use loading/empty/toast components.
- [ ] `canvas-safety.test.ts` and all pre-existing security tests pass unmodified.
- [ ] **OPEN DECISION #1** (`seed-suppliers.ts`) resolved with requester.
- [ ] **OPEN DECISION #2** (`dialog.tsx` strategy) resolved with requester.

