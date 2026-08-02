import { WEBHOOK_EVENT_DEFINITIONS } from "@/lib/webhook-events";

export default function AIIntegrationDocs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-600">
            
            Dokumentácia pre vývojárov
          </p>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            
            Sprievodca integráciou AI
          </h1>
          <p className="text-lg text-gray-600">
            
            Pripojte nástroje AI k OpenVPM pre automatizované klinické pracovné postupy,
            inteligentné dotazy a spracovanie udalostí v reálnom čase.
          </p>
        </div>

        {/* Overview */}
        <Section id="overview" title="Prehľad">
          <p className="mb-4 text-gray-700">
            
            OpenVPM je navrhnutý tak, aby bol <strong>AI-prvá</strong>. Každý klinický
            akcia — vytváranie poznámok SOAP, dotazovanie záznamov pacientov,
            sledovanie očkovania – je dostupné prostredníctvom štruktúrovaného API. Toto
            znamená, že môžu zapisovatelia AI, hlasoví agenti a asistenti palubnej dosky
            integrovať priamo do vášho systému riadenia praxe.
          </p>
          <p className="text-gray-700">
            
            Pracovné postupy palubnej dosky používajú <strong>tRPC</strong>  cez HTTP s
            relácia prihláseného používateľa. Externé integrácie môžu používať kľúče API
            pre <strong>/api/v1</strong>  koncové body vrátane koncového bodu agenta
            s <strong>agent:run</strong>  rozsah. Agent s povoleným zápisom beží
            tiež vyžadujú <strong>agent:napíš</strong>  plus každý písať
            rozsah základného zdroja nástroja. Všetky žiadosti sa vzťahujú na
            overená prax; zapisuje klinický záznam, napríklad poznámku SOAP
            vytvorenie vyžaduje <strong>záznamy:písať</strong>.
          </p>
        </Section>

        {/* API Key Agent Endpoint */}
        <Section id="api-key-agent" title="Koncový bod kľúčového agenta API">
          <p className="mb-4 text-gray-700">
            
            Pre automatizáciu server-to-server vytvorte kľúč API v Nastaveniach s <strong>agent:run</strong>  rozsah a zavolajte agenta REST
            koncový bod. Použiť <code>allow_writes: false</code>  len na čítanie
            súhrny. Na nastavenie <code>allow_writes: true</code>, udeliť
            <strong>agent:napíš</strong>  ako aj rozsah zdrojov
            dôveryhodný pracovný tok môže mutovať, ako napríklad
            <strong>termíny:napíšte</strong>  alebo
            <strong>záznamy:písať</strong>.
          </p>

          <CodeBlock>
            {`curl -X POST https://your-practice.openvpm.com/api/v1/agent \\
  -H "Authorization: Bearer ovpm_<key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instruction": "Summarize today's checked-in appointments and flag overdue vaccines.",
    "allow_writes": false
  }'`}
          </CodeBlock>
        </Section>

        {/* SOAP Note Integration */}
        <Section id="soap-notes" title="Integrácia SOAP Note">
          <p className="mb-4 text-gray-700">
            
            Pripojte zapisovateľa AI – napríklad{" "}
            <strong>Scribenote</strong>, <strong>VetRec</strong>alebo{" "}
            <strong>HappyDoc</strong>  — na automatické vyplnenie SOAP
            poznámky po každom stretnutí. AI počúva konzultácie,
            generuje štruktúrované klinické poznámky a posiela ich priamo do
            OpenVPM.
          </p>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
            
            Koncový bod
          </h3>
          <CodeBlock>
            {`POST /api/v1/soap-notes

Authorization: Bearer ovpm_<key>
Content-Type: application/json`}
          </CodeBlock>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
            
            Vstupná schéma
          </h3>
          <CodeBlock>
            {`{
  "patient_id": "uuid",          // Required - the patient record
  "appointment_id": "uuid",      // Optional - link to appointment
  "author_id": "uuid",           // Optional if appointment has a doctor
  "subjective": "string",        // Patient history, owner complaints
  "objective": "string",         // Physical exam findings, vitals
  "assessment": "string",        // Diagnosis, differential list
  "plan": "string",              // Treatment plan, follow-up
  "source": "string"             // Required - e.g. "scribenote", "vetrec"
}`}
          </CodeBlock>
          <p className="mt-3 text-sm text-gray-500">
            
            Vytvorte kľúč pomocou <strong>záznamy:písať</strong>  rozsah.
            OpenVPM overí pacienta, voliteľné stretnutie a autora
            proti overenej praxi pred vložením poznámky.
          </p>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
            
            Príklad (cURL)
          </h3>
          <CodeBlock>
            {`curl -X POST https://your-practice.openvpm.com/api/v1/soap-notes \\
  -H "Authorization: Bearer ovpm_<key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_id": "a1b2c3d4-...",
    "appointment_id": "b2c3d4e5-...",
    "subjective": "Owner reports decreased appetite x3 days...",
    "objective": "T: 101.5F, HR: 120, RR: 24. Mild dehydration...",
    "assessment": "Suspect early-stage renal disease...",
    "plan": "CBC/Chem panel, urinalysis. Recheck in 2 weeks.",
    "source": "scribenote"
  }'`}
          </CodeBlock>
        </Section>

        {/* Dashboard Query Helpers */}
        <Section id="dashboard-query-helpers" title="Pomocníci dotazov na informačnom paneli">
          <p className="mb-6 text-gray-700">
            
            Tieto postupy tRPC môžu používať prihlásení dashboardy
            použiteľné klinické poznatky. Vyžadujú súbor cookie relácie a sú
            nie koncové body REST s kľúčom API; by sa mali používať integrácie server-to-server <strong>/api/v1</strong>  Povrch REST a podpísané webhooky.
          </p>

          <QueryCard
            name="Overdue Vaccinations"
            endpoint="tRPC: ai.patientsOverdueVaccinations (session cookie)"
            description="Vráti pacientov, ktorých očkovanie je po termíne. Užitočné pre kampane s automatickými pripomienkami alebo pre dosah AI."
            response={`[
  {
    "patientId": "uuid",
    "patientName": "Bella",
    "species": "canine",
    "clientName": "Jane Smith",
    "vaccineName": "Rabies",
    "nextDueDate": "2025-11-15",
    "daysOverdue": 42
  }
]`}
          />

          <QueryCard
            name="Patients Needing Follow-Up"
            endpoint="tRPC: ai.patientsNeedingFollowUp (session cookie)"
            description="Identifikuje pacientov navštívených za posledných 7 dní (odhlásení), ktorí nemajú naplánované budúce stretnutie. Ideálne pre pracovné postupy proaktívnej starostlivosti."
            response={`[
  {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "patientName": "Max",
    "species": "feline",
    "clientName": "John Doe",
    "lastVisit": "2026-03-14T15:30:00Z"
  }
]`}
          />

          <QueryCard
            name="Daily Practice Summary"
            endpoint="tRPC: ai.dailySummary (session cookie)"
            description="Vráti súhrnný pohľad na dnešnú cvičnú aktivitu. Ideálne pre miniaplikácie dashboardu AI, ranné brífingy alebo správy na konci dňa."
            response={`{
  "date": "2026-03-17",
  "appointments": {
    "total": 24,
    "byStatus": {
      "scheduled": 5,
      "checked_in": 3,
      "in_exam": 2,
      "checked_out": 12,
      "no_show": 1,
      "cancelled": 1
    }
  },
  "patientsSeen": 14,
  "soapNotesCreated": 11,
  "invoicesPaid": 8
}`}
          />
        </Section>

        {/* Webhook Events */}
        <Section id="webhooks" title="Webhook Udalosti">
          <p className="mb-4 text-gray-700">
            
            Prihláste sa na odber udalostí v reálnom čase pre reaktívne pracovné postupy AI. Kedy
            niečo sa stane v OpenVPM, váš systém AI dostane upozornenie
            okamžite.
          </p>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              
              Dostupné akcie
            </h3>
            <div className="space-y-3">
              {WEBHOOK_EVENT_DEFINITIONS.map((definition) => (
                <EventRow
                  key={definition.event}
                  event={definition.event}
                  description={definition.description}
                />
              ))}
            </div>
          </div>

          <CodeBlock>
            {`// Webhook payload format
{
  "event": "appointment.created",
  "timestamp": "2026-03-17T09:15:00Z",
  "data": {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "patientName": "Bella",
    "clientId": "uuid",
    "source": "dashboard"
  }
}`}
          </CodeBlock>

          <p className="mt-4 text-sm text-gray-500">
            
            Správcovia môžu vytvárať odbery webhooku v Nastaveniach alebo cez
            <code>webhooks.create</code>  API. Podpisové tajomstvo sa raz vráti
            v čase stvorenia.
          </p>
        </Section>

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>
            
            Cloud OpenVPM
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable components                                                 */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-sm leading-relaxed text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

function QueryCard({
  name,
  endpoint,
  description,
  response,
}: {
  name: string;
  endpoint: string;
  description: string;
  response: string;
}) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{name}</h3>
      <code className="mb-3 block text-sm text-teal-600">{endpoint}</code>
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        
        Odpoveď
      </p>
      <CodeBlock>{response}</CodeBlock>
    </div>
  );
}

function EventRow({
  event,
  description,
}: {
  event: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <code className="shrink-0 rounded bg-teal-50 px-2 py-1 text-sm font-medium text-teal-700">
        {event}
      </code>
      <span className="text-sm text-gray-600">{description}</span>
    </div>
  );
}
