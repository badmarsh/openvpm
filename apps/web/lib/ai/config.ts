import { envFlagEnabled } from "@/lib/env-bool";

export type AiProvider = "anthropic" | "google" | "openai";
export type AiConfiguration = {
  enabled: boolean;
  provider: AiProvider | null;
  model: string;
  apiKey: string;
  problems: string[];
};

/** Server-side only. Never serialize this object: it includes a credential. */
export function aiConfiguration(): AiConfiguration {
  const enabled = envFlagEnabled("AI_TEXT_ENABLED");
  const model = (process.env.AI_MODEL?.trim() || process.env.AGENT_MODEL?.trim() || "claude-sonnet-4-6");
  const provider = /^claude-[a-z0-9.-]+$/i.test(model) ? "anthropic"
    : /^gemini-[a-z0-9.-]+$/i.test(model) ? "google"
    : /^(gpt-[a-z0-9.-]+|o[134](?:-[a-z0-9.-]+)?)$/i.test(model) ? "openai" : null;
  const keyName = provider === "anthropic" ? "ANTHROPIC_API_KEY"
    : provider === "google" ? "GOOGLE_API_KEY" : "OPENAI_API_KEY";
  const apiKey = (process.env[keyName]?.trim() || (provider === "google" ? process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() : "") || "");
  const problems: string[] = [];
  if (!enabled) problems.push("AI_TEXT_ENABLED must be true to permit text generation.");
  if (!provider) problems.push("AI_MODEL must be a bare claude-*, gemini-*, gpt-* or supported o-series model ID.");
  if (provider && (!apiKey || /^(sk-\.\.\.|sk-ant-\.\.\.|AIza\.\.\.)$/.test(apiKey))) {
    problems.push(`Set ${keyName} in the server secret environment.`);
  }
  return { enabled, provider, model, apiKey, problems };
}

export function publicAiConfiguration() {
  const { enabled, provider, model, problems } = aiConfiguration();
  // A misconfigured model may itself contain a URL/credential. Do not echo it.
  return { enabled, provider, model: provider ? model : "unsupported", ready: problems.length === 0, problems };
}
