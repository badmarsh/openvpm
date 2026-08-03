// Shared locale-aware seed data accessor.
// Each router calls getLocaleData(locale) to get the matching translated
// data set for the practice's country. Additive only — the existing
// packages/db/seed.ts imports individual locale files directly.
import * as sk from "./sk/index";
import * as en from "./en/index";

export type Locale = "sk" | "en";

export function getLocaleData(locale: Locale) {
  return locale === "sk"
    ? {
      marketingTemplatesData: sk.marketingTemplatesData,
      crmAutomationsData: sk.crmAutomationsData,
      canvasMasterDocumentsData: sk.canvasMasterDocumentsData,
    }
    : {
      marketingTemplatesData: en.marketingTemplatesData,
      crmAutomationsData: en.crmAutomationsData,
      canvasMasterDocumentsData: en.canvasMasterDocumentsData,
    };
}
