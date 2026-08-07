import { Page } from "@playwright/test";

export const BASE = process.env.BASE_URL ?? "http://localhost:3001";
export const TEST_EMAIL = process.env.TEST_EMAIL ?? "test@openvpm.sk";
export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "testpassword";

export async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[name='email'], input[type='email']", TEST_EMAIL);
  await page.fill("input[name='password'], input[type='password']", TEST_PASSWORD);
  await page.click("button[type='submit']");
  await page.waitForURL(/dashboard|marketing/, { timeout: 15000 });
}

export function isStubToast(toastText: string): boolean {
  const stubPhrases = ["coming soon", "čoskoro", "beta", "stored locally", "odoslaná"];
  return stubPhrases.some(p => toastText.toLowerCase().includes(p));
}

/** Returns network requests captured during fn() */
export async function captureRequests(page: Page, fn: () => Promise<void>, filter?: (url: string) => boolean): Promise<string[]> {
  const calls: string[] = [];
  const handler = (req: any) => {
    const url = req.url();
    if (!filter || filter(url)) calls.push(url);
  };
  page.on("request", handler);
  await fn();
  await page.waitForTimeout(2000);
  page.off("request", handler);
  return calls;
}
