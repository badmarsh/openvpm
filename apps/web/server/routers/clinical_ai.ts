import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure } from "../trpc";
import { aiConsultationSessions, soapNotes } from "@openpims/db";
import { processConsultationAudio } from "@/lib/clinical-ai/service";

export const clinicalAiRouter = createRouter({
  /** Spustí novú AI konzultáciu a vráti ID session */
  startSession: protectedProcedure
    .input(z.object({ patientId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .insert(aiConsultationSessions)
        .values({
          practiceId: ctx.practiceId,
          patientId: input.patientId,
          userId: ctx.user.id,
          status: "RECORDING",
        })
        .returning();

      return session;
    }),

  /** Načíta detail prebiehajúcej alebo dokončenej session */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.aiConsultationSessions.findFirst({
        where: and(
          eq(aiConsultationSessions.id, input.sessionId),
          eq(aiConsultationSessions.practiceId, ctx.practiceId),
          isNull(aiConsultationSessions.deletedAt)
        ),
      });

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Záznam nenájdený" });
      }

      return session;
    }),

  /** Prijme zvukový záznam, spracuje ho a uloží výsledky */
  uploadAndProcess: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        audioBase64: z.string(), // Očakávame base64 string
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Zmeň status
      await ctx.db
        .update(aiConsultationSessions)
        .set({ status: "ANALYZING" })
        .where(eq(aiConsultationSessions.id, input.sessionId));

      try {
        const result = await processConsultationAudio({
          audioBase64: input.audioBase64,
          mimeType: input.mimeType,
          practiceId: ctx.practiceId,
        });

        // Ulož do DB
        const [updatedSession] = await ctx.db
          .update(aiConsultationSessions)
          .set({
            status: "COMPLETED",
            rawTranscript: result.rawTranscript,
            generatedSoap: result.generatedSoap,
            suggestedBillingItems: result.suggestedBillingItems,
          })
          .where(eq(aiConsultationSessions.id, input.sessionId))
          .returning();

        return updatedSession;
      } catch (error) {
        console.error("[Clinical AI] Error processing audio:", error);
        await ctx.db
          .update(aiConsultationSessions)
          .set({
            status: "FAILED",
            errorMessage: error instanceof Error ? error.message : "Neznáma chyba",
          })
          .where(eq(aiConsultationSessions.id, input.sessionId));
          
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Chyba pri spracovaní audia modelom Gemini.",
        });
      }
    }),

  /** Zoberie extrahovaný SOAP a uloží ho natrvalo do soap_notes pacientovej karty */
  applyToRecord: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        patientId: z.string().uuid(),
        soapData: z.object({
          subjective: z.string(),
          objective: z.string(),
          assessment: z.string(),
          plan: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vytvor nový záznam v soap_notes tabuľke
      const [newNote] = await ctx.db
        .insert(soapNotes)
        .values({
          practiceId: ctx.practiceId,
          patientId: input.patientId,
          authorId: ctx.user.id,
          subjective: input.soapData.subjective,
          objective: input.soapData.objective,
          assessment: input.soapData.assessment,
          plan: input.soapData.plan,
        })
        .returning();

      return newNote;
    }),
});
