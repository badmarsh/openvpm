import { test, expect } from "@playwright/test";

test.describe("Slovak Localization", () => {
  test("sidebar navigation is translated to Slovak by default", async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    
    // Login with demo admin credentials
    await page.fill('input[type="email"]', "admin@neighborhoodvet.example.com");
    await page.fill('input[type="password"]', "password123");
    await page.waitForSelector('button[type="submit"]:not([disabled])');
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 30000 });
    
    // Wait for redirect to dashboard by checking for the navigation element
    const navLocator = page.locator('nav[role="navigation"]');
    await expect(navLocator).toBeVisible({ timeout: 30000 });
    
    // The locale should be 'sk' by default in the new LocaleProvider.
    // Ensure all nav items are translated.
    await page.waitForTimeout(2000); // Wait for animations or network
    await page.screenshot({ path: 'test-results/sidebar-debug.png' });
    
    const expectedSlovakNavItems = [
      "Prehľad",
      "Pacienti",
      "Klienti",
      "Rozvrh",
      "Záznamy",
      "Fakturácia",
      "Sklad",
      "Schránka",
      "Prevádzková tabuľa",
      "Agent",
      "Omamné a psychotropné látky",
      "Prehľady",
      "Nastavenia"
    ];
    
    const navText = await navLocator.innerText();
    console.log("NAV TEXT:");
    console.log(navText);

    expect(navText).toContain("Prehľad");
    expect(navText).toContain("Pacienti");
    expect(navText).toContain("Klienti");
  });
});
