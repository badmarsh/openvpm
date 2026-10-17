# Lokálny agent: overenie a postupné doplnenie OpenVPM pilotu

**Vstupný bod pre coding agentov.** Tento návod je verzovaný; súkromný pôvodný
`LAUNCH-PILOT-2026-10-20.md` a `.pilot-evidence/` nie sú potrebné na pokračovanie.
Cieľ: bezpečný sedemdňový pilot, príprava 17.–19. 10. 2026, podmienený štart
20. 10., vyhodnotenie 26. 10. Nejde o potvrdenie produkčnej pripravenosti.

## Prompt na vloženie do lokálneho agenta

```text
Pracuj ako lokálny implementačný a verifikačný agent OpenVPM.
Najprv čítaj .agents/AGENTS.md, docs/ai-configuration.md a docs/pilot/README.md.
Preskúmaj aktuálny kód; staré README tvrdenia ani tento dokument nie sú dôkaz
správania bežiacej aplikácie. Nežiadaj všeobecné potvrdenie každého kroku.
Samostatne rob reverzibilné lokálne opravy a testy so syntetickými dátami.

Zisti dostupný lokálny server, port, procesy a konfiguráciu bez vypísania tajných
hodnôt. Použi existujúcu lokálnu dev inštanciu, ak je bezpečne oddelená. Ak
potrebuješ novú DB, vytvor izolovanú scratch DB štandardným postupom projektu.
Nikdy neresetuj, neseeduj ani nemigruj existujúcu databázu bez dokázania, že je
určená na tento test. Produkciu, reálne dáta, platené provider volania a externé
správy nepovažuj za automaticky schválené. Pri chýbajúcom prístupe zaznač BLOCKED
a pokračuj ďalším nezávislým prípadom; bezpečnostnú podmienku neobchádzaj.

Postupuj po fázach a po jednom prípade. V docs/pilot/cases.csv sú R01–R30;
ďalšie bezpečnostné a infraštruktúrne prípady sú v tomto návode.
1. Vyber prvý dostupný nedokončený prípad s najvyššou prioritou.
2. Zaznač IN_PROGRESS, svoj identifikátor, revision a vstupné podmienky.
3. Pred opravou reprodukuj problém. Urči očakávaný výsledok z fixture/kontraktu,
   nie z aktuálnej odpovede modelu. Skontroluj správneho pacienta a tenant.
4. Oprav minimálnu potrebnú časť. Doplň regresný test, príslušné UI a dokumentáciu.
5. Spusť cielený test a podľa typu zmeny HTTP/browser test proti lokálnemu serveru.
6. Zaznač príkaz, exit status, očakávaný/skutočný výsledok, dôkaz a obmedzenia.
7. Až potom prejdi na ďalší prípad; na konci spusti spoločné regresie.

Stavy: NOT_RUN, IN_PROGRESS, PASS, FAIL, BLOCKED, NOT_SUPPORTED.
Vždy oddeľ SOURCE_FIXED, UNIT_VERIFIED, LOCAL_HTTP_VERIFIED,
LOCAL_BROWSER_VERIFIED, LIVE_RLS_VERIFIED a PROVIDER_VERIFIED.
PASS z mocku neznamená provider ani DB overenie. Vynechaný test nie je PASS.
NOT_SUPPORTED nie je úspešná klinická funkcionalita; oprav tvrdenie/UI alebo
vytvor malú navrhnutú implementačnú úlohu. Nikdy nevracaj vymyslenú analýzu.

Drž bezpečnostné hranice: žiadne klientské provider kľúče/URL, žiadne obnovenie
410 proxy endpointov, žiadne wildcard/write scopes pre read-only integráciu.
Textový chat nečíta karty. Nepridávaj general-purpose tool agent naraz; prípadnú
retrieval funkciu rozdeľ na autorizáciu, deterministické dáta, zdroje,
nejednoznačnosť a až potom modelové zhrnutie. Nepridávaj autonómne klinické zápisy.

Priebežne aktualizuj sanitizovaný verification-status.md a presné repro/testy.
Snímky, trace, exporty a osobné údaje patria iba do gitignored local-results/.
Ak nájdeš ďalší problém, pridaj stabilné ID, prioritu, súbor, reprodukciu,
akceptačné kritériá a závislosti; doplň podľa potreby, neprepisuj staré dôkazy.
Pri troch rovnakých neúspechoch zastav daný pokus, vysvetli príčinu a pokračuj
nezávislou úlohou. Necommituj/nepushuj bez výslovného zadania. Na konci odovzdaj
prehľad zmien, testov, otvorených P0/P1 a GO/NO-GO s dôvodmi, nie iba zoznam súborov.
```

## Poradie práce a gate-y

### Fáza 0 — prostredie a konfigurácia (CFG)

- **CFG-01 / P0:** revision, branch, Node 22.22.2+ na 22.x LTS (alebo iná línia podľa package.json engines), pnpm 9.15.0, čistota pracovného
  stromu, proces/port a browser-facing origin. Nezahadzuj cudzie zmeny.
- **CFG-02 / P0:** `node --env-file=.env scripts/pilot-check.mjs` alebo
  `pnpm pilot:check` s už exportovaným env. Ulož sanitizovaný výsledok. Oprav
  skutočne chýbajúce hodnoty, nie len `.env.example`. Nikdy nevypisuj `.env`.
- **CFG-03 / P0:** použité DB: vlastník pre migrácie vs `openpims_app` pre app.
  Skontroluj, odkiaľ Next načítava env (repo root vs apps/web); over hodnoty
  bezpečným health/config volaním, nie výpisom procesu alebo connection stringu.
- **CFG-04 / P0:** AI off, missing key, wrong-provider key, blank key, invalid model,
  legacy Google fallback, bare model ID; UI jasne ukáže problém bez tajného údaju.
- **CFG-05 / P0:** `NEXTAUTH_URL` a `NEXT_PUBLIC_APP_URL` zodpovedajú klientskému
  origin. Pri vzdialenom preview bind 0.0.0.0; browser nesmie volať sandbox localhost.
- **CFG-06 / P1:** rezervované scopes nie sú endpoint. `/api/v1/agent` je
  NOT_SUPPORTED; health green pri AI off neznamená pripraveného agenta.
- **CFG-07 / P0:** Compose port 5434 pre host, interný `DOCKER_DATABASE_URL`
  cez hostname postgres:5432, konfigurované MinIO credentials/bucket a build-time
  public URL. Spusť `docker compose -f docker/docker-compose.yml config --quiet`
  bez vypísania resolved secrets; potom izolovaný build/runtime test. Prečítaj
  Docker sekciu v docs/ai-configuration.md. Nepoužívaj host localhost URL v kontajneri.

Ak preflight nevie niečo zistiť, vypíš názov chýbajúcej konfigurácie, dôvod a
bezpečný spôsob nastavenia. Samotná prítomnosť kľúča nie je správnosť.

### Fáza 1 — bezpečnostné HTTP a roly (SEC)

Použi lokálny server a syntetické účty. Pre každý prípad over odpoveď aj absenciu
vedľajšieho účinku/provider volania; DB účet vlastníka nesmie maskovať chybu.

- **SEC-01 / P0:** všetky metódy model settings/active/test a šesť legacy proxy
  routes → `410`; žiadna DB zmena ani outbound fetch. Zámerný breaking change.
- **SEC-02 / P0:** anonymný, odhlásený, soft-deleted user/practice → odmietnutie
  `/api/ai/text`, tRPC `ai.generalText` a marketing REST pred volaním poskytovateľa.
- **SEC-03 / P0:** viewer/front_desk/technician nesmú generovať cez generalText;
  admin/vet môžu len keď je AI povolená a hosted prístup platný. Marketing tRPC
  má odlišné existujúce staff roly: zaznač a over ich, nepredpokladaj zhodu.
- **SEC-04 / P0:** `apiKey`, `endpoint`, `model`, `modelId`, `allow_writes` v texte
  REST schémy → odmietnutie ako extra polia; neprijímať ľubovoľný outbound cieľ.
- **SEC-05 / P0:** neplatný JSON, nesprávny content type, stream nad 32 KiB bez
  Content-Length, prompt >8,000, maxTokens >2,048 a temperature >0.3 → odmietnutie.
- **SEC-06 / P0:** zdieľaný 10/min actor a 100/24h tenant budget naprieč procesmi;
  iný tenant má samostatný budget; DB limiter failure → bez provider volania.
- **SEC-07 / P0:** skutočná RLS: dva tenanty, cross-tenant SELECT/INSERT/UPDATE,
  bez kontextu deny; kontrola použitej role, nie iba názvu v URL. Existujúce
  `pnpm db:rls:test` môže mať úzke pokrytie — doplň nové consultation tabuľky.
- **SEC-08 / P0:** `clinicalAi.applyToRecord` len admin/vet, dokončená session,
  rovnaký tenant a patientId, aktívny pacient, neprázdny bounded SOAP; inak nula
  INSERTov. Over FK/lookup aj pri owner DB role. Opakovaný save má otvorený prípad.
- **SEC-09 / P0:** nové audio capture/upload nedostupné; stránka nežiada mikrofón,
  service nevolá model. Image analysis neposkytuje textový fallback ako analýzu snímky.
- **SEC-10 / P0:** žiadny provider secret/prompt v response, browser storage,
  konzole, provider error alebo audit raw input. Skontroluj aj staré logy/rows
  bezpečným operátorským postupom; nič hromadne nemaž.

### Fáza 2 — funkčné prípady (R01–R30)

`cases.csv` obsahuje desať lookup, desať chart-summary a desať overdue prípadov.
Použi `synthetic-fixtures.json` ako základ, doplň schválené fixture varianty.
Pred každým testom urči konkrétny očakávaný výsledok. Verifikuj deterministickú
obrazovku/query oddelene od modelovej interpretácie.

**Dôležité:** chat bez retrieval nemôže prejsť lookup/summary prípadom ako agent.
Over existujúce pacientské UI/read helper alebo zaznač NOT_SUPPORTED pre chat.
Žiadny prompt nesmie „opraviť“ chýbajúcu autorizovanú dátovú vrstvu.

Over aj slovenčinu/diakritiku, chýbajúce dáta, duplicity, klinické konflikty,
injekciu v poznámke, ISO import a prechod letného času 25. 10. 2026. Počet
prípadov môžeš rozšíriť; zachovaj stabilné ID a pôvodné dôkazy.

### Fáza 3 — skutočný provider a UI (AI/UI)

- **AI-01 / P0:** syntetický provider smoke pre skutočný vybraný model, až keď je
  prístup/rozpočet dovolený. Over alias kľúča, max token parametre, teplotu 0,
  timeout, prázdnu odpoveď, throttling a 5xx. Neočakávaj univerzálnu podporu
  temperature pri reasoning modeloch; oprav alebo explicitne zúž konfiguráciu.
- **AI-02 / P0:** bez retrieval nesmie odpoveď tvrdiť, že videla kartu. Výstup je
  draft; žiadny zapisovací tool. Klinickú správnosť posudzuje reviewer, nie model sám.
- **AI-03 / P1:** stale AI feature stránky stále predpokladajú databázový aktívny
  model. Migrácia jednotlivo alebo jasný unavailable stav; žiadne obnovenie keys UI.
- **UI-01 / P1:** znovu overiť opravené welcome/tour/activation copy, preklady, sidebar a odkazy.
  Opravené sú hlavné docs, Agent, AI Settings, onboarding sample a základné welcome/tour/activation texty; ďalšie preklady
  môžu stále sľubovať chart retrieval. Pridaj copy regresiu pri každej oprave.
- **UI-02 / P1:** marketing fallback/templates majú source marker aj označenie vo wizard-e;
  over ho lokálne. Marketing image generation je explicitne nedostupné,
  nevracia stock URL ako AI výsledok. Over wizard
  zobrazenie pôvodu a quota failure, nie len tRPC návratový objekt.
- **AI-04 / P1:** repeat-save completed consultation: rozhodnúť explicitnú
  idempotenciu/verzovanie po klinickej kontrole; zabrániť nechceným duplicitám.

### Fáza 4 — prevádzka a recovery (OPS)

- **OPS-01 / P0:** private S3/MinIO bucket, upload/download, attachment references,
  vylúčenie reálnych mail/SMS/Stripe kľúčov z demo testov; TLS a storage health.
- **OPS-02 / P0:** backup + restore do samostatnej fresh practice: counts,
  relácie, chart/invoice sample, binárne prílohy, password reset, reissued keys,
  deaktivované/rotované webhook secrets. JSON nie je záloha príloh.
- **OPS-03 / P0:** skutočné cron/heartbeat/alert doručenie a meraný RPO/RTO.
  Historické časy z runbooku neprepisovať ako nový úspešný drill.
- **OPS-04 / P0:** AI_TEXT_ENABLED=false + reštart zastaví nové text call-y;
  in-flight môže dobehnúť. Rehearsal ingress stop/revoke. Pôvodný PIMS ostáva
  autoritatívny; nedowngraduj slepo DB schému pri rollbacku aplikácie.
- **OPS-05 / P1:** provider/hosting EUR spend z billing zdrojov, nie `cost: 0`.
  Request rate limits nie sú finančný hard cap. Potvrď monitoring a stop control.

## Príkazy a prostredie

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm pilot:check:test
# S env už exportovaným (nečíta .env automaticky):
corepack pnpm pilot:check
corepack pnpm type-check
corepack pnpm --filter @openpims/web test
corepack pnpm build
```

Ak Turbo nevie nájsť pnpm, použi nainštalovaný pnpm 9.15.0/Corepack shim na PATH.
Nemeň package manager/lockfile verzie len na obídenie chyby prostredia.
Pre server používaj process manager; neštartuj duplicitu na už obsadenom porte.
Projekt má `pnpm dev:deps` pre Docker závislosti; pred použitím prečítaj compose.
Neaplikuj `dev:setup` na existujúcu DB: obsahuje push/seed. Pre trvalé dáta použi
committed migrations. `db:rls`/`db:rls:test` vyžadujú správny owner setup env;
app sa potom pripája restricted rolou. Zdokumentuj cieľ bez tajných hodnôt.

Playwright: `PLAYWRIGHT_BASE_URL` a podľa potreby `PLAYWRIGHT_WEB_SERVER_COMMAND`.
Použi konkrétny `.spec.ts`, nie všetky screenshot/seeding testy bez kontroly.
Pre restore pozri `e2e/restore-drill.spec.ts` a `docs/backup-restore-runbook.md`;
vyžaduje scratch server, privátny backup path a dostupný browser. Over selector
jazyk: niektoré existujúce testy očakávajú angličtinu.

## Výsledky, koordinácia a rozširovanie

- Jeden agent naraz vlastní rovnaký prípad/súbory. V lokálnom scratch ledgeri
  zaznač owner a čas. Nepracuj súčasne na auth/DB kóde bez koordinácie.
- Podrobnosti ukladaj do `docs/pilot/local-results/` (gitignored); súbor výsledku
  podľa [result-template.md](result-template.md). Screenshots/traces môžu niesť dáta.
- Do `verification-status.md` patrí iba sanitizovaný stručný stav, revision,
  príkazy a limity dôkazov. Žiadne env values, osobné údaje ani provider bodies.
- Keď niečo dopĺňaš: test reprodukcie → minimálny fix → regresia → lokálne UI/HTTP
  overenie → docs/status. Ak chýba infra/prístup, BLOCKED, nie falošný PASS.

## Sedem dní po splnení gate-ov

20. 10. dvaja supervisovaní champions; 21. 10. ďalší schválení staff; 22. 10.
lookup/summary meranie; 23. 10. overdue porovnanie bez odosielania klientom;
24. 10. náklady/chyby; 25. 10. recovery + DST; 26. 10. stop/extend/expand.
Zatvorený deň je operátorská kontrola, nie klinické využitie. Ak P0 neprejdú,
20. 10. rob len offline/syntetické hodnotenie.

Aspoň 30 matched baseline/pilot úloh, vrátane kontroly a opráv; >=95% prijatých
faktických odpovedí (pri 30 aspoň 29), >=20% úspora median času, >=95% úspešných
requestov v dohodnutých oknách, nula kritických/tenant/write incidentov a náklady
v odsúhlasenom strope. Kritická chyba ruší agregovaný úspech. Bez vzorky/zdrojov
EXTEND, pri P0 STOP; EXPAND iba pri splnení všetkých gate-ov a schválení klinickým,
dátovým a technickým vlastníkom. Sedem dní nie je klinická certifikácia.
