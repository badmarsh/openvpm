import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure, requireRole } from "../trpc";
import { aiConsultationSessions, patients, soapNotes } from "@openpims/db";
import { SOAP_SECTION_MAX_LENGTH } from "@/lib/records/soap-content";

const clinicianProcedure = protectedProcedure.use(requireRole("admin", "veterinarian"));
const section = z.string().trim().max(SOAP_SECTION_MAX_LENGTH);

export const clinicalAiRouter = createRouter({
  // Audio processing is deliberately unavailable until consent, bounded upload,
  // provider configuration and transcript accuracy have been validated.
  startSession: clinicianProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .mutation(() => {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Audio consultation capture is unavailable. Use the clinician-reviewed SOAP editor." });
    }),

  getSession: clinicianProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.aiConsultationSessions.findFirst({
        where: and(eq(aiConsultationSessions.id, input.sessionId), eq(aiConsultationSessions.practiceId, ctx.practiceId), isNull(aiConsultationSessions.deletedAt)),
      });
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Záznam nenájdený" });
      return session;
    }),

  uploadAndProcess: clinicianProcedure
    .input(z.object({ sessionId: z.string().uuid(), audioBase64: z.string().max(1024), mimeType: z.string().max(100).optional() }))
    .mutation(() => {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Audio processing is unavailable. No audio was analyzed or saved." });
    }),

  /** Explicit clinician save of a previously completed, same-patient session. */
  applyToRecord: clinicianProcedure
    .input(z.object({
      sessionId: z.string().uuid(), patientId: z.string().uuid(),
      soapData: z.object({ subjective: section, objective: section, assessment: section, plan: section })
        .refine((value) => Object.values(value).some(Boolean), "SOAP content is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.aiConsultationSessions.findFirst({
        where: and(eq(aiConsultationSessions.id, input.sessionId), eq(aiConsultationSessions.practiceId, ctx.practiceId), eq(aiConsultationSessions.patientId, input.patientId), isNull(aiConsultationSessions.deletedAt)),
      });
      if (!session || session.status !== "COMPLETED") throw new TRPCError({ code: "NOT_FOUND", message: "Completed patient session not found" });
      const [patient] = await ctx.db.select({ id: patients.id }).from(patients).where(and(eq(patients.id, input.patientId), eq(patients.practiceId, ctx.practiceId), isNull(patients.deletedAt))).limit(1);
      if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Patient not found" });
      const [note] = await ctx.db.insert(soapNotes).values({ practiceId: ctx.practiceId, patientId: input.patientId, authorId: ctx.user.id, ...input.soapData }).returning();
      return note;
    }),
});
