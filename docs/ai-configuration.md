# AI configuration, compatibility and known gaps

This describes the current checkout, not a promise about a deployed instance.
Start local verification with [pilot/README.md](pilot/README.md).
Use Node 22.22.2+ on the 22.x LTS line (tested here on 22.22.3), or another
line allowed by package.json engines. The old Node 20+ advice was incompatible
with the currently locked DOMPurify/Undici dependency engines.

## Capability inventory

| Surface | Current behavior | Configuration / authority |
|---|---|---|
| Agent page / `POST /api/ai/text` / `ai.generalText` | One-shot unsaved text draft, no chart retrieval, no tools, no clinical record write, no chat history sent | Active authenticated admin/veterinarian; hosted mutation and `agent` feature entitlement; server configuration below |
| `ai.configuration` | Safe model/provider/readiness/problem metadata, never a key | Active authenticated dashboard session; configuration presence only |
| `ai.draftSoapNote` | Generates an unsaved draft from a tenant-owned selected patient; clinician reviews and saves separately | Admin/veterinarian; same model/key/enable switch; existing draft limits plus shared text budget |
| `ai.patientsOverdueVaccinations`, `ai.patientsNeedingFollowUp`, `ai.dailySummary` | Deterministic tenant-scoped data queries, not LLM retrieval and not wired to chat | Authenticated dashboard session; no provider key needed |
| `POST /api/v1/soap-notes` | Creates a clinical record, not merely a draft | Practice API key with `records:write`; validate external reviewer and authorship workflow separately |
| `/api/v1/agent` / `agent` tRPC router | **Not implemented** | Reserved `agent:run` / `agent:write` scopes are not capabilities |
| Six legacy `/api/ai/{openai,anthropic,google}[-vision]` routes | `410 Gone`, no body parsing, DB access or provider call | No enable switch restores them |
| `/api/ai-models`, `/active`, `/test` | `410 Gone`; browser-managed global credentials retired | Legacy rows remain in DB; not automatically migrated/deleted |
| Audio consultation start/upload and image/clinical-analysis actions | Unavailable; no new audio capture or model processing | Separate safety/design work required; do not try to enable via a provider key |
| `clinicalAi.getSession` / `applyToRecord` | Clinician-only read / explicit save of a completed same-patient, same-practice session; active patient required | Not autonomous; repeat-save idempotency still needs review |
| Marketing text | REST uses the governed text caller; tRPC marketing text uses shared model/budget and meters successful calls | Text enable switch required; tRPC marketing retains its existing staff roles; fallback variants carry generated=false and are labeled as templates, not AI evidence; marketing image generation is unavailable |

## Server environment

```env
# Default safe state. No model calls until deliberately enabled.
AI_TEXT_ENABLED=false
AI_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=
# Legacy fallback when AI_MODEL is blank, not a tool-agent setting:
AGENT_MODEL=
```

Set **only the matching credential** and use a bare model ID:

| Model pattern | Required server credential |
|---|---|
| `claude-*` | `ANTHROPIC_API_KEY` |
| `gemini-*` | `GOOGLE_API_KEY`, legacy fallback `GOOGLE_GENERATIVE_AI_API_KEY` |
| `gpt-*`, `o1`, `o3`, `o4` and their hyphenated variants | `OPENAI_API_KEY` |

Blank values are trimmed. Blank `AI_MODEL` falls back to `AGENT_MODEL`, then
`claude-sonnet-4-6`. URLs, provider prefixes and unknown model families fail
configuration validation. A recognized name and a nonblank key do not prove
provider access, region availability, quotas or compatibility with every parameter.
Run an approved synthetic provider smoke test on the actual selected model.
Some reasoning models may reject temperature/output options; this is a local
verification case, not claimed as universal model compatibility.

Clients cannot choose provider URL, key or model. `modelId` in legacy UI request
types is ignored. Unsupported token/temperature settings are rejected, not
silently transformed. API-key authentication does not authorize `/api/ai/text`.

`AI_TEXT_ENABLED=false` stops **new** calls using the shared text configuration,
including SOAP and marketing text; it does not cancel in-flight requests, revoke
credentials, disable deterministic helpers or block explicit clinical-record saves.
Environment changes may require restart/redeployment. Revoke at provider/ingress
for incident containment when needed. Audio/image processing stays unavailable.

## Limits and observability

- Text REST input: JSON content type, streamed 32 KiB body cap; schema: trimmed
  prompt 1–8,000 characters, maxTokens 1–2,048, temperature 0–0.3. Defaults 1,024/0.1.
- Shared durable text budget: 10 attempts/minute per practice+user, 100 attempts
  per practice per 24-hour fixed window (starts at first use, not clinic midnight).
  SOAP also retains its existing draft-specific throttle. Marketing variants can
  consume several calls; failures/templates may consume budget too.
- Provider timeout: 30 seconds per call, no automatic SDK retries. Multiple
  marketing subcalls can take longer overall; review request-wide latency locally.
- Successful calls record hosted usage; self-host does not meter. Local token
  counts are not a price quote; the legacy facade's `cost: 0` means **not
  calculated**, not free. Request ceilings are not EUR spending caps.
- AI prompt/visitContext/transcription fields are redacted from mutation audit
  payloads. Auditing remains best-effort; it is not a complete AI trace system.
- Provider failures are generic on governed text routes; do not log raw provider
  errors, credentials, audio or chart text in new code/tests.
- `/api/health` can report core readiness with AI intentionally disabled. When
  enabled, hosted AI readiness checks configuration only, not provider inference.
  AI Settings exposes configuration problems for self-host as well.

## Migration and breaking changes

1. Stop clients that rely on browser-supplied provider secrets/custom endpoints.
2. Review prior exposure privately. If legacy AI settings were publicly reachable,
   assess access logs and rotate potentially affected keys through secret management.
   Do not claim an incident occurred without evidence.
3. Configure new provider credentials **server-side**. Do not copy legacy rows to
   the browser or new routes. No automated destructive cleanup is included.
4. Check authorized/deleted-account/viewer/other-role behavior, limits, disabled
   mode, provider failures and sanitized errors locally before enabling generation.
5. Retain legacy data only under the approved retention policy. DB credentials,
   provider secret storage/encryption, backup access and old logs require an
   operator-reviewed cleanup, not an agent's blind deletion script.

Image/audio, clinical decision support and browser model editing are deliberately
unavailable, not silently replaced with fake analyses. Some older feature pages
still assume database-selected models; they must be migrated or explicitly marked
unavailable case by case. Do not loosen retired routes to make those screens work.

## Configuration preflight (no network)

```sh
# Inherit the app environment through the shell/secret store, or locally:
node --env-file=.env scripts/pilot-check.mjs
# With the required env already exported:
pnpm pilot:check
pnpm pilot:check:test
```

The checker prints check names and corrective guidance, never env values. Exit 1
means a configuration error; warnings/unverified checks remain launch blockers
where applicable. It always reports `livePilotReady: false`: configuration presence
cannot certify a pilot. It flags missing DB/storage/app origins, example auth
secrets, owner DB role, local storage defaults, wrong model/key selection, origin
mismatch, demo/auth-link exposure and skipped RLS assertions. It does not fetch,
read `.env` automatically, migrate, seed, reset or check provider billing.

## Docker/local configuration corrections

- Both supplied Compose files publish Postgres on **127.0.0.1:5434**. Native Next
  development uses a host `DATABASE_URL` on that port; adjust only if using a
  different Postgres installation. The previous example incorrectly used 5432.
- Full Docker web now uses **DOCKER_DATABASE_URL** (hostname `postgres`, port
  5432), not the host's `DATABASE_URL`. Its local default is an owner connection;
  for a pilot explicitly supply the restricted app-role connection after setup.
  Compose does not create/migrate that role or schema automatically.
- Supplied Compose is a **self-host/local** stack, not a complete Cloud deployment:
  it does not forward the full hosted billing/email/ops environment. Setting
  `HOSTED_BILLING_ENABLED=true` in the host `.env` alone is not sufficient.
  Use a reviewed deployment override supplying all hosted variables and verify
  `/api/health` reports the intended mode; never assume Cloud gates are active.
  Its S3 endpoint is the internal MinIO service; external object storage requires
  an explicit Compose override as well.
- MinIO root credentials and S3 credentials must agree (or use an explicitly
  provisioned bucket-scoped S3 identity). Bootstrap uses configured root values
  and `S3_BUCKET`; do not assume changing only one side works. Existing volumes
  retain existing credentials/data; env edits are not a credential rotation.
- Full Docker forwards text-AI envs at runtime. `NEXT_PUBLIC_APP_URL` and the
  Jaaz visibility flag also have **build-time** args: rebuild for browser changes.
  AI/provider secrets are runtime-only, not build args. Jaaz is optional, disabled
  in the UI by default, requires a separate `../jaaz` checkout/profile and has
  its own model/secret governance; the text enable switch is not a global stop
  for external services.
- DB, MinIO API/console and optional Jaaz host ports are loopback-only by default.
  The web port remains reachable for browser preview. For real hosting, use a
  reviewed TLS ingress and explicit networking, not these local defaults.
- Use `docker compose -f docker/docker-compose.yml config --quiet` locally to
  validate interpolation without printing resolved secrets. This sandbox had no
  Docker CLI; YAML syntax alone was checked, not container operation.

Follow the local queue for deployed-role RLS, source correctness, full recovery,
provider behavior, stale UI copy and lifecycle checks. Source changes and unit
tests are not substitutes for those proofs.
