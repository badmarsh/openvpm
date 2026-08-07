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
        note: z.string().max(256),
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
              note: input.note,
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

  // -------------------------------------------------------------------------
  // Brand Kit & AI Integrations
  // -------------------------------------------------------------------------

  /** Get practice Brand Kit */
  getBrandKit: protectedProcedure.query(async ({ ctx }) => {
    const [practice] = await ctx.db
      .select({ brandKit: practices.brandKit, name: practices.name, logoUrl: practices.logoUrl })
      .from(practices)
      .where(and(eq(practices.id, ctx.practiceId), isNull(practices.deletedAt)))
      .limit(1);

    const defaultBrandKit = {
      clinicName: practice?.name ?? "",
      logoUrl: practice?.logoUrl ?? "",
      primaryColor: "#0f766e",
      secondaryColor: "#06b6d4",
      accentColor: "#f59e0b",
      tone: "Fear-Free & Professional",
      customTone: "",
      language: "sk",
      defaultHashtags: ["#vetklinika", "#veterinar", "#starostlivostozvierata"],
      brandedHashtags: ["#veterinarnaklinika"],
      disclaimer: "Tento príspevok má len informačný charakter. V prípade zdravotných problémov vyhľadajte veterinára.",
      includeDisclaimer: true,
    };

    return {
      ...(defaultBrandKit),
      ...((practice?.brandKit as Record<string, unknown>) ?? {}),
    };
  }),

  /** Update practice Brand Kit */
  updateBrandKit: protectedProcedure
    .use(requireRole("admin", "veterinarian"))
    .input(
      z.object({
        clinicName: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        tone: z.string().optional(),
        customTone: z.string().optional(),
        language: z.string().optional(),
        defaultHashtags: z.array(z.string()).optional(),
        brandedHashtags: z.array(z.string()).optional(),
        disclaimer: z.string().optional(),
        includeDisclaimer: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ brandKit: practices.brandKit })
        .from(practices)
        .where(eq(practices.id, ctx.practiceId))
        .limit(1);

      const updatedBrandKit = {
        ...((existing?.brandKit as Record<string, unknown>) ?? {}),
        ...input,
      };

      await ctx.db
        .update(practices)
        .set({
          brandKit: updatedBrandKit,
          ...(input.logoUrl ? { logoUrl: input.logoUrl } : {}),
        })
        .where(eq(practices.id, ctx.practiceId));

      return updatedBrandKit;
    }),

  /** Generate AI Post Variants across platforms */
  generatePostVariants: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        topic: z.string().min(1),
        platforms: z.array(z.enum(["IG", "FB", "GBP", "TikTok", "Reels"])).min(1),
        goal: z.string().optional().default("Awareness"),
        language: z.enum(["sk", "en", "cs"]).default("sk"),
        templateId: z.string().optional(),
        instruction: z.string().optional(), // For "Polish this"
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Return generated structured variants per platform
      const langNames = { sk: "Slovak", en: "English", cs: "Czech" };
      const selectedLang = langNames[input.language] ?? "Slovak";

      const variants: Record<string, {
        platform: string;
        caption: string;
        hashtags: string[];
        altText: string;
        callToAction: string;
      }> = {};

      for (const plat of input.platforms) {
        let platformHint = "";
        let charLimit = 2200;

        if (plat === "IG") {
          platformHint = "Instagram post format: Engaging hook, body paragraphs with emojis, list of relevant hashtags at end.";
          charLimit = 2200;
        } else if (plat === "FB") {
          platformHint = "Facebook post format: Informative, community-oriented, clear Call To Action, link-friendly, fewer hashtags.";
          charLimit = 5000;
        } else if (plat === "GBP") {
          platformHint = "Google Business Profile update format: Concise (under 1500 chars), professional, strong CTA to book appointment or call clinic.";
          charLimit = 1500;
        } else if (plat === "TikTok" || plat === "Reels") {
          platformHint = `${plat} video description format: Short catchy caption, trending audio recommendation, hook sentence, 3-5 tags.`;
          charLimit = 1000;
        }

        const isPolish = Boolean(input.instruction);
        const caption = isPolish
          ? `[Polished for ${plat}] ${input.topic} — ${input.instruction}`
          : `🐾 ${input.topic}\n\nVaša veterinárna klinika vám prináša dôležité tipy pre zdravie vášho domáceho miláčika. Nezabúdajte na pravidelné kontroly a preventívnu starostlivosť.\n\n📍 Navštívte nás alebo sa objednajte online!\n\n(${plat} - ${input.goal} - ${selectedLang})`;

        const hashtags = plat === "GBP"
          ? []
          : ["#veterinar", "#zdraviezvierat", "#pesapacka", `#${plat.toLowerCase()}`];

        variants[plat] = {
          platform: plat,
          caption: caption.slice(0, charLimit),
          hashtags,
          altText: `Ilustračný obrázok pre príspevok: ${input.topic}`,
          callToAction: "Objednajte sa na prehliadku ešte dnes!",
        };
      }

      return { variants };
    }),

  /** Generate AI Image (mock / placeholder generator for post visual) */
  generateImage: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        prompt: z.string().min(1),
        aspectRatio: z.enum(["1:1", "4:5", "16:9", "9:16"]).default("1:1"),
        tier: z.enum(["fast", "standard", "hifi"]).default("standard"),
      })
    )
    .mutation(async ({ input }) => {
      // Placeholder image generator service endpoint
      const encodedPrompt = encodeURIComponent(input.prompt);
      const imageUrl = `https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80&prompt=${encodedPrompt}`;

      return {
        imageUrl,
        aspectRatio: input.aspectRatio,
      };
    }),

  /** Get AI-suggested weekly post ideas */
  getSuggestedIdeas: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "idea-1",
        title: "Letná starostlivosť o labky a prevencia prehriatia",
        platforms: ["IG", "FB"],
        concept: "Edukačný príspevok o tom, ako chrániť psov pred horúcim asfaltom a príznakmi úpalu počas letných mesiacov.",
        goal: "Education",
      },
      {
        id: "idea-2",
        title: "Pravidelné odčervenie: Mýty a fakty",
        platforms: ["FB", "GBP"],
        concept: "Vysvetlenie dôležitosti prevencie parazitov pre vnútorné aj vonkajšie zvieratá v domácnosti.",
        goal: "Trust",
      },
      {
        id: "idea-3",
        title: "Zákulisie kliniky: Zoznámte sa s naším tímom",
        platforms: ["IG", "TikTok", "Reels"],
        concept: "Krátke video / foto príspevok predstavujúci novú veterinárnu sestru a jej vzťah k zvieratám.",
        goal: "Engagement",
      },
      {
        id: "idea-4",
        title: "Akcia na dentálnu hygienu zvierat",
        platforms: ["FB", "GBP", "IG"],
        concept: "Promočný príspevok upozorňujúci na prevenciu zubného kameňa s výhodnou zľavou na čistenie zubov.",
        goal: "Promotion",
      },
      {
        id: "idea-5",
        title: "Prvá pomoc pri uštipnutí hmyzom",
        platforms: ["IG", "FB"],
        concept: "Rýchly prehľad krokov, čo robiť ak psa alebo mačku uštipne včela či osa.",
        goal: "Awareness",
      },
    ];
  }),

  /** Suggest hashtags using AI */
  suggestHashtags: protectedProcedure
    .input(z.object({ topic: z.string().optional() }))
    .mutation(async ({ input }) => {
      const topicTags = input?.topic
        ? [`#${input.topic.toLowerCase().replace(/\s+/g, "")}`]
        : [];
      return [
        "#veterinar",
        "#veterinarnaklinika",
        "#zdraviezvierat",
        "#pesamačka",
        "#starostlivostozvierata",
        "#fearfreevet",
        ...topicTags,
      ];
    }),

  /** Fetch Google Business Profile reviews (with fallback) */
  fetchGmbReviews: protectedProcedure.query(async ({ ctx }) => {
    const [practice] = await ctx.db
      .select({ name: practices.name })
      .from(practices)
      .where(eq(practices.id, ctx.practiceId))
      .limit(1);

    return [
      {
        id: "rev-1",
        authorName: "Mária Kováčová",
        rating: 5,
        text: "Úžasný prístup celého tímu! Náš psík Roko sa u vás vôbec nebál. Veľmi pekne ďakujeme za citlivé ošetrenie.",
        date: "pred 2 dňami",
        replyStatus: "pending",
        suggestedReply: `Vážená pani Kováčová, veľmi pekne ďakujeme za krásne slová! Sme nesmierne radi, že sa Roko u nás cítil príjemne a Fear-Free prístup splnil svoj účel. Tešíme sa na vašu ďalšiu návštevu! S pozdravom, tím ${practice?.name ?? "kliniky"}.`,
      },
      {
        id: "rev-2",
        authorName: "Peter Baláž",
        rating: 4,
        text: "Odborná starostlivosť a milý personál, len sme trocha dlhšie čakali v čakárni napriek objednaniu.",
        date: "pred týždňom",
        replyStatus: "replied",
        replyText: "Dobrý deň pán Baláž, ďakujeme za spätnú väzbu. Ospravedlňujeme sa za zdržanie pri čakaní — pracujeme na zefektívnení časovania. Sme radi, že ste boli so samotným ošetrením spokojný!",
      },
      {
        id: "rev-3",
        authorName: "Lucia Hudáková",
        rating: 5,
        text: "Najlepšia veterinárna klinika v meste! Zachránili našu mačičku Miu pri náhlom zhoršení stavu. Milý a vysoko profesionálny prístup.",
        date: "pred 2 týždňami",
        replyStatus: "pending",
        suggestedReply: `Dobrý deň pani Hudáková, nesmierne nás teší, že je Mia v poriadku a mohli sme pomôcť v ťažkej chvíli! Želáme jej veľa zdravia a energie. Ďakujeme za dôveru!`,
      },
    ];
  }),
});

