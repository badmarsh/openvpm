import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { VOICE_SCRIBE_SYSTEM_PROMPT, BILLING_EXTRACTION_PROMPT } from "./prompts";
import { db } from "@openpims/db/client";
import { products, services as servicesTable } from "@openpims/db";
import { eq, isNull, and, or, ilike } from "drizzle-orm";

// Definovanie očakávaného výstupu pre SOAP pomocou Zod
const soapSchema = z.object({
  subjective: z.string().describe("Subjektívne príznaky, dôvod návštevy a anamnéza zistená od majiteľa."),
  objective: z.string().describe("Objektívne klinické nálezy a parametre zistené pri vyšetrení."),
  assessment: z.string().describe("Zhodnotenie stavu, diferenciálne alebo konečné diagnózy."),
  plan: z.string().describe("Plán terapie, predpísané lieky a odporúčania pre majiteľa."),
});

const billingSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().nullable().describe("ID nájdenej položky z cenníka, inak null"),
      name: z.string().describe("Názov položky, úkonu alebo lieku"),
      type: z.enum(["product", "service"]),
      quantity: z.number().describe("Množstvo kusov alebo balení"),
    })
  ),
});

export async function processConsultationAudio(params: {
  audioBase64: string; // Očakávame formát webm alebo mp4
  mimeType?: string;
  practiceId: string;
}) {
  const mimeType = params.mimeType || "audio/webm";
  
  // Krok 1: Extrakcia SOAP správy priamo zo zvuku pomocou Gemini 1.5 (Multimodal)
  // Gemini 1.5 natively podporuje audio súbory
  const soapResult = await generateObject({
    model: google("gemini-2.5-flash"), // alebo gemini-1.5-pro
    schema: soapSchema,
    system: VOICE_SCRIBE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyzuj túto zvukovú nahrávku z veterinárnej konzultácie a vygeneruj z nej SOAP záznam v slovenčine." },
          // @ts-ignore - závisí od presnej verzie ai-sdk, ak nepodporuje type 'file', použijeme textový fallback v praxi
          { type: "file", data: params.audioBase64, mimeType },
        ],
      },
    ],
  });

  const generatedSoap = soapResult.object;

  // Keďže Vercel AI SDK cez generateObject nevracia jednoducho aj raw prepis audia (len štruktúru),
  // vygenerujeme aj stručný textový prehľad / prepis (pre rawTranscript).
  // V produkcii by tu bol Whisper API call pre presný prepis slovo po slove.
  const transcriptResult = await generateText({
    model: google("gemini-2.5-flash"),
    system: "Si zapisovateľ. Urob presný a doslovný textový prepis (transcription) z poskytnutej nahrávky v slovenčine. Nevymýšľaj si nič navyše.",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Prepíš tento zvukový záznam." },
          // @ts-ignore
          { type: "file", data: params.audioBase64, mimeType },
        ],
      },
    ],
  });

  const rawTranscript = transcriptResult.text;

  // Krok 2: Extrakcia položiek pre účtovanie (Billing)
  // Najprv si načítame cenník danej kliniky na pomoc LLM modelu (limitované na top položky alebo len kontext)
  const [practiceProducts, practiceServices] = await Promise.all([
    db.query.products.findMany({
      where: and(eq(products.practiceId, params.practiceId), isNull(products.deletedAt)),
      columns: { id: true, name: true },
      limit: 200,
    }),
    db.query.services.findMany({
      where: and(eq(servicesTable.practiceId, params.practiceId), isNull(servicesTable.deletedAt)),
      columns: { id: true, name: true },
      limit: 200,
    })
  ]);

  // Vytvoríme katalóg do kontextu promptu (formát ID: Názov)
  const catalogContext = `
Dostupné produkty a lieky:
${practiceProducts.map(p => `- ${p.id}: ${p.name}`).join("\n")}

Dostupné služby a úkony:
${practiceServices.map(s => `- ${s.id}: ${s.name}`).join("\n")}
`;

  const billingResult = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: billingSchema,
    system: BILLING_EXTRACTION_PROMPT,
    prompt: `Katalóg kliniky:\n${catalogContext}\n\nPrepis vyšetrenia:\n${rawTranscript}\n\nNavrhni položky z katalógu, ktoré by sa mali vyfakturovať.`,
  });

  const suggestedBillingItems = billingResult.object.items;

  return {
    rawTranscript,
    generatedSoap,
    suggestedBillingItems,
  };
}
