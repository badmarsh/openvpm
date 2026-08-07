/**
 * TG-04: GMB Reviews
 * Detects mock data and stub implementations
 */
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const KNOWN_MOCK_REVIEW_AUTHORS = [
  "Al\u017ebeta Kov\u00e1\u010dov\u00e1",
  "Martin Horv\u00e1th",
  "Katar\u00edna Blaho",
  "Peter \u0160im\u00e1k",
  "Jana Luk\u00e1\u010dov\u00e1",
];

const KNOWN_MOCK_REVIEW_TEXTS = [
  "Skvel\u00e1 klinika",
  "Ke\u010f n\u00e1\u0161 psík",
  "Dr.",
];

test.describe("TG-04: GMB Reviews", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-04-A: Detect if reviews are mock/hardcoded data", async ({ page }) => {
    let tRPCResponse = "";
    page.on("response", async (res) => {
      if (res.url().includes("fetchGmbReviews")) {
        try { tRPCResponse = await res.text(); } catch {}
      }
    });

    await page.goto("/marketing/reviews");
    await page.waitForTimeout(3000);

    const pageContent = await page.content();
    const mockAuthorsFound = KNOWN_MOCK_REVIEW_AUTHORS.filter(a => pageContent.includes(a));
    const mockTextFound = KNOWN_MOCK_REVIEW_TEXTS.filter(t => pageContent.includes(t));

    if (mockAuthorsFound.length > 0) {
      console.error(`\u{1F534} TG-04-A STUB: Found mock review author names: ${mockAuthorsFound.join(", ")}`);
    }

    if (tRPCResponse.includes("MOCK_REVIEWS") || tRPCResponse.includes("mock")) {
      console.error("\u{1F534} TG-04-A STUB: tRPC response contains 'mock' identifiers");
    }

    // The section should exist
    const reviewSection = page.locator("text=Recenzie, text=Google").first();
    await expect(reviewSection).toBeVisible({ timeout: 5000 });
  });

  test("TG-04-B: AI reply generator produces context-specific text", async ({ page }) => {
    await page.goto("/marketing/reviews");
    await page.waitForTimeout(1000);

    // Switch to generator mode
    const genTab = page.locator("button").filter({ hasText: /gener\u00e1tor|genero/i }).first();
    if (await genTab.count() > 0) await genTab.click();
    await page.waitForTimeout(500);

    const reviewInput = page.locator("textarea").first();
    const specificText = "Na\u0161a labrad\u00f3rka Bella m\u00e1 MVDr. Nov\u00e1k r\u00e1da, v\u017edy ju upokojuje";
    await reviewInput.fill(specificText);

    const generateBtn = page.locator("button").filter({ hasText: /generova\u0165/i }).first();
    if (await generateBtn.count() === 0) test.skip();
    await generateBtn.click();
    await page.waitForTimeout(5000);

    const generatedReply = await page.locator("[class*=italic], [class*=reply], blockquote, .muted").first().textContent() ?? "";

    console.log("Generated reply:", generatedReply.substring(0, 200));

    // Check if reply is context-specific (mentions Bella or MVDr. Novák)
    const isContextual = generatedReply.toLowerCase().includes("bella") || 
                        generatedReply.toLowerCase().includes("nov\u00e1k") ||
                        generatedReply.toLowerCase().includes("labrad");

    if (!isContextual) {
      console.warn("\u{1F7E1} TG-04-B PARTIAL: Generated reply is not context-specific (does not reference Bella or MVDr. Nov\u00e1k)");
    } else {
      console.log("\u{1F7E2} TG-04-B REAL: Reply is context-specific");
    }
  });

  test("TG-04-C: Sending reply makes NO real GMB API call (documents STUB)", async ({ page }) => {
    await page.goto("/marketing/reviews");
    await page.waitForTimeout(2000);

    const gmbApiCalls: string[] = [];
    page.on("request", req => {
      const url = req.url();
      if (url.includes("mybusinessaccountmanagement") || url.includes("googleapis.com/mybusiness") || url.includes("gmb")) {
        gmbApiCalls.push(url);
      }
    });

    const sendBtn = page.locator("button").filter({ hasText: /odosla\u0165 odpove\u010f/i }).first();
    if (await sendBtn.count() > 0) {
      await sendBtn.click();
      await page.waitForTimeout(2000);
    }

    expect(gmbApiCalls.length).toBe(0);
    console.warn("\u{1F534} TG-04-C STUB CONFIRMED: No Google My Business API calls (expected — OAuth not set up)");
    console.warn("   Fix: Implement OAuth token storage per-practice and call GMB Reply API");
  });
});
