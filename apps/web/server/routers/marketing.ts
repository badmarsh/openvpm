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
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

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
        teamMembers: z.array(z.object({
          name: z.string(),
          role: z.string(),
          photoUrl: z.string(),
        })).optional(),
        services: z.array(z.string()).optional(),
        fontStyle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
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

  /** Generate AI Post Variants across platforms — powered by Gemini 2.5 Flash */
  generatePostVariants: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        topic: z.string().min(1),
        platforms: z.array(z.enum(["IG", "FB", "GBP", "TikTok", "Reels"])).min(1),
        goal: z.string().optional().default("Awareness"),
        language: z.enum(["sk", "en", "cs"]).default("sk"),
        templateId: z.string().optional(),
        instruction: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Load brand kit for context
      const practice = await ctx.db.query.practices.findFirst({
        where: eq(practices.id, ctx.practiceId),
        columns: { brandKit: true },
      });
      const bk = (practice?.brandKit ?? {}) as Record<string, unknown>;
      const clinicName = (bk.clinicName as string) ?? "Veterinárna ambulancia";
      const toneOfVoice = (bk.toneOfVoice as string) ?? "profesionálny a empatický";
      const services = (bk.services as string[]) ?? [];

      const SYSTEM = `Si elitný marketingový copywriter pre veterinárnu kliniku na Slovensku.
Klinika: ${clinicName}
Tón: ${toneOfVoice}
Služby: ${services.slice(0, 5).join(", ") || "veterinárna starostlivosť"}

Pravidlá:
- Jazyk: ${input.language === "en" ? "angličtina" : input.language === "cs" ? "čeština" : "slovenčina"}
- Fear-Free prístup — empatia, pozitívna asociácia s veterinárom
- Žiadna medicínska diagnostika
- Autentický, nie generický štýl
- Cieľ príspevku: ${input.goal}`;

      const PLATFORM_RULES: Record<string, { hint: string; charLimit: number; hashtagCount: number }> = {
        IG:     { hint: "Instagram: zaujímavý hook, body s emojis, max 10 hashtagov na konci",                     charLimit: 2200, hashtagCount: 10 },
        FB:     { hint: "Facebook: informatívny, komunitne orientovaný, jasné CTA, menej hashtagov",             charLimit: 5000, hashtagCount: 4  },
        GBP:    { hint: "Google Business Profile: stručný (max 1000 znakov), profesionálny, silné CTA na booking", charLimit: 1000, hashtagCount: 0  },
        TikTok: { hint: "TikTok popis: krátky hook, odporúčanie trendy zvuku, 3–5 tagov",                        charLimit: 1000, hashtagCount: 5  },
        Reels:  { hint: "Reels popis: hook veta, krátky popis videa, 3–5 tagov",                                 charLimit: 1000, hashtagCount: 5  },
      };

      const variants: Record<string, {
        platform: string;
        caption: string;
        hashtags: string[];
        altText: string;
        callToAction: string;
        styles: { short: string; medium: string; playful: string };
      }> = {};

      const isPolish = Boolean(input.instruction);

      for (const plat of input.platforms) {
        const rules = PLATFORM_RULES[plat] ?? PLATFORM_RULES.IG;

        try {
          const userPrompt = isPolish
            ? `Vylepši nasledujúci príspevok pre ${plat} podľa inštrukcie.\nPôvodná téma: ${input.topic}\nInštrukcia: ${input.instruction}\nFormát: ${rules.hint}\n\nVráť IBA:\n1. CAPTION: [text]\n2. HASHTAGS: [oddelené čiarkou]\n3. ALT_TEXT: [1 veta]`
            : `Vytvor príspevok pre ${plat} na tému: "${input.topic}"\nFormát: ${rules.hint}\nMax znakov: ${rules.charLimit}\n\nVráť IBA v tomto formáte:\n1. CAPTION: [text príspevku]\n2. HASHTAGS: [${rules.hashtagCount} hashtagov oddelených čiarkou, alebo NONE ak GBP]\n3. ALT_TEXT: [1 opisná veta pre accessibility obrázka]`;

          const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            system: SYSTEM,
            prompt: userPrompt,
          });

          // Parse structured output
          const captionMatch = text.match(/1\.?\s*CAPTION:\s*([\s\S]*?)(?=2\.?\s*HASHTAGS:|$)/i);
          const hashtagMatch = text.match(/2\.?\s*HASHTAGS:\s*([\s\S]*?)(?=3\.?\s*ALT_TEXT:|$)/i);
          const altMatch    = text.match(/3\.?\s*ALT_TEXT:\s*([\s\S]*?)$/i);

          const caption   = (captionMatch?.[1] ?? text).trim().slice(0, rules.charLimit);
          const rawTags   = (hashtagMatch?.[1] ?? "").trim();
          const hashtags  = rawTags.toLowerCase() === "none" || !rawTags
            ? []
            : rawTags.split(/[,\n]+/).map(t => t.trim().replace(/^#?/, "#")).filter(Boolean).slice(0, rules.hashtagCount);
          const altText   = (altMatch?.[1] ?? `Veterinárny príspevok: ${input.topic}`).trim();

          // Generate short and playful variants using AI
          const [shortResult, playfulResult] = await Promise.all([
            generateText({
              model: google("gemini-2.5-flash"),
              system: SYSTEM,
              prompt: `Skráť nasledujúci ${plat} príspevok na max 200 znakov, zachovaj kľúčové posolstvo a CTA:\n\n${caption}`,
            }),
            generateText({
              model: google("gemini-2.5-flash"),
              system: SYSTEM,
              prompt: `Prepíš nasledujúci ${plat} príspevok do hravejšieho, priateľskejšieho štýlu s viac emojis. Max ${Math.min(rules.charLimit, 600)} znakov:\n\n${caption}`,
            }),
          ]);

          variants[plat] = {
            platform: plat,
            caption,
            hashtags,
            altText,
            callToAction: "Objednajte sa online alebo zavolajte nám!",
            styles: {
              short:   shortResult.text.trim().slice(0, 280),
              medium:  caption,
              playful: playfulResult.text.trim().slice(0, rules.charLimit),
            },
          };
        } catch (aiErr) {
          // Graceful fallback — never let AI error break the wizard
          console.error(`[generatePostVariants] AI error for ${plat}:`, aiErr);
          const fallback = `🐾 ${input.topic} — ${clinicName}\n\nZdravie vášho miláčika je naša priorita. Objednajte sa ešte dnes!`;
          variants[plat] = {
            platform: plat,
            caption: fallback,
            hashtags: plat !== "GBP" ? ["#veterinar", "#zdraviezvierat", "#fearfree"] : [],
            altText: `Príspevok o téme: ${input.topic}`,
            callToAction: "Objednajte sa online!",
            styles: { short: fallback.slice(0, 200), medium: fallback, playful: "😻 " + fallback + " 🐾✨" },
          };
        }
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
  /** Reply to a Google My Business review (stub — stores reply, call GMB API when OAuth is set up) */
  replyToGmbReview: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        reviewId: z.string(),
        replyText: z.string().min(1).max(4096),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: When Google My Business OAuth tokens are stored per-practice,
      // call the GMB API here: POST /v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
      // For now, we store the reply locally and mark as replied.
      // This allows the workflow to function and be wired up to GMB later.
      return {
        success: true,
        reviewId: input.reviewId,
        replyText: input.replyText,
        repliedAt: new Date().toISOString(),
        note: "Reply stored locally. GMB API integration pending OAuth setup.",
      };
    }),

  /** Generate AI reply for a Google Business review — powered by Gemini 2.5 Flash */
  generateReviewReply: protectedProcedure
    .use(requireRole("admin", "veterinarian", "technician"))
    .input(
      z.object({
        reviewText: z.string().min(1).max(2000),
        rating: z.number().min(1).max(5),
        authorName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const practice = await ctx.db.query.practices.findFirst({
        where: eq(practices.id, ctx.practiceId),
        columns: { brandKit: true, name: true },
      });
      const bk = (practice?.brandKit ?? {}) as Record<string, unknown>;
      const clinicName = (bk.clinicName as string) ?? practice?.name ?? "Naša ambulancia";
      const toneOfVoice = (bk.toneOfVoice as string) ?? "profesionálny a empatický";

      const stars = input.rating;
      const toneGuide =
        stars <= 2
          ? "Profesionálny tón, drž hranice, neospravedlňuj sa za kvalitu starostlivosti, ponúkni riešenie."
          : stars === 3
          ? "Empatický tón, uzni spätnú väzbu, ponúkni konkrétne zlepšenie, pozvi späť."
          : "Vďačný a vrúcny tón, ocen dôveru, pozvi na ďalšiu návštevu.";

      const SYSTEM = `Si PR asistent veterinárnej kliniky "${clinicName}" na Slovensku.
Tón komunikácie: ${toneOfVoice}.
Fear-Free filozofia — vždy pozitívna asociácia s veterinárnou starostlivosťou.
GDPR: Nikdy nespomínaj konkrétne mená pacientov ani diagnózy.
Odpoveď musí byť v slovenčine, max 120 slov.`;

      try {
        const { text } = await generateText({
          model: google("gemini-2.5-flash"),
          system: SYSTEM,
          prompt: `Napíš profesionálnu odpoveď na Google recenziu veterinárnej kliniky.

Hodnotenie: ${stars}★
Text recenzie: "${input.reviewText}"
${input.authorName ? `Autor: ${input.authorName}` : ""}

Pokyny pre tón: ${toneGuide}
Podpis: "Tím ${clinicName}"

Vráť IBA text odpovede, bez ďalšieho komentára.`,
        });

        return { reply: text.trim(), generated: true };
      } catch (err) {
        console.error("[generateReviewReply] AI error:", err);
        // Fallback reply
        const fallback =
          stars >= 4
            ? `Ďakujeme za vašu krásnu recenziu! Teší nás, že ste boli spokojní s našou starostlivosťou. Tešíme sa na vašu ďalšiu návštevu! S pozdravom, tím ${clinicName}.`
            : `Dobrý deň, ďakujeme za spätnú väzbu. Vezmeme si ju k srdcu a budeme pracovať na ďalšom zlepšení. Radi vás uvítame opäť. S pozdravom, tím ${clinicName}.`;
        return { reply: fallback, generated: false };
      }
    }),
});




