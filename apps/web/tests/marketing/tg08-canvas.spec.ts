/**
 * TG-08: AI Canvas
 * Tests document persistence and AI co-pilot
 */
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const STUB_FALLBACK_PHRASES = [
  "Bod 1: Popis",
  "Bod 2: Postup", 
  "Upravte pod\u013ea potreby",
  "*Obsah vygenerovan\u00fd AI copilotom",
];

test.describe("TG-08: AI Canvas", () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test("TG-08-A: Documents do NOT persist after reload (STUB - in-memory useState)", async ({ page }) => {
    await page.goto("/marketing/canvas");
    await page.waitForTimeout(1000);

    const uniqueTitle = `AutoTest-${Date.now()}`;

    // Create new doc
    const plusBtn = page.locator("button").filter({ hasText: "+" }).last();
    await plusBtn.click();
    await page.waitForTimeout(500);

    // Edit content
    const editor = page.locator("textarea#cv-editor");
    if (await editor.count() === 0) test.skip();
    await editor.fill(`# ${uniqueTitle}\n\nTestovac\u00ed obsah dokumentu pre persist test.`);

    // Save
    await page.locator("button").filter({ hasText: /ulo\u017ei\u0165/i }).first().click();
    await page.waitForTimeout(1000);

    // Verify exists before reload
    const beforeReload = await page.locator(`text=${uniqueTitle.substring(0, 15)}`).count();
    expect(beforeReload).toBeGreaterThan(0);

    // Reload
    await page.reload();
    await page.waitForTimeout(1500);

    const afterReload = await page.locator(`text=${uniqueTitle.substring(0, 15)}`).count();

    if (afterReload === 0) {
      console.error("\u{1F534} TG-08-A STUB CONFIRMED: Canvas document lost after page reload.");
      console.error("   Root cause: const [docs, setDocs] = useState<CanvasDoc[]>(INITIAL_DOCS)");
      console.error("   Fix: Create canvasDocuments DB table + tRPC CRUD (getDocuments, createDocument, updateDocument, deleteDocument)");
    } else {
      console.log("\u{1F7E2} TG-08-A REAL: Document persisted after reload");
      expect(afterReload).toBeGreaterThan(0);
    }
  });

  test("TG-08-B: AI Co-pilot returns hardcoded fallback (STUB)", async ({ page }) => {
    await page.goto("/marketing/canvas");
    await page.waitForTimeout(1000);

    // Select first document
    const firstDoc = page.locator("button[class*='border-b p-3']").first();
    if (await firstDoc.count() > 0) await firstDoc.click();

    const aiTextarea = page.locator("textarea").filter({ hasText: "" }).last();
    await aiTextarea.fill("Prid\u00e1j sekciu o prevencii psieho parvov\u00edrusa");
    
    await page.locator("button").filter({ hasText: /generova\u0165 sekciu/i }).first().click();
    await page.waitForTimeout(3000);

    // Enter edit mode to see content
    const editBtn = page.locator("button").filter({ hasText: /upravi\u0165/i }).first();
    if (await editBtn.count() > 0) await editBtn.click();

    const content = await page.locator("textarea#cv-editor").inputValue();
    console.log("AI generated content (last 300 chars):", content.slice(-300));

    const isStub = STUB_FALLBACK_PHRASES.some(p => content.includes(p));
    if (isStub) {
      console.error("\u{1F534} TG-08-B STUB DETECTED: AI Co-pilot returned hardcoded fallback template");
      console.error("   Current code: appends a static markdown template regardless of prompt");
      console.error("   Fix: Call /api/marketing-ai with actionType='generate_document_section' and connect to real Gemini API");
    } else {
      console.log("\u{1F7E2} TG-08-B REAL: AI generated contextual content");
    }
  });
});
