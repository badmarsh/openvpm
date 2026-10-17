import { afterEach, expect, it, vi } from "vitest";
import * as models from "@/app/api/ai-models/route";
import * as active from "@/app/api/ai-models/active/route";
import * as testRoute from "@/app/api/ai-models/test/route";
import { POST as anthropic } from "@/app/api/ai/anthropic/route";
import { POST as openai } from "@/app/api/ai/openai/route";
import { POST as google } from "@/app/api/ai/google/route";
import { POST as anthropicVision } from "@/app/api/ai/anthropic-vision/route";
import { POST as openaiVision } from "@/app/api/ai/openai-vision/route";
import { POST as googleVision } from "@/app/api/ai/google-vision/route";

afterEach(() => vi.unstubAllGlobals());
it.each([
  ...Object.entries(models), ...Object.entries(active), ...Object.entries(testRoute),
  ["anthropic", anthropic], ["openai", openai], ["google", google],
  ["anthropic-vision", anthropicVision], ["openai-vision", openaiVision], ["google-vision", googleVision],
])("retired %s never reads a database or forwards credentials", async (_name, handler) => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  const response = (handler as () => Response)();
  expect(response.status).toBe(410);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.text();
  expect(body).not.toContain("apiKey");
  expect(fetch).not.toHaveBeenCalled();
});
