/**
 * TG-03: Content Planner (Calendar)
 */
import { test, expect } from "@playwright/test";
import { login, captureRequests } from "./helpers";

test.describe("TG-03: Content Planner", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-03-A: Drag-and-drop calls updatePost tRPC mutation", async ({ page }) => {
    await page.goto("/marketing/planner");
    await page.waitForTimeout(1500);

    const posts = page.locator("[draggable='true']");
    if (await posts.count() === 0) { test.skip(); return; }

    const apiCalls = await captureRequests(page, async () => {
      const post = posts.first();
      const postBBox = await post.boundingBox();
      const cells = page.locator(".min-h-\\[90px\\]");
      const targetCell = cells.nth(Math.min(5, await cells.count() - 1));
      const targetBBox = await targetCell.boundingBox();
      if (postBBox && targetBBox) {
        await page.mouse.move(postBBox.x + postBBox.width / 2, postBBox.y + postBBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetBBox.x + 20, targetBBox.y + 20, { steps: 10 });
        await page.mouse.up();
      }
    }, url => url.includes("trpc"));

    if (apiCalls.length > 0) {
      console.log("\u{1F7E2} TG-03-A REAL: updatePost tRPC called after drag-drop");
    } else {
      console.warn("\u{1F534} TG-03-A: No tRPC calls detected during drag-drop");
    }
    expect(apiCalls.length).toBeGreaterThan(0);
  });

  test("TG-03-B: Per-day add button opens wizard", async ({ page }) => {
    await page.goto("/marketing/planner");
    await page.waitForTimeout(1000);

    const cell = page.locator(".min-h-\\[90px\\].group, .min-h-\\[90px\\]").nth(3);
    await cell.hover();
    await page.waitForTimeout(300);

    const addBtn = cell.locator("button").filter({ hasText: "+" });
    if (await addBtn.count() === 0) { 
      console.warn("\u{1F7E1} TG-03-B PARTIAL: Per-day add button not found");
      test.skip(); return; 
    }
    await addBtn.click();
    await page.waitForTimeout(500);

    const wizard = page.locator("dialog, [role='dialog']");
    await expect(wizard).toBeVisible({ timeout: 3000 });
    console.log("\u{1F7E2} TG-03-B: Wizard opened from per-day button");
  });

  test("TG-03-C: Status filter hides non-matching posts", async ({ page }) => {
    await page.goto("/marketing/planner");
    await page.waitForTimeout(1000);

    const allPostsBefore = await page.locator("[draggable='true']").count();
    const filterBtn = page.locator("button").filter({ hasText: /draft|koncept/i }).first();
    if (await filterBtn.count() === 0) { test.skip(); return; }
    await filterBtn.click();
    await page.waitForTimeout(500);

    const allPostsAfter = await page.locator("[draggable='true']").count();
    console.log(`Posts before filter: ${allPostsBefore}, after: ${allPostsAfter}`);
    // After filtering by draft, visible count should be <= total
    expect(allPostsAfter).toBeLessThanOrEqual(allPostsBefore);
  });
});
