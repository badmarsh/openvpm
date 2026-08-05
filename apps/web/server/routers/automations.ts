import { z } from "zod";
import { eq, and, isNull, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, requireRole } from "../trpc";
import { crmAutomations, crmAutomationLogs, practices } from "@openpims/db";
import { getLocaleData } from "@openpims/db/data";

export const automationsRouter = createRouter({
  /** List all automations for this practice */
  getAutomations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.crmAutomations.findMany({
      where: and(
        eq(crmAutomations.practiceId, ctx.practiceId),
        isNull(crmAutomations.deletedAt)
      ),
      orderBy: [crmAutomations.name],
    });
  }),

  /** Seed default automations for a new practice (idempotent, locale-aware) */
  seedDefaultAutomations: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .mutation(async ({ ctx }) => {
      const existing = await ctx.db.query.crmAutomations.findFirst({
        where: and(
          eq(crmAutomations.practiceId, ctx.practiceId),
          isNull(crmAutomations.deletedAt)
        ),
      });
      if (existing) return { seeded: false, message: "Automations already exist" };

      const [practice] = await ctx.db
        .select({ country: practices.country })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);
      const locale: "sk" | "en" = practice?.country === "SK" ? "sk" : "en";
      const { crmAutomationsData } = getLocaleData(locale);

      await ctx.db.insert(crmAutomations).values(
        crmAutomationsData.map((a) => ({
          practiceId: ctx.practiceId,
          ...a,
        }))
      );
      return { seeded: true, count: crmAutomationsData.length };
    }),

  /** Create a new automation rule */
  createAutomation: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        name: z.string().min(1).max(255),
        triggerType: z.enum(["appointment_created", "appointment_reminder", "post_published", "invoice_paid", "website_form_submission", "REVIEW_REQUEST", "ANNUAL_REMINDER", "custom"]),
        conditions: z.record(z.any()).default({}),
        actionType: z.enum(["sms", "email", "webhook"]),
        actionPayload: z.record(z.any()),
        isActive: z.boolean().default(true),
        externalWorkflowId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [automation] = await ctx.db
        .insert(crmAutomations)
        .values({
          practiceId: ctx.practiceId,
          ...input,
        })
        .returning();
      return automation;
    }),

  /** Update an existing automation */
  updateAutomation: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        automationId: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        conditions: z.record(z.any()).optional(),
        actionPayload: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { automationId, ...rest } = input;
      const existing = await ctx.db.query.crmAutomations.findFirst({
        where: and(
          eq(crmAutomations.id, automationId),
          eq(crmAutomations.practiceId, ctx.practiceId),
          isNull(crmAutomations.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found" });
      }
      const [updated] = await ctx.db
        .update(crmAutomations)
        .set(rest)
        .where(eq(crmAutomations.id, automationId))
        .returning();
      return updated;
    }),

  /** Toggle active/inactive */
  toggleAutomation: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ automationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.crmAutomations.findFirst({
        where: and(
          eq(crmAutomations.id, input.automationId),
          eq(crmAutomations.practiceId, ctx.practiceId),
          isNull(crmAutomations.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found" });
      }
      const [updated] = await ctx.db
        .update(crmAutomations)
        .set({ isActive: !existing.isActive })
        .where(eq(crmAutomations.id, input.automationId))
        .returning();
      return updated;
    }),

  /** Soft-delete an automation */
  deleteAutomation: protectedProcedure
    .use(requireRole("admin"))
    .input(z.object({ automationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.crmAutomations.findFirst({
        where: and(
          eq(crmAutomations.id, input.automationId),
          eq(crmAutomations.practiceId, ctx.practiceId),
          isNull(crmAutomations.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found" });
      }
      await ctx.db
        .update(crmAutomations)
        .set({ deletedAt: new Date() })
        .where(eq(crmAutomations.id, input.automationId));
      return { deleted: true };
    }),

  /** Get execution logs for this practice */
  getLogs: protectedProcedure
    .input(
      z.object({
        automationId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(crmAutomationLogs.practiceId, ctx.practiceId),
        isNull(crmAutomationLogs.deletedAt),
      ];
      if (input?.automationId) {
        conditions.push(eq(crmAutomationLogs.automationId, input.automationId));
      }
      return ctx.db.query.crmAutomationLogs.findMany({
        where: and(...conditions),
        orderBy: [desc(crmAutomationLogs.createdAt)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });
    }),
});
