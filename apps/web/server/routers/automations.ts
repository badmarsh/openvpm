import { z } from "zod";
import { eq, and, isNull, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, requireRole } from "../trpc";
import { crmAutomations, crmAutomationLogs } from "@openpims/db";

// Default automation templates for Slovak veterinary practice
const DEFAULT_AUTOMATIONS = [
  {
    name: "Pripomienka po prepustení (24h)",
    triggerType: "APPOINTMENT_DISCHARGE",
    conditions: { delayDays: 1 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Napíš priateľskú SMS pacientovi po veterinárnej návšteve. Opýtaj sa, ako sa miláčik cíti, a ponúkni pomoc. Maximálne 160 znakov. Fear-Free tón. SK jazyk.",
    },
    isActive: true,
  },
  {
    name: "Žiadosť o Google recenziu (3 dni po návšteve)",
    triggerType: "REVIEW_REQUEST",
    conditions: { delayDays: 3 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Napíš krátku SMS žiadajúcu klienta o zanechanie Google recenzie po spokojnej návšteve veterinára. Max 160 znakov. SK jazyk.",
    },
    isActive: true,
  },
  {
    name: "Ročná preventívna prehliadka",
    triggerType: "ANNUAL_REMINDER",
    conditions: { delayDays: 365 },
    actionType: "email",
    actionPayload: {
      templatePrompt:
        "Napíš e-mail pripomínajúci klientovi ročnú preventívnu prehliadku ich miláčika. Vrúcny, Fear-Free tón. SK jazyk.",
    },
    isActive: false,
  },
  {
    name: "Narodeniny pacienta",
    triggerType: "BIRTHDAY",
    conditions: { delayDays: 0 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Napíš milú narodeninú SMS pre miláčika klienta od veterinárnej kliniky. Zábavná, Fear-Free. Max 160 znakov. SK jazyk.",
    },
    isActive: true,
  },
];

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

  /** Seed default automations for a new practice (idempotent) */
  seedDefaultAutomations: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.db.query.crmAutomations.findFirst({
      where: and(
        eq(crmAutomations.practiceId, ctx.practiceId),
        isNull(crmAutomations.deletedAt)
      ),
    });
    if (existing) return { seeded: false, message: "Automations already exist" };

    await ctx.db.insert(crmAutomations).values(
      DEFAULT_AUTOMATIONS.map((a) => ({
        practiceId: ctx.practiceId,
        ...a,
      }))
    );
    return { seeded: true, count: DEFAULT_AUTOMATIONS.length };
  }),

  /** Create a new automation rule */
  createAutomation: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        name: z.string().min(1).max(255),
        triggerType: z.string(),
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
