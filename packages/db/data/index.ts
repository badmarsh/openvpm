// Shared locale-aware seed data accessor.
// Each router calls getLocaleData(locale) to get the matching translated
// data set for the practice's country. Additive only — the existing
// packages/db/seed.ts imports individual locale files directly.
import * as sk from "./sk/index";
import * as en from "./en/index";

export type Locale = "sk" | "en";

export function getLocaleData(locale: Locale = "en") {
  const data = locale === "sk" ? sk : en;
  return {
    marketingTemplatesData: data.marketingTemplatesData,
    crmAutomationsData: data.crmAutomationsData,
    canvasMasterDocumentsData: data.canvasMasterDocumentsData,
  };
}
