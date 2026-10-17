"use client";

import { trpc } from "@/lib/trpc";

export default function AISettingsPage() {
  const config = trpc.ai.configuration.useQuery();
  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">AI — konfigurácia servera</h1>
      <p>Kľúče ani adresy poskytovateľov sa už nezadávajú v prehliadači. Staré databázové nastavenia sa nepoužívajú. Nezadávajte sem žiadne tajné údaje.</p>
      {config.isLoading ? <p role="status">Kontrolujem konfiguráciu…</p> : config.error ? <p role="alert">Konfiguráciu sa nepodarilo overiť. Skontrolujte prihlásenie a server.</p> : config.data ? (
        <div role="status" className="rounded border p-4">
          <p>Textové návrhy: {config.data.ready ? "nakonfigurované (nie overené u poskytovateľa)" : "nedostupné"}</p>
          <p>Poskytovateľ: {config.data.provider ?? "nepodporovaný"}; model: {config.data.model}</p>
          <ul className="list-disc pl-6">{config.data.problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
        </div>
      ) : null}
      <p>Operátor nastaví AI_TEXT_ENABLED=true, AI_MODEL a príslušný kľúč na serveri. Vypnutie AI_TEXT_ENABLED zastaví nové požiadavky textového pomocníka a SOAP návrhov; nezruší už bežiace volania.</p>
      <p>Podporované kľúče: ANTHROPIC_API_KEY pre claude-*, GOOGLE_API_KEY (alebo GOOGLE_GENERATIVE_AI_API_KEY) pre gemini-*, OPENAI_API_KEY pre gpt-* a podporované o-modely. Používajte iba čisté ID modelu, nie URL.</p>
      <p>Analýza obrázkov, automatická diagnostika a databázová správa AI modelov sú nedostupné. Chat nemá prístup k záznamom. Zmena konfigurácie môže vyžadovať reštart alebo nové nasadenie servera.</p>
      <p>Postup overenia a zostávajúce úlohy: docs/pilot/README.md v repozitári. Ak bola staršia verzia verejne dostupná, operátor musí preveriť a podľa potreby rotovať pôvodné kľúče.</p>
    </section>
  );
}
