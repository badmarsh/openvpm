import { z } from "zod";
import { eq, and, isNull, desc, asc, count, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, publicProcedure, requireRole } from "../trpc";
import {
  websites, websitePages, websiteBlocks, websiteSubmissions,
  practices, communications, marketingPosts, crmAutomations, crmAutomationLogs,
} from "@openpims/db";
import { getLocaleData } from "@openpims/db/data";
import { rateLimit } from "@/lib/rate-limit";

const blockTypeSchema = z.enum([
  "hero", "services", "testimonials", "cta", "contact_form",
  "about", "gallery", "team", "pricing", "map", "faq",
  "blog_feed", "opening_hours", "custom_html",
]);

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
      const locale = practice?.country === "HU" ? "hu" : practice?.country === "SK" ? "sk" : "en";
      const [site] = await ctx.db.insert(websites).values({
        practiceId: ctx.practiceId,
        ...input,
        locale,
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
      templateId: z.string().max(64).optional(),
      settings: z.record(z.any()).optional(),
      seoTitle: z.string().max(255).optional(),
      seoDescription: z.string().max(500).optional(),
      ogImage: z.string().max(512).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, id), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
      }
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
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, input.id), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
      }
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
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, input.id), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
      }
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
    .mutation(async ({ ctx, input }) => {
      // Validate website belongs to practice
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, input.websiteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
      }
      const [page] = await ctx.db.insert(websitePages).values(input).returning();
      return page;
    }),

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
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      // Scope check via website possession
      const [page] = await ctx.db
        .select({ siteId: websitePages.websiteId })
        .from(websitePages)
        .where(and(eq(websitePages.id, id), isNull(websitePages.deletedAt)))
        .limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, page.siteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      await ctx.db.update(websitePages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(websitePages.id, id));
      return { updated: true };
    }),

  deletePage: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Scope check
      const [page] = await ctx.db
        .select({ siteId: websitePages.websiteId })
        .from(websitePages)
        .where(and(eq(websitePages.id, input.id), isNull(websitePages.deletedAt)))
        .limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, page.siteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      await ctx.db.update(websitePages)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(websitePages.id, input.id));
      return { deleted: true };
    }),

  reorderPages: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      pageOrders: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify pages belong to this practice
      const owned = await ctx.db
        .select({ id: websitePages.id })
        .from(websitePages)
        .innerJoin(websites, eq(websitePages.websiteId, websites.id))
        .where(and(
          eq(websites.practiceId, ctx.practiceId),
          isNull(websitePages.deletedAt),
          isNull(websites.deletedAt)
        ));
      const ownedIds = new Set(owned.map((o) => o.id));
      for (const { id } of input.pageOrders) {
        if (!ownedIds.has(id)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
        }
      }
      await ctx.db.transaction(async (tx) => {
        for (const { id, sortOrder } of input.pageOrders) {
          await tx.update(websitePages)
            .set({ sortOrder, updatedAt: new Date() })
            .where(eq(websitePages.id, id));
        }
      });
      return { reordered: true };
    }),

  // -------------------------------------------------------------------------
  // Block management
  // -------------------------------------------------------------------------

  addBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      pageId: z.string().uuid(),
      blockType: blockTypeSchema,
      content: z.record(z.any()).default({}),
      settings: z.record(z.any()).default({}),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Scope check page -> website -> practice
      const [page] = await ctx.db
        .select({ siteId: websitePages.websiteId })
        .from(websitePages)
        .where(and(eq(websitePages.id, input.pageId), isNull(websitePages.deletedAt)))
        .limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, page.siteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      const [block] = await ctx.db.insert(websiteBlocks).values(input).returning();
      return block;
    }),

  updateBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      id: z.string().uuid(),
      content: z.record(z.any()).optional(),
      settings: z.record(z.any()).optional(),
      sortOrder: z.number().optional(),
      isVisible: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      // Scope check
      const [block] = await ctx.db
        .select({ pageId: websiteBlocks.pageId })
        .from(websiteBlocks)
        .where(and(eq(websiteBlocks.id, id), isNull(websiteBlocks.deletedAt)))
        .limit(1);
      if (!block) throw new TRPCError({ code: "NOT_FOUND", message: "Block not found" });
      const [page] = await ctx.db
        .select({ siteId: websitePages.websiteId })
        .from(websitePages)
        .where(and(eq(websitePages.id, block.pageId), isNull(websitePages.deletedAt)))
        .limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, page.siteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      await ctx.db.update(websiteBlocks)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(websiteBlocks.id, id));
      return { updated: true };
    }),

  removeBlock: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Scope check
      const [block] = await ctx.db
        .select({ pageId: websiteBlocks.pageId })
        .from(websiteBlocks)
        .where(and(eq(websiteBlocks.id, input.id), isNull(websiteBlocks.deletedAt)))
        .limit(1);
      if (!block) throw new TRPCError({ code: "NOT_FOUND", message: "Block not found" });
      const [page] = await ctx.db
        .select({ siteId: websitePages.websiteId })
        .from(websitePages)
        .where(and(eq(websitePages.id, block.pageId), isNull(websitePages.deletedAt)))
        .limit(1);
      if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, page.siteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      await ctx.db.update(websiteBlocks)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(websiteBlocks.id, input.id));
      return { deleted: true };
    }),

  reorderBlocks: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({
      blockOrders: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const owned = await ctx.db
        .select({ id: websiteBlocks.id })
        .from(websiteBlocks)
        .innerJoin(websitePages, eq(websiteBlocks.pageId, websitePages.id))
        .innerJoin(websites, eq(websitePages.websiteId, websites.id))
        .where(and(
          eq(websites.practiceId, ctx.practiceId),
          isNull(websiteBlocks.deletedAt),
          isNull(websitePages.deletedAt),
          isNull(websites.deletedAt)
        ));
      const ownedIds = new Set(owned.map((o) => o.id));
      for (const { id } of input.blockOrders) {
        if (!ownedIds.has(id)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
        }
      }
      await ctx.db.transaction(async (tx) => {
        for (const { id, sortOrder } of input.blockOrders) {
          await tx.update(websiteBlocks)
            .set({ sortOrder, updatedAt: new Date() })
            .where(eq(websiteBlocks.id, id));
        }
      });
      return { reordered: true };
    }),

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
    .query(async ({ ctx, input }) => {
      // Scope to this practice's websites
      const sites = await ctx.db
        .select({ id: websites.id })
        .from(websites)
        .where(and(eq(websites.practiceId, ctx.practiceId), isNull(websites.deletedAt)));
      const siteIds = sites.map((s) => s.id);
      if (siteIds.length === 0) return { items: [], total: 0 };

      const conditions = [
        isNull(websiteSubmissions.deletedAt),
        inArray(websiteSubmissions.websiteId, siteIds),
      ];
      if (input?.isRead !== undefined) {
        conditions.push(eq(websiteSubmissions.isRead, input.isRead));
      }
      const items = await ctx.db.query.websiteSubmissions.findMany({
        where: and(...conditions),
        orderBy: [desc(websiteSubmissions.createdAt)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });
      const [row] = await ctx.db
        .select({ total: count() })
        .from(websiteSubmissions)
        .where(and(...conditions));
      return { items, total: row?.total ?? 0 };
    }),

  /** Mark submission as read */
  markSubmissionRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [sub] = await ctx.db
        .select({ websiteId: websiteSubmissions.websiteId })
        .from(websiteSubmissions)
        .where(and(eq(websiteSubmissions.id, input.id), isNull(websiteSubmissions.deletedAt)))
        .limit(1);
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      const [site] = await ctx.db
        .select({ practiceId: websites.practiceId })
        .from(websites)
        .where(and(eq(websites.id, sub.websiteId), isNull(websites.deletedAt)))
        .limit(1);
      if (!site || site.practiceId !== ctx.practiceId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your website" });
      }
      await ctx.db.update(websiteSubmissions)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(websiteSubmissions.id, input.id));
      return { updated: true };
    }),

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
      consentTimestamp: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limit: 5 submissions per IP per hour
      const ip = ctx.ip ?? "unknown";
      const rateResult = await rateLimit({
        key: `website-contact:${input.websiteSlug}:${ip}`,
        limit: 5,
        windowMs: 60 * 60 * 1000,
      });
      if (!rateResult.success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many submissions. Please try again later." });
      }

      // Resolve website from slug
      const site = await ctx.db.query.websites.findFirst({
        where: and(
          eq(websites.slug, input.websiteSlug),
          isNull(websites.deletedAt)
        ),
        columns: { id: true, practiceId: true },
      });
      if (!site) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
      }

      // GDPR consent required for contact form
      if (!input.consentTimestamp) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Consent is required to submit the form" });
      }

      // Insert into websiteSubmissions
      const [submission] = await ctx.db.insert(websiteSubmissions).values({
        websiteId: site.id,
        submissionType: "contact",
        formData: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? "",
          message: input.message,
          pageSlug: input.pageSlug ?? "",
          consentTimestamp: input.consentTimestamp,
        },
        ipAddress: ip === "unknown" ? null : ip,
      }).returning();

      // Optionally create a communication record (inbox)
      let communicationId: string | null = null;
      const [comm] = await ctx.db.insert(communications).values({
        practiceId: site.practiceId,
        channel: "email",
        direction: "inbound",
        subject: `Website contact form: ${input.name}`,
        content: `${input.message}\n\n---\nFrom: ${input.name} <${input.email}>\nPhone: ${input.phone ?? "N/A"}`,
        status: "pending",
      }).returning();
      communicationId = comm?.id ?? null;

      if (communicationId) {
        await ctx.db.update(websiteSubmissions)
          .set({ communicationId, updatedAt: new Date() })
          .where(eq(websiteSubmissions.id, submission.id));
      }

      // Fire "website_form_submission" automations for this practice
      const matchingAutomations = await ctx.db.query.crmAutomations.findMany({
        where: and(
          eq(crmAutomations.practiceId, site.practiceId),
          eq(crmAutomations.triggerType, "website_form_submission"),
          eq(crmAutomations.isActive, true),
          isNull(crmAutomations.deletedAt)
        ),
      });
      if (matchingAutomations.length > 0) {
        await ctx.db.insert(crmAutomationLogs).values(
          matchingAutomations.map((automation) => ({
            practiceId: site.practiceId,
            automationId: automation.id,
            clientId: communicationId ?? submission.id,
            status: "pending" as const,
            channel: automation.actionType,
            messageContent: `Website contact form from ${input.name} <${input.email}>`,
          }))
        );
      }

      return { success: true, submissionId: submission.id };
    }),

  /** Get published blog posts for a practice (reads from marketingPosts) */
  getPublicPosts: publicProcedure
    .input(z.object({
      websiteSlug: z.string().min(3).max(128),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const site = await ctx.db.query.websites.findFirst({
        where: and(
          eq(websites.slug, input.websiteSlug),
          isNull(websites.deletedAt)
        ),
        columns: { practiceId: true },
      });
      if (!site) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Site not found" });
      }
      const posts = await ctx.db.query.marketingPosts.findMany({
        where: and(
          eq(marketingPosts.practiceId, site.practiceId),
          eq(marketingPosts.status, "published"),
          isNull(marketingPosts.deletedAt)
        ),
        orderBy: [desc(marketingPosts.scheduledDate)],
        limit: input.limit,
        offset: input.offset,
      });
      return posts;
    }),

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
      const locale = practice?.country === "HU" ? "hu" : practice?.country === "SK" ? "sk" : "en";
      const { websiteTemplatesData } = getLocaleData(locale);

      const template = (websiteTemplatesData as Record<string, WebsiteTemplate> | undefined)?.[input.templateId];
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Create website + pages + blocks in a transaction
      const site = await ctx.db.transaction(async (tx) => {
        const [created] = await tx.insert(websites).values({
          practiceId: ctx.practiceId,
          slug: input.slug,
          title: template.title,
          description: template.description,
          templateId: input.templateId,
          locale,
          status: "draft",
        }).returning();

        for (const page of template.pages) {
          const [createdPage] = await tx.insert(websitePages).values({
            websiteId: created.id,
            title: page.title,
            slug: page.slug,
            pageType: page.pageType,
            isHome: page.isHome,
            showInNav: page.showInNav,
            sortOrder: page.sortOrder,
          }).returning();

          for (const block of page.blocks) {
            await tx.insert(websiteBlocks).values({
              pageId: createdPage.id,
              blockType: block.blockType,
              content: block.content,
              settings: block.settings,
              sortOrder: block.sortOrder,
            });
          }
        }
        return created;
      });

      return { seeded: true, websiteId: site.id };
    }),
});

interface WebsiteTemplate {
  title: string;
  description: string;
  pages: {
    title: string;
    slug: string;
    pageType: string;
    isHome: boolean;
    showInNav: boolean;
    sortOrder: number;
    blocks: {
      blockType: string;
      sortOrder: number;
      content: Record<string, unknown>;
      settings: Record<string, unknown>;
    }[];
  }[];
}