import { afterEach, describe, expect, it, vi } from "vitest";
import { aiConfiguration, publicAiConfiguration } from "../config";

afterEach(() => vi.unstubAllEnvs());
function clean() {
  for (const name of ["AI_TEXT_ENABLED", "AI_MODEL", "AGENT_MODEL", "ANTHROPIC_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "OPENAI_API_KEY"]) vi.stubEnv(name, "");
}
describe("server AI configuration", () => {
  it("is disabled by default, even with a key", () => {
    clean(); vi.stubEnv("ANTHROPIC_API_KEY", "synthetic-key");
    expect(publicAiConfiguration().ready).toBe(false);
    expect(publicAiConfiguration().enabled).toBe(false);
  });
  it.each([
    ["claude-sonnet-4-6", "ANTHROPIC_API_KEY", "anthropic"],
    ["gemini-2.5-flash", "GOOGLE_API_KEY", "google"],
    ["gpt-4o", "OPENAI_API_KEY", "openai"],
    ["o3-mini", "OPENAI_API_KEY", "openai"],
  ])("selects %s with only its matching key", (model, key, provider) => {
    clean(); vi.stubEnv("AI_TEXT_ENABLED", "true"); vi.stubEnv("AI_MODEL", model); vi.stubEnv(key, "synthetic-private-key");
    expect(publicAiConfiguration()).toMatchObject({ ready: true, provider, model });
    expect(JSON.stringify(publicAiConfiguration())).not.toContain("synthetic-private-key");
    expect(publicAiConfiguration()).not.toHaveProperty("apiKey");
  });
  it("supports blank AI_MODEL and legacy Google fallback", () => {
    clean(); vi.stubEnv("AI_TEXT_ENABLED", "true"); vi.stubEnv("AI_MODEL", "  "); vi.stubEnv("AGENT_MODEL", " gemini-2.5-flash "); vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "legacy-synthetic");
    expect(aiConfiguration()).toMatchObject({ model: "gemini-2.5-flash", apiKey: "legacy-synthetic", problems: [] });
  });
  it.each(["https://unapproved.invalid", "google/gemini-2.5-flash", "gemini-x?key=secret", "unknown-model"])("rejects model/URL %s", (model) => {
    clean(); vi.stubEnv("AI_TEXT_ENABLED", "true"); vi.stubEnv("AI_MODEL", model); vi.stubEnv("ANTHROPIC_API_KEY", "synthetic");
    expect(publicAiConfiguration().ready).toBe(false);
    expect(publicAiConfiguration().model).toBe("unsupported");
    expect(JSON.stringify(publicAiConfiguration())).not.toContain(model);
  });
  it("does not accept another provider's key or example credentials", () => {
    clean(); vi.stubEnv("AI_TEXT_ENABLED", "true"); vi.stubEnv("AI_MODEL", "gemini-2.5-flash"); vi.stubEnv("ANTHROPIC_API_KEY", "synthetic");
    expect(publicAiConfiguration().ready).toBe(false);
    vi.stubEnv("GOOGLE_API_KEY", "AIza...");
    expect(publicAiConfiguration().ready).toBe(false);
  });
});
