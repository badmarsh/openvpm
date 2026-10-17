# Verification status — handoff snapshot

**Date:** 17 October 2026. **Base revision:** `de43c2c4284d9ad93ee02d77d3cebb5df63375ef`.
Implementation is the uncommitted working tree on `arena/ff42e754-openvpm`.
Do not infer a deployed revision from this document; record the local revision
and diff when continuing. No production deployment or real-data migration ran.

## Changes implemented

- Retired six client-credential/provider proxy handlers and model settings,
  active-model and test endpoints (`410`, no DB/provider side effects).
- Added session-authenticated bounded `/api/ai/text` delegating to governed
  `ai.generalText`: admin/vet, hosted entitlement, server model/key selection,
  shared durable quotas, output cap, timeout, no automatic retries, generic errors.
- Added safe configuration metadata and server-only settings UI; AI disabled by
  default. No custom provider endpoints. OpenAI SDK aligned to AI SDK v6-compatible
  v3 provider protocol; removed SOAP type-error suppression and hardcoded model.
- Active-account context now re-reads role/email/name from DB each request,
  without the previous positive authorization cache. Role downgrade/deletion
  regression tests added. This adds a DB query per authenticated context;
  production performance remains to be measured.
- SOAP and marketing text share configuration/quotas; action callers no longer
  bypass the governed text path. Prompt/context/transcription audit redaction added.
- Clinical capture/audio processing unavailable; old processing service cannot
  call providers. Existing-session read/save requires clinician role; save checks
  completed session, matching tenant/patient, active patient and bounded nonempty
  SOAP. No claim of idempotent repeat-save or validated audio workflow.
- Removed fake marketing AI stock-image success; image generation unavailable.
  Marketing text fallback variants carry `generated=false` and wizard labels.
- Corrected primary README/roadmap/API/help/hosted docs, Agent/AI Settings,
  onboarding, welcome/tour and activation text. Agent no longer advertises chart
  retrieval, hardcoded model ID or diagnosis suggestions. Restored guide anchors,
  prefilled safe prompt and success signal; browser integration still untested.
- Added tracked local-agent queue, 30 R-cases, two-tenant synthetic fixture data,
  scorecards, result template and safe configuration preflight.
- Corrected documented Node support to match locked dependency engines.
- Corrected `.env.example` host Postgres port to 5434; separated Docker's internal
  `DOCKER_DATABASE_URL` from the native host connection; added AI env forwarding,
  configurable auth/app origins and build-time public app URL/Jaaz flag.
- MinIO bootstrap now uses configured credentials/bucket; Postgres health check
  uses configured DB/user. DB/MinIO/Jaaz published ports bind loopback by default.
  Docker build context excludes secret env files and private evidence artifacts.

## Executed checks

| Check | Result / evidence boundary |
|---|---|
| Frozen-lockfile install after dependency change | PASS, pnpm 9.15.0 / Node 22.22.3 |
| Workspace `pnpm type-check` | PASS, 2 configured tasks |
| Web Vitest full suite | PASS: **194 files passed, 55 skipped; 1,861 tests passed, 339 skipped** |
| Config checker Node tests | PASS: **4 tests**; missing values, no secret echo, disabled AI, matching-key selection, unsafe flags/origins/example secrets |
| Web lint | PASS exit 0, **0 errors / 198 warnings**. Warnings remain; not claimed lint-clean |
| Production `pnpm build` | PASS on final rerun, ~2m54s; i18n dynamic-render logging remains. This is the Node app build, not a Docker build |
| `git diff --check` | PASS at handoff |
| Both Compose YAML documents | Syntax parsed with PyYAML in an isolated tool venv; **Docker interpolation/build/runtime NOT tested** |
| Sandbox config preflight | Expected FAIL: no exported DATABASE_URL, NEXTAUTH_SECRET, app origins or S3 envs; AI disabled. This describes the sandbox shell, not the user's local instance |

The first expanded full suite found a translation-scope guard violation in the
new docs tests. Test assertions were changed to English contract/config markers;
the complete rerun above passed. Old skipped docs tests were replaced with active
current-surface checks rather than preserving incorrect expectations.

Original private characterization tests reproduced vulnerabilities on the base
revision. They are historical evidence, not current acceptance tests. Use the
new tracked denial/config/text/clinical regression tests for current behavior.

## Not executed / still launch-gating

- Local HTTP/browser verification with signed-in test roles, account deletion,
  role downgrade, disabled provider state, UI transitions and error handling.
- Live RLS with actual `openpims_app`, new clinical-session table policy coverage,
  cross-tenant writes and transaction-context verification.
- Actual provider inference/quotas/model-parameter compatibility, latency,
  clinical correctness, prompt injection evaluation and billing reconciliation.
- Docker `config --quiet`, build and runtime; configured bucket/credentials,
  app/container DB URLs, public build-time URL and optional Jaaz profile.
- Attachment upload/download and full backup/restore with access reactivation,
  real alert/cron heartbeat delivery and measured RPO/RTO.
- All 30 R-cases: templates are **NOT_RUN**, not successful pilot results.
- Remaining legacy AI feature screens/translations, repeat-save consultation
  idempotency, request-wide marketing latency and full durable AI action trace.

## Decision

**NO-GO for a live-data practice-aware AI pilot.** Retrieval/tool agent remains
NOT_SUPPORTED. P0 infrastructure, access/data handling and workflow gates are
unverified. A safe synthetic/local evaluation may proceed case by case under
[README.md](README.md); never report this as live clinical launch or certification.

Next agent: begin CFG-01/CFG-02, then SEC. Reproduce each behavior against the
actual local dev instance, fix minimally, add tests and update this sanitized
snapshot without replacing prior run evidence. No generic confirmation loop is
needed for safe reversible local work; unavailable access remains BLOCKED.
