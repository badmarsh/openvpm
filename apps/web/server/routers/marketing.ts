import { z } from "zod";
import { eq, and, isNull, desc, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, requireRole } from "../trpc";
import {
  marketingPosts,
  marketingTemplates,
  practices,
} from "@openpims/db";
import { getLocaleData } from "@openpims/db/data";

export const marketingRouter = createRouter({
  // -------------------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------------------

  /** List all templates available to this practice (global + practice-specific) */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.marketingTemplates.findMany({
      where: and(
        eq(marketingTemplates.practiceId, ctx.practiceId),
        isNull(marketingTemplates.deletedAt)
      ),
      orderBy: [desc(marketingTemplates.createdAt)],
    });
  }),

  /** Seed the default templates for a new practice (idempotent, locale-aware) */
  seedDefaultTemplates: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .mutation(async ({ ctx }) => {
      const existing = await ctx.db.query.marketingTemplates.findFirst({
        where: and(
          eq(marketingTemplates.practiceId, ctx.practiceId),
          isNull(marketingTemplates.deletedAt)
        ),
      });
      if (existing) return { seeded: false, message: "Templates already exist" };

      const [practice] = await ctx.db
        .select({ country: practices.country })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);
      const locale: "sk" | "en" = practice?.country === "SK" ? "sk" : "en";
      const { marketingTemplatesData } = getLocaleData(locale);

      await ctx.db.insert(marketingTemplates).values(
        marketingTemplatesData.map((t) => ({
          practiceId: ctx.practiceId,
          ...t,
        }))
      );
      return { seeded: true, count: marketingTemplatesData.length };
    }),

  // -------------------------------------------------------------------------
  // Posts
  // -------------------------------------------------------------------------

  /** Get all posts for this practice, newest first */
  getPosts: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["draft", "in_review", "approved", "scheduled", "published", "archived"])
          .optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(marketingPosts.practiceId, ctx.practiceId),
        isNull(marketingPosts.deletedAt),
      ];
      if (input?.status) {
        conditions.push(eq(marketingPosts.status, input.status));
      }
      return ctx.db.query.marketingPosts.findMany({
        where: and(...conditions),
        orderBy: [desc(marketingPosts.createdAt)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });
    }),

  /** Get posts within a date range (for calendar view) */
  getPostsByDateRange: protectedProcedure
    .input(
      z.object({
        from: z.string(), // ISO date string
        to: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.marketingPosts.findMany({
        where: and(
          eq(marketingPosts.practiceId, ctx.practiceId),
          isNull(marketingPosts.deletedAt),
          gte(marketingPosts.scheduledDate, new Date(input.from)),
          lte(marketingPosts.scheduledDate, new Date(input.to))
        ),
        orderBy: [marketingPosts.scheduledDate],
      });
    }),

  /** Create a new post */
  createPost: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        templateId: z.string().uuid().optional(),
        status: z
          .enum(["draft", "in_review", "approved", "scheduled"])
          .default("draft"),
        variants: z.record(z.any()).default({}),
        scheduledDate: z.string().optional(),
        topicInputs: z.record(z.string()).optional(),
        overlayText: z.string().max(512).optional(),
        hasConsent: z.boolean().default(false),
        hasWatermark: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(marketingPosts)
        .values({
          practiceId: ctx.practiceId,
          authorId: ctx.user.id,
          templateId: input.templateId ?? null,
          status: input.status,
          variants: input.variants,
          scheduledDate: input.scheduledDate
            ? new Date(input.scheduledDate)
            : null,
          topicInputs: input.topicInputs ?? {},
          overlayText: input.overlayText ?? null,
          hasConsent: input.hasConsent,
          hasWatermark: input.hasWatermark,
          history: [
            {
              status: input.status,
              timestamp: new Date().toISOString(),
              user: ctx.user.name ?? ctx.user.email,
              note: "Príspevok vytvorený",
            },
          ],
        })
        .returning();
      return post;
    }),

  /** Update an existing post's content */
  updatePost: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        postId: z.string().uuid(),
        status: z
          .enum(["draft", "in_review", "approved", "scheduled", "published", "archived"])
          .optional(),
        variants: z.record(z.any()).optional(),
        scheduledDate: z.string().optional().nullable(),
        overlayText: z.string().max(512).optional().nullable(),
        hasConsent: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId, scheduledDate, ...rest } = input;
      const existing = await ctx.db.query.marketingPosts.findFirst({
        where: and(
          eq(marketingPosts.id, postId),
          eq(marketingPosts.practiceId, ctx.practiceId),
          isNull(marketingPosts.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      const [updated] = await ctx.db
        .update(marketingPosts)
        .set({
          ...rest,
          scheduledDate:
            scheduledDate !== undefined
              ? scheduledDate
                ? new Date(scheduledDate)
                : null
              : existing.scheduledDate,
        })
        .where(eq(marketingPosts.id, postId))
        .returning();
      return updated;
    }),

  /** Update post status with approval workflow tracking */
  updatePostStatus: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        postId: z.string().uuid(),
        newStatus: z.enum([
          "draft",
          "in_review",
          "approved",
          "scheduled",
          "published",
          "archived",
        ]),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.marketingPosts.findFirst({
        where: and(
          eq(marketingPosts.id, input.postId),
          eq(marketingPosts.practiceId, ctx.practiceId),
          isNull(marketingPosts.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const currentHistory = (existing.history as Array<Record<string, unknown>>) ?? [];
      const newHistoryEntry = {
        status: input.newStatus,
        timestamp: new Date().toISOString(),
        user: ctx.user.name ?? ctx.user.email,
        note: input.note,
      };

      const [updated] = await ctx.db
        .update(marketingPosts)
        .set({
          status: input.newStatus,
          history: [...currentHistory, newHistoryEntry],
        })
        .where(eq(marketingPosts.id, input.postId))
        .returning();
      return updated;
    }),

  /** Soft-delete a post */
  deletePost: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.marketingPosts.findFirst({
        where: and(
          eq(marketingPosts.id, input.postId),
          eq(marketingPosts.practiceId, ctx.practiceId),
          isNull(marketingPosts.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      await ctx.db
        .update(marketingPosts)
        .set({ deletedAt: new Date() })
        .where(eq(marketingPosts.id, input.postId));
      return { deleted: true };
    }),
});
