import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(async () => ({ text: "Synthetic draft", usage: { totalTokens: 12 } })),
  configuredAiModel: vi.fn(() => "synthetic-model"),
  publicAiConfiguration: vi.fn(() => ({ ready: true, model: "synthetic-model" })),
  consumeAiTextBudget: vi.fn(async () => undefined),
  recordUsage: vi.fn(async () => undefined),
  recordAuditLog: vi.fn(async () => undefined),
}));
vi.mock("ai", () => ({ generateText: mocks.generateText }));
vi.mock("@/lib/ai/model", () => ({ configuredAiModel: mocks.configuredAiModel }));
vi.mock("@/lib/ai/config", () => ({ publicAiConfiguration: mocks.publicAiConfiguration }));
vi.mock("@/lib/ai/budget", () => ({ consumeAiTextBudget: mocks.consumeAiTextBudget }));
vi.mock("@/lib/billing/usage", () => ({ recordUsage: mocks.recordUsage }));
vi.mock("@/lib/audit", () => ({ recordAuditLog: mocks.recordAuditLog }));
const { aiRouter } = await import("../routers/ai");
const { TRPCError } = await import("@trpc/server");
function caller(role: string | null = "veterinarian") {
  const db: Record<string, unknown> = { execute: vi.fn(async () => undefined) };
  db.transaction = async (fn: (tx: unknown) => unknown) => fn(db);
  return aiRouter.createCaller({ db, session: role ? { user: { id: "actor", practiceId: "practice", role } } : null } as never);
}
beforeEach(() => { vi.stubEnv("HOSTED_BILLING_ENABLED", ""); });
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); mocks.publicAiConfiguration.mockReturnValue({ ready: true, model: "synthetic-model" }); });
describe("text drafts authorization and governance", () => {
  it.each([null, "viewer", "front_desk", "technician"])("denies %s before generation", async (role) => {
    await expect(caller(role).generalText({ prompt: "Synthetic" })).rejects.toMatchObject({ code: role ? "FORBIDDEN" : "UNAUTHORIZED" });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
  it("fails closed when disabled or missing configuration", async () => {
    mocks.publicAiConfiguration.mockReturnValue({ ready: false, model: "synthetic-model" });
    await expect(caller().generalText({ prompt: "Synthetic" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
  it.each([{ prompt: " " }, { prompt: "x".repeat(8001) }, { prompt: "x", endpoint: "https://unapproved.invalid" }, { prompt: "x", apiKey: "synthetic" }, { prompt: "x", maxTokens: 2049 }, { prompt: "x", temperature: 0.8 }])("rejects invalid input without a provider call", async (input) => {
    await expect(caller().generalText(input as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
  it("checks budget before provider and records successful usage", async () => {
    expect(await caller().generalText({ prompt: "  Synthetic draft  ", temperature: 0 })).toMatchObject({ text: "Synthetic draft", tokensUsed: 12 });
    expect(mocks.consumeAiTextBudget).toHaveBeenCalledWith("practice", "actor");
    expect(mocks.generateText).toHaveBeenCalledWith(expect.objectContaining({ prompt: "Synthetic draft", temperature: 0, maxOutputTokens: 1024, maxRetries: 0 }));
    expect(mocks.recordUsage).toHaveBeenCalledWith({ practiceId: "practice", kind: "ai_run" });
  });
  it("does not call provider when rate budget is unavailable", async () => {
    mocks.consumeAiTextBudget.mockRejectedValueOnce(new TRPCError({ code: "TOO_MANY_REQUESTS" }));
    await expect(caller().generalText({ prompt: "x" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
  it("sanitizes provider failures and does not meter failed output", async () => {
    mocks.generateText.mockRejectedValueOnce(new Error("secret-provider-body"));
    await expect(caller().generalText({ prompt: "x" })).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", message: "AI provider unavailable. Continue without AI and try later." });
    expect(mocks.recordUsage).not.toHaveBeenCalled();
  });
});
