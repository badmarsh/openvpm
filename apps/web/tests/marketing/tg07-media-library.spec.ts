/**
 * TG-07: Media Library
 */
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("TG-07: Media Library", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-07-A: Images are from hardcoded Unsplash URLs (STUB)", async ({ page }) => {
    await page.goto("/marketing/media");
    await page.waitForTimeout(1500);

    const images = page.locator("img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    let unsplashCount = 0;
    let realStorageCount = 0;

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src") ?? "";
      if (src.includes("unsplash.com")) unsplashCount++;
      if (src.includes("storage") || src.includes("blob") || src.includes("supabase") || src.includes("cdn")) realStorageCount++;
    }

    console.log(`Media images: ${count} total, ${unsplashCount} Unsplash, ${realStorageCount} real storage`);

    if (unsplashCount > 0 && realStorageCount === 0) {
      console.error(`\u{1F534} TG-07-A STUB: All ${unsplashCount} images are hardcoded Unsplash URLs`);
      console.error("   Fix: Create mediaAssets DB table, add file upload endpoint, serve from storage");
    }
  });

  test("TG-07-B: Upload zone is not functional (MISSING)", async ({ page }) => {
    await page.goto("/marketing/media");
    await page.waitForTimeout(1000);

    const uploadZone = page.locator("[class*='border-dashed'], [class*='upload'], button").filter({ hasText: /nahraj|upload|drag/i }).first();
    if (await uploadZone.count() === 0) {
      console.warn("\u26AB TG-07-B MISSING: No upload zone found");
      return;
    }

    const realApiCalls: string[] = [];
    page.on("request", req => {
      if (req.method() === "PUT" || req.method() === "POST") realApiCalls.push(req.url());
    });

    await uploadZone.click();
    await page.waitForTimeout(1000);

    const toast = await page.locator("[class*=toast], [role=status]").first().textContent() ?? "";
    if (toast.toLowerCase().includes("soon") || toast.toLowerCase().includes("\u010doskoro")) {
      console.error("\u26AB TG-07-B MISSING: Upload zone shows 'coming soon' toast — not implemented");
    }
  });
});
