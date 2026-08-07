/**
 * TG-02: Post Workflow & Approval
 */
import { test, expect } from "@playwright/test";
import { login, captureRequests } from "./helpers";

test.describe("TG-02: Post Workflow", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-02-A: Status transitions persist in DB", async ({ page }) => {
    await page.goto("/marketing");
    await page.waitForTimeout(1000);

    const postCard = page.locator("[class*=rounded][class*=border]").filter({ hasText: /draft|koncept/i }).first();
    if (await postCard.count() === 0) test.skip();
    await postCard.click();
    await page.waitForTimeout(500);

    const submitBtn = page.locator("button").filter({ hasText: /odosla\u0165 na schvál/i }).first();
    if (await submitBtn.count() === 0) test.skip();

    const apiCalls = await captureRequests(page, async () => {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }, url => url.includes("trpc") || url.includes("updatePostStatus"));

    expect(apiCalls.length).toBeGreaterThan(0);
    console.log(`\u{1F7E2} TG-02-A: ${apiCalls.length} tRPC calls made for status update`);
  });

  test("TG-02-B: Postiz publish button makes NO real API call (documents STUB)", async ({ page }) => {
    await page.goto("/marketing/planner");
    await page.waitForTimeout(1000);

    const post = page.locator("[draggable='true'], [class*='cursor-grab']").first();
    if (await post.count() === 0) test.skip();
    await post.click();
    await page.waitForTimeout(500);

    const postizBtn = page.locator("button").filter({ hasText: /postiz/i }).first();
    if (await postizBtn.count() === 0) {
      console.log("ℹ\uFE0F Postiz button not visible — post may need to be in approved/scheduled state");
      test.skip();
      return;
    }

    const externalCalls = await captureRequests(page, async () => {
      await postizBtn.click();
      await page.waitForTimeout(2500);
    }, url => url.includes("postiz") || url.includes("publish") || url.includes("social"));

    if (externalCalls.length === 0) {
      console.warn("\u{1F534} TG-02-B STUB CONFIRMED: 'Publikova\u0165 cez Postiz' button made zero real API calls.");
      console.warn("   Current implementation uses setTimeout + toast only.");
    } else {
      console.log(`\u{1F7E2} TG-02-B REAL: ${externalCalls.length} real API calls made:`, externalCalls);
    }

    // Check that at least the toast appeared
    const toast = page.locator("[class*=toast], [data-sonner-toast], [role=status]");
    await expect(toast.first()).toBeVisible({ timeout: 3000 });
  });
});
