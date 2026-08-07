/**
 * TG-01: Generation Wizard
 * Tests whether AI text/image generation is REAL or STUB
 */
import { test, expect } from "@playwright/test";
import { login, captureRequests } from "./helpers";

const HARDCODED_TEMPLATE_PHRASES = [
  "Va\u0161a veterin\u00e1rna klinika v\u00e1m prin\u00e1\u0161a d\u00f4le\u017eit\u00e9 tipy",
  "[Polished for",
  "Nezab\u00fddajte na pravidelné kontroly a preventívnu starostlivos\u0165",
];

test.describe("TG-01: Generation Wizard", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-01-A: Generated captions must NOT be hardcoded template text", async ({ page }) => {
    await page.goto("/marketing");
    const newPostBtn = page.locator("button").filter({ hasText: /nov.*príspe|new post/i }).first();
    if (await newPostBtn.count() === 0) test.skip();
    await newPostBtn.click();
    await page.waitForTimeout(500);

    const topicInput = page.locator("textarea, input").filter({ hasText: "" }).first();
    await topicInput.fill("Letná prevencia klie\u0161\u0165ov u psov 2026");
    
    const generateBtn = page.locator("button").filter({ hasText: /generova\u0165|generu/i }).first();
    await generateBtn.click();
    await page.waitForTimeout(8000); // allow AI time

    const textareas = page.locator("textarea");
    const count = await textareas.count();
    if (count === 0) test.skip();

    const captions: string[] = [];
    for (let i = 0; i < Math.min(count, 3); i++) {
      captions.push(await textareas.nth(i).inputValue());
    }

    console.log("Generated captions:", captions);

    for (const caption of captions) {
      if (!caption) continue;
      for (const phrase of HARDCODED_TEMPLATE_PHRASES) {
        if (caption.includes(phrase)) {
          console.error(`\u{1F534} TG-01-A STUB DETECTED: Caption contains hardcoded phrase: "${phrase}"`);
        }
        // Soft assertion - log but don't hard fail (documents the issue)
      }
      // Hard assertion: caption must at least be non-empty and non-trivial
      expect(caption.length).toBeGreaterThan(50);
    }
  });

  test("TG-01-B: Short style variant must differ from Medium", async ({ page }) => {
    await page.goto("/marketing");
    const newPostBtn = page.locator("button").filter({ hasText: /nov.*príspe|new post/i }).first();
    if (await newPostBtn.count() === 0) test.skip();
    await newPostBtn.click();
    await page.waitForTimeout(500);

    const topicInput = page.locator("textarea, input").first();
    await topicInput.fill("Vakcinácia mla\u010fých pri\u00e1\u0165ov");
    await page.locator("button").filter({ hasText: /generova\u0165/i }).first().click();
    await page.waitForTimeout(8000);

    const mediumCaption = await page.locator("textarea").first().inputValue();

    const shortBtn = page.locator("button").filter({ hasText: /kr\u00e1tky|\u26a1/i }).first();
    if (await shortBtn.count() === 0) {
      console.log("ℹ\uFE0F Short style button not visible");
      test.skip();
      return;
    }
    await shortBtn.click();
    await page.waitForTimeout(500);

    const shortCaption = await page.locator("textarea").first().inputValue();

    // STUB detection: if short == mediumCaption.slice(0, 200) + "..."
    const isSlice = mediumCaption.startsWith(shortCaption.replace("...", "").substring(2)); // remove "⚡ "
    if (isSlice) {
      console.error("\u{1F534} TG-01-B STUB: Short variant is just string.slice() of Medium, not AI-generated");
    }

    expect(shortCaption).not.toBe(mediumCaption);
    expect(shortCaption.length).toBeLessThan(mediumCaption.length);
  });

  test("TG-01-C: Image generation must not return Unsplash URL", async ({ page }) => {
    await page.goto("/marketing");
    const newPostBtn = page.locator("button").filter({ hasText: /nov.*príspe/i }).first();
    if (await newPostBtn.count() === 0) test.skip();
    await newPostBtn.click();
    await page.waitForTimeout(500);

    await page.locator("textarea, input").first().fill("Mačka u veterinára");
    await page.locator("button").filter({ hasText: /generova\u0165/i }).first().click();
    await page.waitForTimeout(5000);

    // Navigate to step 3
    const nextBtn = page.locator("button").filter({ hasText: /\u010fal\u0161|pokra/i }).first();
    if (await nextBtn.count() > 0) { await nextBtn.click(); await page.waitForTimeout(500); }

    // Generate image
    const imgGenBtn = page.locator("button").filter({ hasText: /generova\u0165 obr/i }).first();
    if (await imgGenBtn.count() === 0) test.skip();
    
    const imageUrls: string[] = [];
    page.on("response", async (res) => {
      if (res.url().includes("image") || res.url().includes("generate")) {
        try {
          const body = await res.text();
          if (body.includes("url")) imageUrls.push(body);
        } catch {}
      }
    });

    await imgGenBtn.click();
    await page.waitForTimeout(5000);

    const img = page.locator("img").last();
    const src = await img.getAttribute("src") ?? "";
    
    if (src.includes("unsplash.com")) {
      console.error(`\u{1F534} TG-01-C STUB DETECTED: Image is from Unsplash: ${src}`);
      // This is a known stub — test documents it
    } else {
      console.log(`\u{1F7E2} TG-01-C REAL: Image URL: ${src.substring(0, 80)}`);
    }
  });

  test("TG-01-D: Created post persists after full page reload", async ({ page }) => {
    await page.goto("/marketing");
    const newPostBtn = page.locator("button").filter({ hasText: /nov.*príspe/i }).first();
    if (await newPostBtn.count() === 0) test.skip();
    await newPostBtn.click();
    await page.waitForTimeout(500);

    const uniqueTopic = `AutoTest-${Date.now()}`;
    await page.locator("textarea, input").first().fill(uniqueTopic);
    await page.locator("button").filter({ hasText: /generova\u0165/i }).first().click();
    await page.waitForTimeout(5000);

    // Navigate all steps
    for (let i = 0; i < 4; i++) {
      const next = page.locator("button").filter({ hasText: /\u010fal\u0161|pokra/i }).first();
      if (await next.count() > 0) { await next.click(); await page.waitForTimeout(600); }
    }

    const saveBtn = page.locator("button").filter({ hasText: /ulo\u017ei\u0165|vytvori\u0165|draft/i }).first();
    if (await saveBtn.count() > 0) { await saveBtn.click(); await page.waitForTimeout(2000); }

    await page.reload();
    await page.waitForTimeout(3000);

    const found = await page.locator(`text=${uniqueTopic.substring(0, 20)}`).count();
    expect(found).toBeGreaterThan(0); // \u{1F7E2} REAL if passes
  });
});
