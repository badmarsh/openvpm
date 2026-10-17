import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("current AI integration documentation", () => {
  it("describes actual entrypoints and explicitly unavailable capabilities", () => {
    const source = readFileSync("app/api-docs/ai/page.tsx", "utf8");
    for (const text of ["POST /api/ai/text", "POST /api/v1/soap-notes", "records:write", "ai.configuration", "AI_TEXT_ENABLED", "410 Gone", "not API-key REST endpoints", "webhooks.create"]) expect(source).toContain(text);
    expect(source).not.toContain("curl -X POST https://your-practice.openvpm.com/api/v1/agent");
    expect(source).not.toContain("allow_writes: true");
  });
  it("does not teach chart lookup through text chat", () => {
    const help = readFileSync("../../docs/help/ask-the-ai.md", "utf8");
    expect(help).toContain("does **not** read");
    expect(help).toContain("patient charts");
    expect(help).toContain("unsaved draft");
    expect(help).toContain("Only active admins and veterinarians");
    const onboarding = readFileSync("components/onboarding/steps/try-agent.tsx", "utf8");
    expect(onboarding).not.toContain("Which pets are overdue for vaccines?");
    expect(onboarding).toContain("AI_TEXT_ENABLED");
  });
});
