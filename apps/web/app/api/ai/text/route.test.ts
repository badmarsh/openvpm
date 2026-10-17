import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  context: vi.fn(async () => ({ session: { user: { id: "synthetic-user" } } })),
  generalText: vi.fn(async () => ({ text: "Synthetic draft", model: "synthetic", tokensUsed: 1 })),
}));
vi.mock("@/server/trpc", () => ({ createTRPCContext: mocks.context }));
vi.mock("@/server/routers/ai", () => ({ aiRouter: { createCaller: () => ({ generalText: mocks.generalText }) } }));
const { POST } = await import("./route");
afterEach(() => vi.clearAllMocks());
function request(body: string, type = "application/json") {
  return new Request("https://pilot.invalid/api/ai/text", { method: "POST", headers: { "content-type": type }, body });
}
it("denies anonymous requests before parsing/generation", async () => {
  mocks.context.mockResolvedValueOnce({ session: null } as never);
  expect((await POST(request("{broken"))).status).toBe(401);
  expect(mocks.generalText).not.toHaveBeenCalled();
});
it.each([["{broken", "application/json", 400], ["x", "text/plain", 415], [JSON.stringify({ prompt: "x".repeat(33000) }), "application/json", 413]])("rejects malformed, form or oversized input", async (body, type, status) => {
  expect((await POST(request(String(body), String(type)))).status).toBe(status);
  expect(mocks.generalText).not.toHaveBeenCalled();
});
it("returns an uncached text draft", async () => {
  const response = await POST(request(JSON.stringify({ prompt: "Synthetic" })));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toMatchObject({ text: "Synthetic draft" });
});
it("does not expose unexpected infrastructure exceptions", async () => {
  mocks.context.mockRejectedValueOnce(new Error("synthetic-secret-connection-string"));
  const response = await POST(request("{}"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("synthetic-secret");
});
