import { z } from "zod";
import { eq, and, isNull, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, protectedProcedure } from "../trpc";
import { canvasDocuments, canvasTemplates } from "@openpims/db";

// ---------------------------------------------------------------------------
// Master documents seeded from the OpenVPM Social Studio knowledge base
// ---------------------------------------------------------------------------
const MASTER_DOCUMENTS = [
  {
    title: "Master Strategický Plán v8.0",
    docType: "STRATEGY",
    status: "published",
    tags: ["Stratégia", "Rast", "Marketing"],
    isRagSource: true,
    content: `<h1>Stratégia rozvoja a operačná modernizácia kliniky v8.0</h1>
<h2>1. Exekutívne Zhrnutie</h2>
<p>Komplexný, dátami podložený strategický plán pre digitálnu transformáciu súkromnej veterinárnej kliniky. Cieľom je vybudovanie silnej lokálnej značky, zavedenie Fear-Free štandardov a implementácia predplatiteľského modelu (Wellness Plány).</p>
<h2>2. Piliere rastu</h2>
<ul>
  <li>Lokálna digitálna dominancia a Google Business Profile optimalizácia</li>
  <li>Sociálne siete a osobná značka lekára (Instagram, Facebook)</li>
  <li>Wellness Plány — predplatiteľský (subscription) model starostlivosti</li>
  <li>Fear-Free prístup — certifikácia a diferenciácia od konkurencie</li>
  <li>OpenVPM — digitálna správa ambulancie end-to-end</li>
</ul>
<h2>3. Transformačná Mapa (Gate 1 → Gate 4)</h2>
<ul>
  <li><strong>Gate 1 (Mesiac 1):</strong> GBP & Web Ready — optimalizovaný Google Business, nová webstránka, fotogaléria</li>
  <li><strong>Gate 2 (Mesiac 3):</strong> AI Scribe Proven — OpenVPM SOAP poznámky, automatické SMS, prvé Reels</li>
  <li><strong>Gate 3 (Mesiac 6):</strong> Wellness Adoption &gt; 3% — minimálne 3% klientov na Wellness Pláne</li>
  <li><strong>Gate 4 (Mesiac 12):</strong> Full OpenVPM Migration — kompletný prechod na digitálnu správu ambulancie</li>
</ul>
<h2>4. Client Acquisition to Retention Flow</h2>
<pre class="mermaid">
graph TD
    A[Sociálne Siete / Lokálne SEO] --> B[Zavolanie / Online Rezervácia]
    B --> C[Fear-Free Návšteva v ambulancii]
    C --> D[Discharge Ask — žiadosť o Google recenziu]
    D --> E[Ponuka Wellness Plánu]
    E --> F[Lojálny dlhodobý klient]
    F --> A
</pre>
<h2>5. KPI Dashboard (ciele na 12 mesiacov)</h2>
<ul>
  <li>Google recenzie: +50 nových, priemerné hodnotenie &gt; 4.8★</li>
  <li>Instagram sledovatelia: +500 organicky</li>
  <li>Wellness Plán enrollment: &gt; 3% aktívnych pacientov</li>
  <li>Priemerná hodnota návštevy: +15% YoY</li>
</ul>`,
  },
  {
    title: "Klinický SOP: Senzorický Fear-Free Protokol",
    docType: "SOP",
    status: "published",
    tags: ["Fear-Free", "SOP", "Personál"],
    isRagSource: false,
    content: `<h1>Klinický SOP: Senzorický Fear-Free Protokol</h1>
<p><strong>Verzia:</strong> 2.0 | <strong>Platnosť:</strong> Všetok personál ambulancie</p>
<p>Základné pravidlá pre minimalizáciu stresu zvierat v prostredí veterinárnej kliniky. Fear-Free prístup je diferenciačný faktor ambulancie — musí byť viditeľný každému klientovi.</p>
<h2>Ranné povinnosti recepcie (pred otvorením)</h2>
<ul class="contains-task-list">
  <li class="task-list-item">[ ] Zapnutie difuzérov <strong>Adaptil</strong> (pre psov) a <strong>Feliway</strong> (pre mačky) v čakárni aj ambulancii — min. 30 minút pred otvorením.</li>
  <li class="task-list-item">[ ] Nastavenie upokojujúcej hudby v čakárni — klasická hudba alebo špeciálne Pet Acoustics playlist. <strong>Žiadne komerčné rádio.</strong></li>
  <li class="task-list-item">[ ] Príprava <strong>vyvýšených odkladacích plôch</strong> pre mačacie prepravky — mačky nesmú byť na podlahe na úrovni psov.</li>
  <li class="task-list-item">[ ] Vizuálne bariéry medzi psíkárnou a mačacou zónou v čakárni (napr. zástena, kartón).</li>
  <li class="task-list-item">[ ] Pripravenie <strong>protišmykových podložiek</strong> na všetky vyšetrovacie stoly.</li>
  <li class="task-list-item">[ ] LickiMat podložky s arašidovým maslom alebo pastou priravené pre odoberanie krvi a vakcinácie.</li>
</ul>
<h2>Princípy Low-Stress manipulácie</h2>
<ul>
  <li><strong>Pomalé pohyby:</strong> Žiadne náhle gestá, hlasné zvuky. Priblíženie sa k zvieraťu vždy z boku, nie spredu.</li>
  <li><strong>Odmeny počas zákrokov:</strong> Arašidové maslo, lízanka, pamlsky — pozitívna asociácia s ambulanciou.</li>
  <li><strong>Minimálna fixácia:</strong> Zviera sa nikdy nesmie brutálne pridržiavať. Ak je zviera príliš stresované, odložiť zákrok.</li>
  <li><strong>Teplé osvetlenie:</strong> Studené LED svetlá v ambulancii nahradiť teplejšími (3000K). Prípadne stlmiť svetlá počas vyšetrenia mačiek.</li>
  <li><strong>Mačky z prepravky:</strong> Nikdy nevyberáme mačku za zvieranie — ponúkneme pamlsok a počkáme, kým vyjde sama, prípadne rozoberieme prepravku.</li>
</ul>
<h2>Komunikácia s klientom</h2>
<p>Personál vždy vysvetlí klientovi, čo sa bude diať a prečo — transparentnosť buduje dôveru. Vyhýbame sa vetám ako <em>"Nebojte sa"</em> (negácia strachu je neúčinná) — namiesto toho: <em>"Urobíme všetko preto, aby bol váš miláčik čo najpohodlnejší."</em></p>`,
  },
  {
    title: "Komunikačný a Krízový Manuál: Google Recenzie",
    docType: "MANUAL",
    status: "published",
    tags: ["Reputácia", "Google", "Krízová komunikácia", "RAG"],
    isRagSource: true,
    content: `<h1>Komunikačný a Krízový Manuál: Google Recenzie</h1>
<p>Zásady odpovedania na online spätnú väzbu a riešenie krízových situácií. <strong>Tento dokument je zdrojom RAG kontextu pre AI asistenta pri navrhovaní odpovedí.</strong></p>
<h2>Základné pravidlá</h2>
<ul>
  <li>Na každú recenziu odpovieme do <strong>48 hodín</strong>.</li>
  <li>Nikdy nie sme agresívni, obraňujúci sa ani sarkastickí.</li>
  <li>Nepoužívame meno pacienta ani diagnózu v odpovedi (GDPR).</li>
  <li>Každá odpoveď je podpísaná menom lekára alebo "Tím ambulancie".</li>
</ul>
<h2>Matica odpovedí podľa typu recenzie</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background: #f0f0f0;">
      <th style="padding: 10px; text-align: left;">Typ Recenzie</th>
      <th style="padding: 10px; text-align: left;">Tón Odpovede</th>
      <th style="padding: 10px; text-align: left;">Príklad Odpovede (SK)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px;">Sťažnosť na vysokú cenu (1–2★)</td>
      <td style="padding: 10px;">Profesionálny, hranice, transparentnosť, bez ospravedlnenia za kvalitu</td>
      <td style="padding: 10px;"><em>"Dobrý deň, mrzí nás Vaša nespokojnosť. Veterinárna medicína, ak sa má robiť bezpečne a správne, vyžaduje špičkové prístroje, certifikované lieky a kontinuálne vzdelávanie. Detaily Vášho účtu s Vami kedykoľvek radi prejdeme, no znižovať kvalitu starostlivosti o pacienta len preto, aby bol účet nižší, na našej klinike nikdy nebudeme. — Tím ambulancie"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Sťažnosť na čakaciu dobu</td>
      <td style="padding: 10px;">Empatie, vysvetlenie, ponuka riešenia</td>
      <td style="padding: 10px;"><em>"Dobrý deň, ospravedlňujeme sa za čakanie. Každý pacient si u nás zaslúži plnú pozornosť, čo niekedy spôsobí oneskorenie. Pracujeme na zavedení online rezervácií, aby sme minimalizovali Vaše čakanie. Ďakujeme za trpezlivosť. — Tím ambulancie"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Úmrtie pacienta (aj s 5★)</td>
      <td style="padding: 10px;">Extrémna empatia, súcit, žiadna obrana, krátke</td>
      <td style="padding: 10px;"><em>"Vážená rodina, strata zasiahla aj nás. Boli ste skvelí majitelia, ktorí urobili pre svojho miláčika maximum až do úplného konca. Bolo nám cťou sa o neho starať v jeho najťažších chvíľach. Sme s Vami v smútku. — MVDr. Sýkora"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">5★ pochvala</td>
      <td style="padding: 10px;">Vďačnosť, osobné, komunitné, pozvanie na ďalšiu návštevu</td>
      <td style="padding: 10px;"><em>"Ďakujeme veľmi pekne za Vaše krásne slová a dôveru! Takáto spätná väzba nás napĺňa radosťou a motivuje nás každý deň robiť svoju prácu s láskou. Tešíme sa na Vašu ďalšiu návštevu! 🐾 — Tím ambulancie"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Falošná / zámerná negatívna recenzia</td>
      <td style="padding: 10px;">Pokojný, faktický, bez emotívnosti, nahlásenie Googlu</td>
      <td style="padding: 10px;"><em>"Dobrý deň, v našom systéme nenachádzame žiadnu návštevu spojenú s Vaším menom. Ak máte konkrétny podnet, prosíme kontaktujte nás priamo na [email]. Recenziu sme nahlásili Googlu na preverenie. — Tím ambulancie"</em></td>
    </tr>
  </tbody>
</table>`,
  },
  {
    title: "SOP: Obsluha a Export pre Edukačnú TV",
    docType: "SOP",
    status: "published",
    tags: ["TV", "Marketing", "Technika", "SOP"],
    isRagSource: false,
    content: `<h1>SOP: Obsluha a Export pre Edukačnú TV v čakárni</h1>
<p><strong>Zodpovednosť:</strong> Recepcia | <strong>Frekvencia aktualizácie:</strong> Mesačne</p>
<h2>Technický Setup</h2>
<ul>
  <li><strong>Hardvér:</strong> TV s voľným HDMI vstupom + Android TV Stick (Chromecast s Google TV, Raspberry Pi 4, alebo Xiaomi Mi TV Stick 4K).</li>
  <li><strong>Softvér:</strong> <a href="https://yodeck.com" target="_blank">Yodeck</a> (odporúčané) alebo Screenly pre správu digitálneho obsahu na TV. Alternatíva: jednoduchý video prehrávač v loope cez USB kľúč.</li>
  <li><strong>Obsah:</strong> Vytváraný v Canva (šablóny 1920×1080px / 16:9) alebo priamo v module <strong>Marketing &amp; Rast</strong> v OpenVPM.</li>
</ul>
<h2>Proces exportu z Marketingového Plánovača (OpenVPM)</h2>
<ol>
  <li>Otvorte modul <strong>Marketingové Štúdio</strong> v OpenVPM.</li>
  <li>Prejdite na sekciu <em>Šablóny</em> a vyfiltrujte kategóriu <strong>"TV Slides (16:9)"</strong>.</li>
  <li>Vyberte aktuálny sezónny slide a upravte text. <br><strong>Pravidlo:</strong> Maximálne <strong>15 slov</strong> na jeden slide. Text musí byť čitateľný z 3 metrov (min. veľkosť 60pt).</li>
  <li>Kliknite <em>Exportovať</em> → vyberte formát <strong>MP4 (1080p, 10s loop)</strong> alebo <strong>PNG (sada obrázkov)</strong>.</li>
  <li>Nahrajte súbor priamo do <a href="https://app.yodeck.com" target="_blank">Yodeck administrácie</a> alebo do zdieľanej Google Drive zložky TV.</li>
</ol>
<h2>Sezónny kalendár obsahu</h2>
<ul>
  <li><strong>Január–Február:</strong> Zubná hygiena (Pet Dental Health Month), zimná starostlivosť</li>
  <li><strong>Marec–Máj:</strong> Ochrana pred kliešťami a parazitmi, jar</li>
  <li><strong>Jún–August:</strong> Letná bezpečnosť, prehriatje, hydratácia</li>
  <li><strong>September–November:</strong> Jesenná prevencia, príprava na zimu</li>
  <li><strong>December:</strong> Stres a pyrotechnika, straty v prírode, Vianoce a čokoláda (toxicita)</li>
</ul>`,
  },
  {
    title: "Klientske Persony (Slovak & Hungarian demographics)",
    docType: "STRATEGY",
    status: "published",
    tags: ["Marketing", "Persony", "AI kontext", "RAG"],
    isRagSource: true,
    content: `<h1>Klientske Persony (Región Juh — Rimavská Sobota a okolie)</h1>
<p>Detailný rozbor cieľových skupín pre presné cielenie komunikačného tónu AI generátora a marketingových kampaní. Tieto persony slúžia ako <strong>RAG kontext pre AI</strong> pri generovaní obsahu.</p>
<h2>Persona 1: Lokálny Senior — "János / Mária"</h2>
<ul>
  <li><strong>Vek:</strong> 60+ rokov</li>
  <li><strong>Jazyk:</strong> Prevažne maďarsky hovoriaci obyvatelia regiónu</li>
  <li><strong>Správanie:</strong> Extrémne cenovo senzitívny segment, no nesmierne lojálny po získaní dôvery. Vyžaduje vysokú mieru osobnej dôvery a priamu autoritu lekára. Neuznáva digitálnu komunikáciu ako primárnu.</li>
  <li><strong>Motivátory:</strong> Dôvera k lekárovi osobne, odporúčanie od susedov/priateľov, stabilita a tradícia</li>
  <li><strong>Komunikácia:</strong> Preferuje osobný kontakt, telefonické rozhovory a papierové letáky v čakárni. <strong>Kľúčové: bilingválna (SK/HU) komunikácia</strong> na recepcii a základných materiáloch. Reaguje na konzervatívny, rešpektujúci a trpezlivý tón.</li>
  <li><strong>Bariéry:</strong> Cena, nedôvera k novým procedúram, jazyková bariéra (slovenčina)</li>
</ul>
<h2>Persona 2: Mladá Rodina / Mileniál — "Tomáš a Lucia"</h2>
<ul>
  <li><strong>Vek:</strong> 25–40 rokov</li>
  <li><strong>Jazyk:</strong> Slovensky hovoriaci alebo bilingválni (SK/HU)</li>
  <li><strong>Správanie:</strong> Vnímajú psa alebo mačku ako plnohodnotného "chlpatého" člena rodiny. Ochotní investovať nadštandardné prostriedky do prevencie, diagnostiky a prémiových služieb. Oceňujú transparentnosť a digitálny prístup.</li>
  <li><strong>Motivátory:</strong> Welfare zvieraťa, Fear-Free prístup, moderná klinika, online pohodlie, prevencia nad liečbou</li>
  <li><strong>Komunikácia:</strong> Digital-first — online rezervácie, SMS pripomienky, atraktívny Instagram (Reels, Stories), edukatívny obsah, recenzie na Google. Hlavná cieľová skupina pre <strong>Wellness Plány</strong>.</li>
  <li><strong>Bariéry:</strong> Vzdialenosť (preferujú kliniku v meste), cena bez vnímania hodnoty</li>
</ul>
<h2>Jazykové pokyny pre AI generátor</h2>
<ul>
  <li><strong>Persona 1 (HU):</strong> Formálny, rešpektujúci tón. Vyhýbať sa slangu. Kratšie vety. Oslovovať "Önök" (Vy). Príklady z tradičného života.</li>
  <li><strong>Persona 2 (SK):</strong> Moderný, vrúcny tón. Môže byť emocionálny. Emojis sú vhodné na sociálnych sieťach. Tykanie v neformálnych kontextoch.</li>
</ul>`,
  },
];

export const canvasRouter = createRouter({
  /** List all documents for this practice */
  getDocuments: protectedProcedure
    .input(
      z.object({
        docType: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        isRagSource: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(canvasDocuments.practiceId, ctx.practiceId),
        isNull(canvasDocuments.deletedAt),
      ];
      if (input?.status) {
        conditions.push(eq(canvasDocuments.status, input.status));
      }
      if (input?.docType) {
        conditions.push(eq(canvasDocuments.docType, input.docType));
      }
      return ctx.db.query.canvasDocuments.findMany({
        where: and(...conditions),
        orderBy: [desc(canvasDocuments.updatedAt)],
      });
    }),

  /** Get a single document by ID */
  getDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, input.documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      return doc;
    }),

  /** Seed the 5 master documents (idempotent) */
  seedMasterDocuments: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.db.query.canvasDocuments.findFirst({
      where: and(
        eq(canvasDocuments.practiceId, ctx.practiceId),
        isNull(canvasDocuments.deletedAt)
      ),
    });
    if (existing) return { seeded: false, message: "Documents already exist" };

    await ctx.db.insert(canvasDocuments).values(
      MASTER_DOCUMENTS.map((d) => ({
        practiceId: ctx.practiceId,
        authorId: ctx.user.id,
        ...d,
      }))
    );
    return { seeded: true, count: MASTER_DOCUMENTS.length };
  }),

  /** Create a new document */
  createDocument: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(512),
        docType: z.string(),
        content: z.string().default(""),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
        tags: z.array(z.string()).default([]),
        isRagSource: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .insert(canvasDocuments)
        .values({
          practiceId: ctx.practiceId,
          authorId: ctx.user.id,
          ...input,
        })
        .returning();
      return doc;
    }),

  /** Update document content */
  updateDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
        title: z.string().min(1).max(512).optional(),
        content: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        tags: z.array(z.string()).optional(),
        isRagSource: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documentId, ...rest } = input;
      const existing = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      const [updated] = await ctx.db
        .update(canvasDocuments)
        .set(rest)
        .where(eq(canvasDocuments.id, documentId))
        .returning();
      return updated;
    }),

  /** Soft-delete a document */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.canvasDocuments.findFirst({
        where: and(
          eq(canvasDocuments.id, input.documentId),
          eq(canvasDocuments.practiceId, ctx.practiceId),
          isNull(canvasDocuments.deletedAt)
        ),
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }
      await ctx.db
        .update(canvasDocuments)
        .set({ deletedAt: new Date() })
        .where(eq(canvasDocuments.id, input.documentId));
      return { deleted: true };
    }),

  /** List global canvas templates */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.canvasTemplates.findMany({
      where: isNull(canvasTemplates.deletedAt),
      orderBy: [canvasTemplates.category, canvasTemplates.title],
    });
  }),
});
