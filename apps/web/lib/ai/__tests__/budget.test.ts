import { afterEach, expect, it, vi } from "vitest";
const rateLimit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/rate-limit", () => ({ rateLimit }));
const { consumeAiTextBudget } = await import("../budget");
afterEach(() => vi.resetAllMocks());
it("uses tenant/actor minute and tenant daily durable ceilings", async () => {
  rateLimit.mockResolvedValue({ success: true });
  await consumeAiTextBudget("practice-A", "actor-A");
  expect(rateLimit.mock.calls.map(([input]) => input)).toEqual([
    { key: "ai-text:practice-A:actor-A", limit: 10, windowMs: 60_000 },
    { key: "ai-text-day:practice-A", limit: 100, windowMs: 86_400_000 },
  ]);
});
it("denies exhausted actor budget without touching daily budget", async () => {
  rateLimit.mockResolvedValue({ success: false });
  await expect(consumeAiTextBudget("A", "B")).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  expect(rateLimit).toHaveBeenCalledTimes(1);
});
it("denies exhausted practice budget", async () => {
  rateLimit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
  await expect(consumeAiTextBudget("A", "B")).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
});
it("fails closed on database failure", async () => {
  rateLimit.mockRejectedValue(new Error("Synthetic database unavailable"));
  await expect(consumeAiTextBudget("A", "B")).rejects.toThrow();
});
