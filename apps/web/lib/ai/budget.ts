import { TRPCError } from "@trpc/server";
import { rateLimit } from "@/lib/rate-limit";

/** Durable request-count ceilings, not currency caps. Shared by text workflows. */
export async function consumeAiTextBudget(practiceId: string, userId: string) {
  const actor = await rateLimit({ key: `ai-text:${practiceId}:${userId}`, limit: 10, windowMs: 60_000 });
  if (!actor.success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "AI per-user request limit reached. Try later." });
  const practice = await rateLimit({ key: `ai-text-day:${practiceId}`, limit: 100, windowMs: 86_400_000 });
  if (!practice.success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "AI practice daily request limit reached. Try later." });
}
