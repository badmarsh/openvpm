/**
 * TG-06: Automations
 * Tests that automations are STUB (in-memory only)
 */
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("TG-06: Automations", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-06-A: Toggle state does NOT persist after reload (STUB)", async ({ page }) => {
    await page.goto("/marketing/automations");
    await page.waitForTimeout(1000);

    // Find first toggle (ToggleLeft → ToggleRight icon or similar)
    const toggleBtn = page.locator("button[class*='text-muted'], button:has(svg)").first();
    if (await toggleBtn.count() === 0) test.skip();

    // Capture state before
    const textBefore = await page.locator("[class*='rounded-xl border']").first().textContent() ?? "";
    
    // Toggle
    await toggleBtn.click();
    await page.waitForTimeout(500);
    const textAfter = await page.locator("[class*='rounded-xl border']").first().textContent() ?? "";
    
    // Verify UI changed
    expect(textBefore).not.toBe(textAfter);

    // Reload
    await page.reload();
    await page.waitForTimeout(1000);
    const textAfterReload = await page.locator("[class*='rounded-xl border']").first().textContent() ?? "";

    if (textAfterReload === textBefore) {
      console.error("\u{1F534} TG-06-A STUB CONFIRMED: Toggle reset to original state after reload.");
      console.error("   Fix: Add automationRules DB table + tRPC CRUD procedures");
    }
  });

  test("TG-06-B: Test trigger makes no real SMS/Email API call (STUB)", async ({ page }) => {
    await page.goto("/marketing/automations");
    await page.waitForTimeout(1000);

    const realApiCalls: string[] = [];
    page.on("request", req => {
      const url = req.url();
      if (url.includes("sms") || url.includes("email") || url.includes("sendgrid") || 
          url.includes("twilio") || url.includes("ses") || url.includes("smtp")) {
        realApiCalls.push(url);
      }
    });

    const testBtn = page.locator("button").filter({ hasText: /test trigger|test/i }).first();
    if (await testBtn.count() === 0) test.skip();
    await testBtn.click();
    await page.waitForTimeout(2000);

    expect(realApiCalls.length).toBe(0);
    console.warn("\u{1F534} TG-06-B STUB CONFIRMED: No real SMS/Email API calls during test trigger");
  });
});
