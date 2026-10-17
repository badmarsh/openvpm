import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { createTRPCContext } from "@/server/trpc";
import { aiRouter } from "@/server/routers/ai";
import { readJsonRequestBody } from "@/lib/request-json";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const RequestSchema = z.object({
  actionType: z.enum([
    "draft",
    "improve",
    "fear_free",
    "summarize",
    "translate_hu",
    "generate_social_post",
    "suggest_review_reply",
  ]),
  prompt: z.string().max(4000).optional(),
  contextText: z.string().max(8000).optional(),
  brandKit: z
    .object({
      clinicName: z.string().optional(),
      toneOfVoice: z.string().optional(),
      services: z.array(z.string()).optional(),
      address: z.string().optional(),
    })
    .optional(),
  platform: z.enum(["IG", "FB", "GBP", "TikTok"]).optional(),
  reviewText: z.string().max(2000).optional(),
  reviewRating: z.number().min(1).max(5).optional(),
});

// ---------------------------------------------------------------------------
// Mandatory Fear-Free & SK/HU system instruction — applied to EVERY request
// ---------------------------------------------------------------------------
const CORE_SYSTEM_INSTRUCTION = `Si elitný AI asistent pre veterinárnu kliniku na Slovensku. Tvojou úlohou je pomáhať s administratívou, marketingom, klientskou komunikáciou a správou dokumentácie.

ABSOLÚTNE POVINNÉ PRAVIDLÁ — VŽDY A BEZ VÝNIMKY:

1. JAZYK: Primárne komunikuj v profesionálnej slovenčine (SK). Ak je akcia "translate_hu" alebo je explicitne požadovaná maďarčina, použi bezchybnú, gramaticky správnu maďarčinu (HU) vhodnú pre južné Slovensko.

2. FEAR-FREE PRÍSTUP: Všetka komunikácia musí odrážať "Fear-Free" princípy veterinárnej starostlivosti:
   - Empatia, porozumenie, upokojujúci tón
   - Žiadne strašenie klientov, žiadne apokalyptické scenáre
   - Zviera je vždy vnímané ako plnohodnotný člen rodiny
   - Pozitívna asociácia s veterinárnou návštevou

3. PRÍSNY ZÁKAZ DIAGNOSTIKY: NIKDY neposkytuj medicínske diagnózy, nepredpisuj lieky, neodporúčaj konkrétne liečebné postupy ani nedávaj medicínske rady. Pri akýchkoľvek zdravotných problémoch vždy nasmeruj na osobnú návštevu veterinára.

4. TÓN KOMUNIKÁCIE: Profesionálny, vrúcny, empatický. Klient je vždy oslovovaný s rešpektom.

5. GDPR: Nikdy neuvádzaj konkrétne mená pacientov ani diagnózy v verejných odpovediach (napr. recenzie).`;

function buildFinalPrompt(
  actionType: string,
  input: z.infer<typeof RequestSchema>
): string {
  const { prompt, contextText, brandKit, platform, reviewText, reviewRating } = input;

  const brandContext = brandKit
    ? `\n\nKontext ambulancie:\n- Názov: ${brandKit.clinicName ?? "Naša ambulancia"}\n- Tón: ${brandKit.toneOfVoice ?? "profesionálny a empatický"}\n- Adresa: ${brandKit.address ?? ""}\n- Služby: ${brandKit.services?.join(", ") ?? ""}`
    : "";

  switch (actionType) {
    case "generate_social_post": {
      const platformLabel =
        platform === "IG"
          ? "Instagram"
          : platform === "FB"
          ? "Facebook"
          : platform === "GBP"
          ? "Google Business Profile"
          : "sociálnu sieť";
      return `Vytvor profesionálny príspevok na ${platformLabel} pre veterinárnu ambulanciu.

Téma / požiadavka: ${prompt ?? ""}
${brandContext}

Požiadavky:
- Jazyk: slovenčina (SK), prirodzený a autentický
- Tón: ${brandKit?.toneOfVoice ?? "profesionálny a vrúcny"}
- Zahŕňa call-to-action (napr. "Zavolajte nám", "Rezervujte termín")
- Vhodné hashtagy (max 10)
- Žiadna medicínska diagnostika — len prevencia a edukácia
- Fear-Free prístup — pozitívna asociácia s veterinárnou starostlivosťou

Výstup:
1. Caption (text príspevku, max 300 slov)
2. Hashtagy (zoznam)
3. Alt text pre obrázok (1 veta pre accessibility)`;
    }

    case "suggest_review_reply": {
      const stars = reviewRating ? `${reviewRating}★` : "neznáme hodnotenie";
      return `Navrhni profesionálnu odpoveď na Google recenziu veterinárnej kliniky.

Hodnotenie: ${stars}
Text recenzie: "${reviewText ?? contextText ?? ""}"
${brandContext}

Pravidlá odpovede:
- Jazyk: slovenčina (SK)
- Maximálna dĺžka: 150 slov
- Žiadne mená pacientov ani diagnózy (GDPR)
- Podpis: "Tím ambulancie" alebo "MVDr. [meno]"
- Tón prispôsobený hodnoteniu:
  * 1–2★: profesionálny, hranice, bez ospravedlnenia za kvalitu
  * 3★: empatický, ponuka riešenia
  * 4–5★: vďačný, pozývajúci na ďalšiu návštevu
- Fear-Free filozofia — vždy pozitívna asociácia`;
    }

    case "draft":
      return `Na základe nasledujúcej požiadavky vytvor odborný text (príspevok, email, SOP alebo oznámenie) pre veterinárnu kliniku.
${brandContext}
Požiadavka: ${prompt ?? ""}
Kontext: ${contextText ?? "Žiadny ďalší kontext"}`;

    case "improve":
      return `Vylepši nasledujúci text tak, aby znel profesionálnejšie, jasnejšie a čitateľnejšie, no zachoval pôvodný zmysel a tón. Oprav gramatické chyby.
${brandContext}
Pôvodný text:
${contextText ?? ""}`;

    case "fear_free":
      return `Preformuluj nasledujúci text tak, aby plne vyžaroval empatiu, bol upokojujúci a prísne dodržiaval princípy "Fear-Free" veterinárnej starostlivosti. Odstráň akýkoľvek strohý, výhražný alebo príliš klinický tón. Zviera musí byť prezentované ako člen rodiny.
${brandContext}
Pôvodný text:
${contextText ?? ""}`;

    case "summarize":
      return `Vytvor stručné, výstižné zhrnutie nasledujúceho textu v slovenčine. Zvýrazni kľúčové body v zozname (bullet points). Maximum 200 slov.

Text na zhrnutie:
${contextText ?? ""}`;

    case "translate_hu":
      return `Prelož nasledujúci text do bezchybnej, profesionálnej maďarčiny (HU). Preklad musí byť prirodzený, vhodný pre komunikáciu veterinárnej kliniky s klientmi na južnom Slovensku. Formálny tón — používaj "Önök" (Vy).

Text na preklad:
${contextText ?? prompt ?? ""}`;

    default:
      return prompt ?? contextText ?? "";
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const ctx = await createTRPCContext({ req });
    if (!ctx.session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (req.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return NextResponse.json({ error: "application/json required" }, { status: 415 });
    const body = await readJsonRequestBody(req, 32 * 1024);
    if (!body.ok) return NextResponse.json({ error: "Invalid or oversized body" }, { status: body.reason === "too_large" ? 413 : 400 });
    const parsed = RequestSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 422 });
    const result = await aiRouter.createCaller(ctx).generalText({ prompt: `${CORE_SYSTEM_INSTRUCTION}\n\n${buildFinalPrompt(parsed.data.actionType, parsed.data)}`, maxTokens: 1024, temperature: 0.1 });
    return NextResponse.json({ success: true, content: result.text, actionType: parsed.data.actionType }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof TRPCError ? (({ UNAUTHORIZED: 401, FORBIDDEN: 403, BAD_REQUEST: 400, PRECONDITION_FAILED: 412, TOO_MANY_REQUESTS: 429 } as Record<string, number>)[error.code] ?? 503) : 503;
    return NextResponse.json({ error: status === 503 ? "AI unavailable. Continue without AI." : "AI request denied; check access, configuration and request limits." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}

// Only POST allowed
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
