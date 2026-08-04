import { z } from "zod";
import { eq, and, isNull, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import DOMPurify from "isomorphic-dompurify";
import { createRouter, protectedProcedure, requireRole } from "../trpc";
import { canvasDocuments, canvasTemplates, practices } from "@openpims/db";
import { getLocaleData } from "@openpims/db/data";

// ---------------------------------------------------------------------------
// Server-side HTML sanitization — canvas_documents.content is rendered via
// dangerouslySetInnerHTML on the frontend, and RAG-source documents are fed
// directly into AI prompts, so unsanitized input is both a stored-XSS vector
// and a prompt-injection vector. Allowlist matches the editor's supported tags
// (headings, lists, tables, task lists, mermaid diagram blocks, basic links).
// ---------------------------------------------------------------------------
const CANVAS_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "u",
  "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "a", "br", "span", "hr",
  "svg", "path", "rect", "circle", "line", "polyline", "polygon", "g", "text", "tspan"
];
const CANVAS_ALLOWED_ATTR = [
  "class", "href", "target", "style", "border",
  "viewBox", "xmlns", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
  "width", "height", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "d", "points", "transform", "font-size", "text-anchor"
];

function sanitizeCanvasHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: CANVAS_ALLOWED_TAGS,
    ALLOWED_ATTR: CANVAS_ALLOWED_ATTR,
  });
}

// Master documents seeded from the OpenVPM Social Studio knowledge base
// are now locale-aware and loaded from packages/db/data/{sk,en}/index.ts.

export const canvasRouter = createRouter({
  /** List all documents for this practice */
  getDocuments: protectedProcedure
    .input(
      z.object({
        docType: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        isRagSource: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(canvasDocuments.practiceId, ctx.practiceId),
        isNull(canvasDocuments.deletedAt),
      ];
      if (input?.status) {
        conditions.push(eq(canvasDocuments.status, input.status));
      }
      if (input?.docType) {
        conditions.push(eq(canvasDocuments.docType, input.docType));
      }
      return ctx.db.query.canvasDocuments.findMany({
        where: and(...conditions),
        orderBy: [desc(canvasDocuments.updatedAt)],
      });
    }),

  /** Get a single document by ID */
  getDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, input.documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      return doc;
    }),

  /** Seed the master documents (idempotent, locale-aware) */
  seedMasterDocuments: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .mutation(async ({ ctx }) => {
      const existing = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (existing) return { seeded: false, message: "Documents already exist" };

      const [practice] = await ctx.db
        .select({ country: practices.country })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);
      const locale: "sk" | "en" = practice?.country === "SK" ? "sk" : "en";
      const { canvasMasterDocumentsData } = getLocaleData(locale);

      await ctx.db.insert(canvasDocuments).values(
        canvasMasterDocumentsData.map((d) => ({
          practiceId: ctx.practiceId,
          authorId: ctx.user.id,
          ...d,
        }))
      );
      return { seeded: true, count: canvasMasterDocumentsData.length };
    }),

  /** Create a new document */
  createDocument: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        title: z.string().min(1).max(512),
        docType: z.string(),
        content: z.string().default(""),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
        tags: z.array(z.string()).default([]),
        isRagSource: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .insert(canvasDocuments)
        .values({
          practiceId: ctx.practiceId,
          authorId: ctx.user.id,
          ...input,
          content: sanitizeCanvasHtml(input.content),
        })
        .returning();
      return doc;
    }),

  /** Update document content */
  updateDocument: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        documentId: z.string().uuid(),
        title: z.string().min(1).max(512).optional(),
        content: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        tags: z.array(z.string()).optional(),
        isRagSource: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentId, ...rest } = input;
      if (rest.content !== undefined) {
        rest.content = sanitizeCanvasHtml(rest.content);
      }
      const existing = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      const [updated] = await ctx.db
        .update(canvasDocuments)
        .set(rest)
        .where(eq(canvasDocuments.id, documentId))
        .returning();
      return updated;
    }),

  /** Soft-delete a document */
  deleteDocument: protectedProcedure
    .use(requireRole("admin"))
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, input.documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      await ctx.db
        .update(canvasDocuments)
        .set({ deletedAt: new Date() })
        .where(eq(canvasDocuments.id, input.documentId));
      return { deleted: true };
    }),

  /** List global canvas templates */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.canvasTemplates.findMany({
      where: isNull(canvasTemplates.deletedAt),
      orderBy: [canvasTemplates.category, canvasTemplates.title],
    });
  }),
});
