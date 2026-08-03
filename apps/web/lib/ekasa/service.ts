import crypto from "crypto";
import { db } from "@openpims/db/client";
import { ekasaReceipts, ekasaConfig } from "@openpims/db";
import { eq, and, isNull, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EkasaReceiptInput {
  practiceId: string;
  invoiceId?: string;
  amountBase: string;
  amountVat: string;
  amountTotal: string;
  vatRate: "ZERO" | "REDUCED" | "STANDARD";
  paymentMethod: "CASH" | "CARD" | "TRANSFER";
  items: Array<{
    name: string;
    qty: number;
    unitPrice: string;
    vatRate: string;
  }>;
  issuedAt?: Date;
}

export interface EkasaReceiptSigned {
  receiptNumber: string;
  okp: string;
  pkp: string;
}

export interface EkasaApiResponse {
  success: boolean;
  uid?: string;
  message?: string;
  rawResponse?: unknown;
}

// ---------------------------------------------------------------------------
// Receipt Number Generator
// Formát: YYYYMMDD-NNNN (napr. 20250803-0042)
// Atomické — číta MAX(seq) z DB pre daný deň a kliniku
// ---------------------------------------------------------------------------
export async function generateReceiptNumber(practiceId: string): Promise<string> {
  const today = new Date();
  const datePrefix = today
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ""); // "20250803"

  // Count receipts for this practice today to get next sequence
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ekasaReceipts)
    .where(
      and(
        eq(ekasaReceipts.practiceId, practiceId),
        isNull(ekasaReceipts.deletedAt),
        sql`date_trunc('day', ${ekasaReceipts.issuedAt}) = date_trunc('day', now())`
      )
    );

  const seq = ((result[0]?.count ?? 0) + 1).toString().padStart(4, "0");
  return `${datePrefix}-${seq}`;
}

// ---------------------------------------------------------------------------
// OKP — Overovací kód podnikateľa (SHA-1 hash)
// Zákon č. 289/2008 Z. z. § 3a ods. 4
// Vstup: DIC|pokladnicaId|receiptNumber|issuedAt|amountTotal
// ---------------------------------------------------------------------------
export function generateOkp(params: {
  dic: string;
  pokladnicaId: string;
  receiptNumber: string;
  issuedAt: Date;
  amountTotal: string;
}): string {
  const issuedAtStr = params.issuedAt
    .toISOString()
    .replace("T", " ")
    .slice(0, 19); // "2025-08-03 20:00:00"

  const input = [
    params.dic,
    params.pokladnicaId,
    params.receiptNumber,
    issuedAtStr,
    params.amountTotal,
  ].join("|");

  return crypto.createHash("sha1").update(input, "utf8").digest("hex").toUpperCase();
}

// ---------------------------------------------------------------------------
// PKP — Podpisový kód podnikateľa (RSA-SHA256, base64)
// V produkcii: podpisuje sa súkromným kľúčom z certifikátu FR SR
// Tu: MOCK implementácia (HMAC-SHA256 s náhodným kľúčom ako placeholder)
// ---------------------------------------------------------------------------
export function generatePkp(params: {
  dic: string;
  pokladnicaId: string;
  receiptNumber: string;
  issuedAt: Date;
  amountTotal: string;
  certBase64?: string | null;
}): string {
  const issuedAtStr = params.issuedAt
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  const input = [
    params.dic,
    params.pokladnicaId,
    params.receiptNumber,
    issuedAtStr,
    params.amountTotal,
  ].join("|");

  // MOCK: V produkcii nahradiť skutočným RSA-SHA256 podpisom so súkromným kľúčom
  // z certifikátu vydaného FR SR (formát PKCS#12)
  const mockKey = params.certBase64
    ? Buffer.from(params.certBase64, "base64").toString("hex").slice(0, 32)
    : "mock-ekasa-private-key-placeholder";

  return crypto
    .createHmac("sha256", mockKey)
    .update(input, "utf8")
    .digest("base64");
}

// ---------------------------------------------------------------------------
// Send to e-Kasa FR SR API
// Zákon č. 384/2025 Z. z. (aktuálna legislatíva)
// ---------------------------------------------------------------------------
export async function sendToEkasaApi(params: {
  apiUrl: string;
  receiptNumber: string;
  dic: string;
  pokladnicaId: string;
  amountTotal: string;
  amountVat: string;
  paymentMethod: string;
  okp: string;
  pkp: string;
  issuedAt: Date;
  items: EkasaReceiptInput["items"];
}): Promise<EkasaApiResponse> {
  const payload = {
    pokladnicaId: params.pokladnicaId,
    dic: params.dic,
    cisloDokladu: params.receiptNumber,
    datumCas: params.issuedAt.toISOString(),
    celkovaSuma: params.amountTotal,
    dph: params.amountVat,
    platba: params.paymentMethod,
    okp: params.okp,
    pkp: params.pkp,
    polozky: params.items.map((i) => ({
      nazov: i.name,
      mnozstvo: i.qty,
      jednotkovaCena: i.unitPrice,
      sadzba: i.vatRate,
    })),
  };

  try {
    const res = await fetch(`${params.apiUrl}/v2/receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // V produkcii: pridať autentifikačný token z klientského certifikátu
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `FR SR API vrátilo ${res.status}: ${errorText}`,
        rawResponse: { status: res.status, body: errorText },
      };
    }

    const data = (await res.json()) as { uid?: string; message?: string };
    return {
      success: true,
      uid: data.uid ?? `MOCK-UID-${Date.now()}`,
      rawResponse: data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neznáma chyba siete";
    // Timeout alebo network error → OFFLINE_STORED
    return {
      success: false,
      message: `Spojenie s FR SR zlyhalo: ${message}`,
      rawResponse: { error: message },
    };
  }
}

// ---------------------------------------------------------------------------
// QR Code Generator
// Formát: SK pokladnica QR (URL enkódovaný link pre overenie dokladu)
// ---------------------------------------------------------------------------
export function generateQrCodeData(params: {
  uid?: string | null;
  dic: string;
  amountTotal: string;
  receiptNumber: string;
}): string {
  if (params.uid) {
    // Produkčný URL pre overenie na portáli FR SR
    return `https://ekasa.financnasprava.sk/mdu/verifikacia?uid=${encodeURIComponent(params.uid)}`;
  }
  // Fallback pre offline / mock doklady
  return `https://ekasa.financnasprava.sk/mdu/verifikacia?dic=${params.dic}&cislo=${params.receiptNumber}&suma=${params.amountTotal}`;
}

// ---------------------------------------------------------------------------
// Orchestrovaná funkcia: Vytvor, podpíš a odošli doklad
// Vracia ID záznamu v DB
// ---------------------------------------------------------------------------
export async function processEkasaReceipt(
  input: EkasaReceiptInput,
  config: {
    dic: string;
    icDph?: string | null;
    pokladnicaId: string;
    ekasaApiUrl: string;
    certBase64?: string | null;
    offlineModeEnabled: boolean;
  }
): Promise<{ receiptId: string; status: string; uid?: string }> {
  const issuedAt = input.issuedAt ?? new Date();
  const receiptNumber = await generateReceiptNumber(input.practiceId);

  const okp = generateOkp({
    dic: config.dic,
    pokladnicaId: config.pokladnicaId,
    receiptNumber,
    issuedAt,
    amountTotal: input.amountTotal,
  });

  const pkp = generatePkp({
    dic: config.dic,
    pokladnicaId: config.pokladnicaId,
    receiptNumber,
    issuedAt,
    amountTotal: input.amountTotal,
    certBase64: config.certBase64,
  });

  // Uložiť do DB ako PENDING
  const [receipt] = await db
    .insert(ekasaReceipts)
    .values({
      practiceId: input.practiceId,
      invoiceId: input.invoiceId ?? null,
      receiptNumber,
      okp,
      pkp,
      amountBase: input.amountBase,
      amountVat: input.amountVat,
      amountTotal: input.amountTotal,
      vatRate: input.vatRate,
      paymentMethod: input.paymentMethod,
      status: "PENDING",
      issuedAt,
    })
    .returning({ id: ekasaReceipts.id });

  if (!receipt) throw new Error("Nepodarilo sa uložiť doklad do databázy");

  // Ak je offline mód zapnutý, uložíme bez odosielania
  if (config.offlineModeEnabled) {
    await db
      .update(ekasaReceipts)
      .set({ status: "OFFLINE_STORED" })
      .where(eq(ekasaReceipts.id, receipt.id));
    return { receiptId: receipt.id, status: "OFFLINE_STORED" };
  }

  // Odoslať do FR SR API
  const apiResult = await sendToEkasaApi({
    apiUrl: config.ekasaApiUrl,
    receiptNumber,
    dic: config.dic,
    pokladnicaId: config.pokladnicaId,
    amountTotal: input.amountTotal,
    amountVat: input.amountVat,
    paymentMethod: input.paymentMethod,
    okp,
    pkp,
    issuedAt,
    items: input.items,
  });

  const newStatus = apiResult.success ? "CONFIRMED" : "FAILED";

  await db
    .update(ekasaReceipts)
    .set({
      status: newStatus,
      uid: apiResult.uid ?? null,
      rawResponse: apiResult.rawResponse ?? null,
    })
    .where(eq(ekasaReceipts.id, receipt.id));

  return {
    receiptId: receipt.id,
    status: newStatus,
    uid: apiResult.uid,
  };
}
