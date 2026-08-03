import { z } from "zod";
import { eq, and, isNull, desc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  protectedProcedure,
  requireRole,
} from "../trpc";
import { ekasaConfig, ekasaReceipts } from "@openpims/db";
import { practices } from "@openpims/db";
import {
  processEkasaReceipt,
  generateQrCodeData,
} from "@/lib/ekasa/service";
import { generateReceiptHtml } from "@/lib/ekasa/receipt-template";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------
const ekasaConfigInput = z.object({
  dic: z.string().min(1, "DIČ je povinné").max(100),
  icDph: z.string().max(100).optional(),
  pokladnicaId: z.string().min(1, "ID pokladnice je povinné").max(100),
  pokladnicaType: z.enum(["ORP", "VRP", "CLOUD"]).default("CLOUD"),
  ekasaApiUrl: z
    .string()
    .url("Musí byť platné URL")
    .default("https://ekasa.financnasprava.sk/oto/api"),
  offlineModeEnabled: z.boolean().default(false),
  cashlessEnabled: z.boolean().default(false),
});

const createReceiptInput = z.object({
  invoiceId: z.string().uuid().optional(),
  amountBase: z.string().regex(/^\d+(\.\d{1,2})?$/, "Neplatná suma"),
  amountVat: z.string().regex(/^\d+(\.\d{1,2})?$/, "Neplatná suma"),
  amountTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, "Neplatná suma"),
  vatRate: z.enum(["ZERO", "REDUCED", "STANDARD"]).default("ZERO"),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]).default("CARD"),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        qty: z.number().min(1),
        unitPrice: z.string(),
        vatRate: z.string(),
      })
    )
    .min(1, "Minimálne jedna položka"),
  issuedAt: z.string().optional(), // ISO string
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const ekasaRouter = createRouter({
  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------

  /** Načíta konfiguráciu e-Kasa pre túto kliniku */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.query.ekasaConfig.findFirst({
      where: and(
        eq(ekasaConfig.practiceId, ctx.practiceId),
        isNull(ekasaConfig.deletedAt)
      ),
    });
    return config ?? null;
  }),

  /** Vytvorí alebo aktualizuje konfiguráciu e-Kasa */
  updateConfig: protectedProcedure
    .use(requireRole("admin"))
    .input(ekasaConfigInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.ekasaConfig.findFirst({
        where: and(
          eq(ekasaConfig.practiceId, ctx.practiceId),
          isNull(ekasaConfig.deletedAt)
        ),
      });

      if (existing) {
        const [updated] = await ctx.db
          .update(ekasaConfig)
          .set({
            ...input,
            icDph: input.icDph ?? null,
          })
          .where(eq(ekasaConfig.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(ekasaConfig)
        .values({
          practiceId: ctx.practiceId,
          ...input,
          icDph: input.icDph ?? null,
        })
        .returning();
      return created;
    }),

  // -------------------------------------------------------------------------
  // Receipts
  // -------------------------------------------------------------------------

  /** Vytvorí nový e-Kasa doklad — podpíše a odošle do FR SR asynchrónne */
  createReceipt: protectedProcedure
    .input(createReceiptInput)
    .mutation(async ({ ctx, input }) => {
      // Načítaj konfiguráciu
      const config = await ctx.db.query.ekasaConfig.findFirst({
        where: and(
          eq(ekasaConfig.practiceId, ctx.practiceId),
          isNull(ekasaConfig.deletedAt)
        ),
      });

      if (!config) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "e-Kasa nie je nakonfigurovaná. Prosím nastavte DIČ a ID pokladnice v Nastaveniach.",
        });
      }

      const result = await processEkasaReceipt(
        {
          practiceId: ctx.practiceId,
          invoiceId: input.invoiceId,
          amountBase: input.amountBase,
          amountVat: input.amountVat,
          amountTotal: input.amountTotal,
          vatRate: input.vatRate,
          paymentMethod: input.paymentMethod,
          items: input.items,
          issuedAt: input.issuedAt ? new Date(input.issuedAt) : new Date(),
        },
        {
          dic: config.dic as string,
          icDph: config.icDph as string | null,
          pokladnicaId: config.pokladnicaId as string,
          ekasaApiUrl: config.ekasaApiUrl as string,
          certBase64: config.certBase64 as string | null,
          offlineModeEnabled: config.offlineModeEnabled as boolean,
        }
      );

      return result;
    }),

  /** Zoznam dokladov s pagináciou */
  getReceipts: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(200).default(50),
          offset: z.number().default(0),
          status: z
            .enum([
              "PENDING",
              "SENT",
              "CONFIRMED",
              "FAILED",
              "OFFLINE_STORED",
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(ekasaReceipts.practiceId, ctx.practiceId),
        isNull(ekasaReceipts.deletedAt),
      ];

      if (input?.status) {
        conditions.push(eq(ekasaReceipts.status, input.status));
      }

      const rows = await ctx.db.query.ekasaReceipts.findMany({
        where: and(...conditions),
        orderBy: [desc(ekasaReceipts.issuedAt)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });

      return rows;
    }),

  /** Vráti surové HTML pre tlač dokladu na 80mm tlačiarni */
  printReceipt: protectedProcedure
    .input(z.object({ receiptId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const receipt = await ctx.db.query.ekasaReceipts.findFirst({
        where: and(
          eq(ekasaReceipts.id, input.receiptId),
          eq(ekasaReceipts.practiceId, ctx.practiceId),
          isNull(ekasaReceipts.deletedAt)
        ),
      });

      if (!receipt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Doklad nenájdený" });
      }

      const config = await ctx.db.query.ekasaConfig.findFirst({
        where: and(
          eq(ekasaConfig.practiceId, ctx.practiceId),
          isNull(ekasaConfig.deletedAt)
        ),
      });

      // Načítaj názov kliniky z tabuľky practices
      const [practice] = await ctx.db
        .select({ name: practices.name, address: practices.address, phone: practices.phone })
        .from(practices)
        .where(and(eq(practices.id, ctx.practiceId), isNull(practices.deletedAt)))
        .limit(1);

      const html = generateReceiptHtml(
        {
          receiptNumber: receipt.receiptNumber as string,
          uid: receipt.uid as string | null,
          okp: receipt.okp as string | null,
          pkp: receipt.pkp as string | null,
          amountBase: receipt.amountBase as string,
          amountVat: receipt.amountVat as string,
          amountTotal: receipt.amountTotal as string,
          vatRate: receipt.vatRate as string,
          paymentMethod: receipt.paymentMethod as string,
          status: receipt.status as string,
          issuedAt: receipt.issuedAt,
        },
        {
          clinicName: practice?.name ?? "Veterinárna ambulancia",
          address: practice?.address ?? null,
          phone: practice?.phone ?? null,
          dic: (config?.dic as string) ?? "—",
          icDph: config?.icDph as string | null,
          pokladnicaId: (config?.pokladnicaId as string) ?? "—",
        }
      );

      return { html, receiptNumber: receipt.receiptNumber };
    }),

  /** Ručný retry pre jeden doklad */
  retryReceipt: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(z.object({ receiptId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const receipt = await ctx.db.query.ekasaReceipts.findFirst({
        where: and(
          eq(ekasaReceipts.id, input.receiptId),
          eq(ekasaReceipts.practiceId, ctx.practiceId),
          isNull(ekasaReceipts.deletedAt)
        ),
      });

      if (!receipt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Doklad nenájdený" });
      }

      if (receipt.status === "CONFIRMED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Doklad je už potvrdený",
        });
      }

      const config = await ctx.db.query.ekasaConfig.findFirst({
        where: and(
          eq(ekasaConfig.practiceId, ctx.practiceId),
          isNull(ekasaConfig.deletedAt)
        ),
      });

      if (!config) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "e-Kasa nie je nakonfigurovaná",
        });
      }

      // Increment retry count
      const newRetryCount = (Number(receipt.retryCount ?? 0) + 1).toString();
      await ctx.db
        .update(ekasaReceipts)
        .set({ status: "PENDING", retryCount: newRetryCount, lastRetryAt: new Date() })
        .where(eq(ekasaReceipts.id, input.receiptId));

      // Re-send (non-blocking in mutation context)
      const { sendToEkasaApi } = await import("@/lib/ekasa/service");
      const apiResult = await sendToEkasaApi({
        apiUrl: config.ekasaApiUrl as string,
        receiptNumber: receipt.receiptNumber as string,
        dic: config.dic as string,
        pokladnicaId: config.pokladnicaId as string,
        amountTotal: receipt.amountTotal as string,
        amountVat: receipt.amountVat as string,
        paymentMethod: receipt.paymentMethod as string,
        okp: receipt.okp as string,
        pkp: receipt.pkp as string,
        issuedAt: receipt.issuedAt,
        items: [],
      });

      const newStatus = apiResult.success ? "CONFIRMED" : "FAILED";
      await ctx.db
        .update(ekasaReceipts)
        .set({ status: newStatus, uid: apiResult.uid ?? null, rawResponse: apiResult.rawResponse ?? null })
        .where(eq(ekasaReceipts.id, input.receiptId));

      return { status: newStatus, uid: apiResult.uid };
    }),
});
