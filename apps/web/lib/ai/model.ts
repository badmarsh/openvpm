import type { LanguageModel } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { aiConfiguration } from "./config";

export class AiConfigurationError extends Error {
  constructor() {
    super("AI text generation is disabled or not configured. See AI Settings.");
    this.name = "AiConfigurationError";
  }
}

/** No caller-provided keys, URLs, tools, or model IDs. Fixed provider endpoints. */
export function configuredAiModel(): LanguageModel {
  const config = aiConfiguration();
  if (config.problems.length || !config.provider) throw new AiConfigurationError();
  if (config.provider === "anthropic") return createAnthropic({ apiKey: config.apiKey, baseURL: "https://api.anthropic.com/v1" })(config.model);
  if (config.provider === "google") return createGoogleGenerativeAI({ apiKey: config.apiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta" })(config.model);
  return createOpenAI({ apiKey: config.apiKey, baseURL: "https://api.openai.com/v1" })(config.model);
}
