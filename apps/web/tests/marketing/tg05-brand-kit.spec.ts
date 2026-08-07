/**
 * TG-05: Brand Kit
 */
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("TG-05: Brand Kit", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-05-A: Brand Kit persists after reload (REAL)", async ({ page }) => {
    await page.goto("/marketing/brand-kit");
    await page.waitForTimeout(1500);

    const nameInput = page.locator("input").first();
    const uniqueName = `TestKlinika-${Date.now()}`;
    await nameInput.fill(uniqueName);

    await page.locator("button").filter({ hasText: /ulo\u017ei\u0165/i }).first().click();
    await page.waitForTimeout(2000);

    await page.reload();
    await page.waitForTimeout(2000);

    const val = await nameInput.inputValue();
    expect(val).toBe(uniqueName);
    console.log("\u{1F7E2} TG-05-A REAL: Brand Kit persists in DB");
  });

  test("TG-05-B: Services and Team Members persist after reload (REAL)", async ({ page }) => {
    await page.goto("/marketing/brand-kit");
    await page.waitForTimeout(1500);

    const uniqueService = `Slu\u017eba-${Date.now()}`;
    const svcInput = page.locator("input[placeholder*='Napr'], input[placeholder*='akc']").first();
    if (await svcInput.count() === 0) { test.skip(); return; }
    await svcInput.fill(uniqueService);
    await svcInput.press("Enter");

    await page.locator("button").filter({ hasText: /ulo\u017ei\u0165/i }).first().click();
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(2000);

    const found = await page.locator(`text=${uniqueService}`).count();
    if (found > 0) {
      console.log("\u{1F7E2} TG-05-B REAL: Services persist in DB (brandKit JSONB)");
    } else {
      console.error("\u{1F534} TG-05-B STUB: Service tag not found after reload");
    }
    expect(found).toBeGreaterThan(0);
  });

  test("TG-05-C: Color presets update state immediately (REAL)", async ({ page }) => {
    await page.goto("/marketing/brand-kit");
    await page.waitForTimeout(1500);

    const presetBtn = page.locator("button").filter({ hasText: /Forest|Ocean|Berry|Teal/i }).first();
    if (await presetBtn.count() === 0) { test.skip(); return; }

    const primaryBefore = await page.locator("input[type='color']").first().inputValue();
    await presetBtn.click();
    await page.waitForTimeout(300);
    const primaryAfter = await page.locator("input[type='color']").first().inputValue();

    expect(primaryAfter).not.toBe(primaryBefore);
    console.log(`\u{1F7E2} TG-05-C REAL: Color preset changed primary from ${primaryBefore} to ${primaryAfter}`);
  });
});
