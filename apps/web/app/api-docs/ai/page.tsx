import { WEBHOOK_EVENT_DEFINITIONS } from "@/lib/webhook-events";

export default function AIIntegrationDocs() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">AI — implementované rozhrania a obmedzenia</h1>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Textové návrhy, nie autonómny agent</h2>
        <p>Agent chat nečíta karty pacientov a nemá nástroje na rezervácie ani zápis. /api/v1/agent a tRPC agent router nie sú implementované. Rozsahy agent:run a agent:write sú rezervované, nie aktívna funkcionalita.</p>
        <p>POST /api/ai/text vyžaduje aktívnu prihlásenú reláciu admina alebo veterinára, nie API kľúč. Výstup je neuložený návrh na kontrolu. Otázky sa posielajú jednotlivo bez histórie.</p>
        <pre className="overflow-auto rounded border p-4">{`Content-Type: application/json
{ "prompt": "Uprav tento všeobecný oznam...", "maxTokens": 1024, "temperature": 0.1 }`}</pre>
        <p>Limit: 32 KiB JSON cez REST, 8 000 znakov promptu, najviac 2 048 výstupných tokenov, teplota 0–0.3. Zdieľaný rozpočet textových volaní: 10 za minútu na používateľa a 100 za 24-hodinové okno na prax. Nie je to menový limit.</p>
        <p>Server: AI_TEXT_ENABLED=true, AI_MODEL a príslušný kľúč. Žiadne kľúče ani URL od klienta. Stav konfigurácie vracia tRPC ai.configuration bez tajných údajov; nepotvrdzuje dostupnosť poskytovateľa.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Externé klinické zápisy</h2>
        <p>POST /api/v1/soap-notes vyžaduje API key scope records:write. Vytvorí klinický záznam — nejde o chatový návrh ani automatické schválenie veterinárom. Integrátor musí zabezpečiť kontrolu a správne patient_id, appointment_id a author_id. Nevkladajte vzorové alebo nevygenerované klinické fakty.</p>
        <p>POST /api/v1/appointments vyžaduje appointments:write. GET klientov, pacientov a termínov používa príslušné read scopes. Úplný kontrakt je v docs/api/README.md.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Dashboard Query Helpers</h2>
        <p>Session-authenticated tRPC queries, not API-key REST endpoints. Nie sú prepojené s chatom.</p>
        <ul className="list-disc pl-6">
          <li>tRPC: ai.patientsOverdueVaccinations (session cookie)</li>
          <li>tRPC: ai.patientsNeedingFollowUp (session cookie)</li>
          <li>tRPC: ai.dailySummary (session cookie)</li>
          <li>ai.draftSoapNote vytvorí návrh z vybranej karty; neuloží SOAP záznam. Vyžaduje admina/veterinára a kontrolu pred uložením.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Webhooky</h2>
        <p>Správa odberov: webhooks.create cez prihlásený dashboard. Podpísané udalosti treba overovať; doručenie nie je zárukou okamžitého vykonania.</p>
        <ul className="list-disc pl-6">{WEBHOOK_EVENT_DEFINITIONS.map((event) => <li key={event.event}>{event.event}</li>)}</ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Vyradené a neoverené funkcie</h2>
        <p>Staré /api/ai-models (vrátane active/test) a šesť /api/ai provider proxy endpointov vracajú 410 Gone. Neukladajú ani nevracajú modelové kľúče a neposielajú žiadosti poskytovateľom.</p>
        <p>Audio/image analysis a automatická diagnostika sú nedostupné. docs/ai-configuration.md opisuje migráciu; docs/pilot/README.md obsahuje postupné lokálne prípady. Úspešný build ani health check nie sú klinické overenie.</p>
      </section>
    </main>
  );
}
