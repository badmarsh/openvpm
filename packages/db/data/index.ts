// Shared locale-aware seed data accessor.
// Each router calls getLocaleData(locale) to get the matching translated
// data set for the practice's country. Additive only — the existing
// packages/db/seed.ts imports individual locale files directly.
import * as sk from "./sk/index";

export type Locale = "sk";

export function getLocaleData(_locale?: string) {
  return {
    marketingTemplatesData: sk.marketingTemplatesData,
    crmAutomationsData: sk.crmAutomationsData,
    canvasMasterDocumentsData: sk.canvasMasterDocumentsData,
  };
}
