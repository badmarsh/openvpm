import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseColumns } from "./common";
import { practices } from "./practices";
import { invoices } from "./billing";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const ekasaPokladnicaTypeEnum = pgEnum("ekasa_pokladnica_type", [
  "ORP",  // Online registračná pokladnica
  "VRP",  // Virtuálna registračná pokladnica
  "CLOUD", // Cloud-based (API)
]);

export const ekasaVatRateEnum = pgEnum("ekasa_vat_rate", [
  "ZERO",     // 0%
  "REDUCED",  // 10% (potraviny, lieky)
  "STANDARD", // 23%
]);

export const ekasaPaymentMethodEnum = pgEnum("ekasa_payment_method", [
  "CASH",     // Hotovosť
  "CARD",     // Platobná karta
  "TRANSFER", // Bankový prevod
]);

export const ekasaReceiptStatusEnum = pgEnum("ekasa_receipt_status", [
  "PENDING",        // Čaká na odoslanie
  "SENT",           // Odoslané do FR SR
  "CONFIRMED",      // Potvrdené (máme UID)
  "FAILED",         // Odoslanie zlyhalo
  "OFFLINE_STORED", // Uložené offline (bez internetu)
]);

// ---------------------------------------------------------------------------
// Table 1: ekasa_config — konfigurácia e-Kasa pre každú kliniku
// ---------------------------------------------------------------------------
export const ekasaConfig = pgTable(
  "ekasa_config",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    // Daňové identifikátory (Zákon č. 289/2008 Z. z.)
    dic: text("dic").notNull(),                       // Daňové identifikačné číslo
    icDph: text("ic_dph"),                            // IČ DPH (voliteľné, ak platiteľ DPH)
    pokladnicaId: text("pokladnica_id").notNull(),    // Identifikátor pokladnice z FR SR
    pokladnicaType: ekasaPokladnicaTypeEnum("pokladnica_type").notNull().default("CLOUD"),
    // API endpoint FR SR (default produkčný)
    ekasaApiUrl: text("ekasa_api_url")
      .notNull()
      .default("https://ekasa.financnasprava.sk/oto/api"),
    // Certifikát / kľúče (uložené ako base64 — v produkcii použiť secrets manager)
    certBase64: text("cert_base64"),
    certPassword: text("cert_password"),
    // Funkčné prepínače
    offlineModeEnabled: boolean("offline_mode_enabled").notNull().default(false),
    cashlessEnabled: boolean("cashless_enabled").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    practiceIdx: index("ekasa_config_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    // Každá klinika môže mať len jednu aktívnu konfiguráciu
    practiceActiveIdx: uniqueIndex("ekasa_config_practice_active_uq").on(
      table.practiceId,
      table.isActive
    ),
  })
);

// ---------------------------------------------------------------------------
// Table 2: ekasa_receipts — vydané e-Kasa doklady
// ---------------------------------------------------------------------------
export const ekasaReceipts = pgTable(
  "ekasa_receipts",
  {
    ...baseColumns(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id),
    // Väzba na faktúru (nullable — doklad môže byť vydaný aj bez faktúry)
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    // Číslo dokladu — formát YYYYMMDD-SEQ (napr. 20250803-0042)
    receiptNumber: text("receipt_number").notNull(),
    // Kryptografické kontrolné kódy (FR SR)
    uid: text("uid"),                         // Unikátny identifikátor dokladu z FR SR
    okp: text("okp"),                         // Overovací kód podnikateľa (SHA-1)
    pkp: text("pkp"),                         // Podpisový kód podnikateľa (RSA-SHA256, base64)
    // Sumy
    amountBase: numeric("amount_base", { precision: 12, scale: 2 }).notNull().default("0.00"),
    amountVat: numeric("amount_vat", { precision: 12, scale: 2 }).notNull().default("0.00"),
    amountTotal: numeric("amount_total", { precision: 12, scale: 2 }).notNull(),
    vatRate: ekasaVatRateEnum("vat_rate").notNull().default("ZERO"),
    // Platba
    paymentMethod: ekasaPaymentMethodEnum("payment_method").notNull().default("CARD"),
    // Stav spracovania
    status: ekasaReceiptStatusEnum("status").notNull().default("PENDING"),
    // Surová odpoveď z FR SR API (pre audit)
    rawResponse: jsonb("raw_response"),
    // Čas vydania dokladu (môže sa líšiť od createdAt pri offline mode)
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    // Počet pokusov o odoslanie (pre retry logiku)
    retryCount: numeric("retry_count", { precision: 4, scale: 0 }).notNull().default("0"),
    lastRetryAt: timestamp("last_retry_at", { withTimezone: true }),
  },
  (table) => ({
    practiceIdx: index("ekasa_receipts_practice_idx").on(
      table.practiceId,
      table.deletedAt
    ),
    receiptNumberIdx: uniqueIndex("ekasa_receipts_number_practice_uq").on(
      table.practiceId,
      table.receiptNumber
    ),
    uidIdx: uniqueIndex("ekasa_receipts_uid_uq").on(table.uid),
    statusIdx: index("ekasa_receipts_status_idx").on(
      table.practiceId,
      table.status,
      table.deletedAt
    ),
    issuedAtIdx: index("ekasa_receipts_issued_at_idx").on(
      table.practiceId,
      table.issuedAt,
      table.deletedAt
    ),
  })
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const ekasaConfigRelations = relations(ekasaConfig, ({ one }) => ({
  practice: one(practices, {
    fields: [ekasaConfig.practiceId],
    references: [practices.id],
  }),
}));

export const ekasaReceiptsRelations = relations(ekasaReceipts, ({ one }) => ({
  practice: one(practices, {
    fields: [ekasaReceipts.practiceId],
    references: [practices.id],
  }),
  invoice: one(invoices, {
    fields: [ekasaReceipts.invoiceId],
    references: [invoices.id],
  }),
}));
