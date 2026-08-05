# OpenVPM ⟷ Social Studio Integration — Execution Megaprompt (v2)

**Audience:** whichever engineer/agent executes this (human, Claude Code, or a
future chat session with repo access).

**Status:** Phase 0 pre-flight verification is **COMPLETE**. All five exit
criteria are answered below with facts confirmed directly against the repo
(verified via Desktop Commander, 2026-08-03) — not assumptions. Start
execution at Phase 1. Two items are flagged **OPEN DECISION** and must be
confirmed with the requester before the relevant step; everything else is
ready to execute as written.

**Repos:**
- `C:\Users\marek\Documents\Vet\OpenVPM` (target monorepo)
- `C:\Users\marek\Documents\Vet\OpenVPM-Social-Studio` (source prototype —
  read-only reference, do not edit. Confirmed stack: Bun + Vite + Firebase —
  unrelated to the target repo's Next.js/pnpm/Postgres stack, kept only for
  reading prototype logic.)

---

## 0. Operating rules (apply to every phase below)

1. **Surgical edits only.** Use targeted diffs (`str_replace` / equivalent).
   Never regenerate a whole file when a few lines change, except the two new
   `packages/db/data/{sk,en}/index.ts` additions in Phase 2, which are
   append-only.
2. **Backend business logic, RLS, RBAC, and rate limiting are frozen.** The
   only backend edits allowed are described explicitly in Phase 2 (moving seed
   *data* out of routers and adding a locale parameter to 3 mutations). If you
   think something else needs to change, stop and flag it — don't just do it.
3. **No `any`, no `@ts-ignore`, no `// TODO` placeholders.** If something is
   incomplete, it is not done.
4. **One git commit per phase**, on a branch like
   `integration/social-studio-cleanup`. Commit message = phase name +
   one-line summary. Do not squash across phases — reviewers need to see the
   seed-data move separately from the i18n extraction separately from the UI
   polish.
5. **Every phase ends with a verification step.** Do not start the next phase
   until the current phase's verification step passes.
6. **Report back after each phase** with: files touched, line counts
   before/after, and the verification output (paste the actual terminal
   output, not a summary of it).
7. **Two OPEN DECISIONs below block specific steps** (Phase 1.2 and part of
   Phase 4.1). Do not resolve them unilaterally — stop and ask the requester,
   exactly as this document's own rule #2 already requires for schema changes.

---

## 1. Repo map (confirmed against files on disk, 2026-08-03)

| Module | Frontend location | Lines | Backend router | Seed constant | Seed mutation |
|---|---|---|---|---|---|
| Marketing | `apps/web/app/(dashboard)/marketing/page.tsx` | 264 (confirmed) | `apps/web/server/routers/marketing.ts` (335 total) | `SEED_TEMPLATES` @ lines 13–86 | `seedDefaultTemplates` |
| Marketing (planner) | `.../marketing/planner/page.tsx` | 355 | same router | — | — |
| Marketing (reviews) | `.../marketing/reviews/page.tsx` | 266 | same router | — | — |
| Automations | `apps/web/app/(dashboard)/automations/page.tsx` | 252 | `apps/web/server/routers/automations.ts` | `DEFAULT_AUTOMATIONS` @ lines 8–53 | `seedDefaultAutomations` |
| Canvas | `apps/web/app/(dashboard)/documents/page.tsx` **(folder is `documents`, not `canvas` — confirmed, stays that way, see §0.4)** | 344 | `apps/web/server/routers/canvas.ts` (379 total) | `MASTER_DOCUMENTS` @ lines 31–219 | `seedMasterDocuments` |

Confirmed facts:
- All three seed mutations follow an identical shape: check-if-exists
  (idempotent) → bulk insert practice-scoped rows. This is a **live
  per-tenant runtime path**, not just an offline dev-seed script — treat it
  with the same care as any other mutation.
- `canvas.ts` also defines `CANVAS_ALLOWED_TAGS` / `CANVAS_ALLOWED_ATTR` /
  `sanitizeCanvasHtml()` using `isomorphic-dompurify`. **Do not touch this —
  it's the XSS/prompt-injection guard already implemented. Leave exactly as
  is.**
- `marketing/page.tsx` (confirmed by direct read): currently has a
  `STATUS_CONFIG` object with Slovak labels (`"Koncept"`, `"Na schválenie"`,
  etc.) hardcoded directly in the map, keyed by post status. This is exactly
  the "strings embedded in constant maps" case Phase 3.1 needs to extract —
  confirmed present, not hypothetical.
- The localized seed-data architecture at `packages/db/data/{sk,en}/index.ts`
  is real and already wired: `packages/db/package.json` has
  `"db:seed": "tsx seed.ts"` and `"db:seed:sk": "cross-env SEED_LOCALE=sk tsx
  seed.ts"`. This is the **dev-only** seed path — separate from the live
  per-tenant mutation locale logic in Phase 2, though both will read from the
  same `data/{sk,en}` exports.
- `packages/db/schema/practices.ts`: **confirmed no `locale` column exists.**
  `country` (varchar(2), ISO 3166-1 alpha-2, **NOT NULL, default `"US"`**) is
  the only region signal and is always populated.
  `packages/db/schema/users.ts`: `locale` (varchar(10)) exists but is
  nullable, no default, and is **not exposed on `ctx`** in
  `apps/web/server/trpc.ts` — confirmed by full read of `trpc.ts`.
- Root-level cleanup candidates confirmed present with **zero references**
  anywhere in the repo (scripts, CI, docker): `fix.js`, `fix-risk.js`,
  `fix-risk2.js`, `rewrite.js`, `translate_sk.ts`, `test-login.ts`.
- `seed-suppliers.ts` exists at repo root **and** in `packages/db/` —
  confirmed **not** byte-identical and **neither** is referenced by any
  script or import anywhere. See §0.5 OPEN DECISION.
- `RICH_TEXT_IMPLEMENTATION.md` at repo root: **confirmed NOT about Canvas.**
  It documents the TipTap rich-text editor added to SOAP notes (Records
  module) — unrelated to this integration. Leave it alone (see §0.5,
  supersedes the original Phase 1.4 instruction).
- **New finding, not previously known:** `docker/docker-compose.yml` defines
  a separate, already-existing **"Jaaz Marketing Studio"** service (AI
  image/video generator, its own server + Ollama, proxied at
  `/tools/jaaz/*`), unrelated to the Marketing module in this table. The
  `nav.marketing` label ("Marketing Studio") was confirmed by direct read to
  belong only to the templates/posts/planner CRM module above — not Jaaz. Do
  not touch Jaaz-related code, env vars, or docker services under this task;
  mentioned only so nobody confuses the two while searching for "marketing."

---

## Phase 0 — Pre-flight verification: COMPLETE

### 0.1 Locale plumbing — ANSWERED
- `practices.locale`: does not exist. `practices.country`: `varchar(2)`,
  **NOT NULL**, default `"US"`, ISO 3166-1 alpha-2 — always populated, no
  null-fallback case to design for.
- `users.locale`: `varchar(10)`, nullable, no default. Confirmed **not**
  exposed on `ctx` anywhere in `protectedProcedure`.
- `ctx` in `protectedProcedure` (confirmed by full read of `trpc.ts`):
  `session.user` carries only `{id, email, name, role, practiceId}`. No
  practice row is joined onto `ctx` by default (it's only conditionally
  fetched inside the hosted-billing check, for unrelated fields).
- **DECISION (confirmed, implement exactly this):** each seed mutation runs
  one extra query to resolve locale:
  ```ts
  const [practice] = await tx
    .select({ country: practices.country })
    .from(practices)
    .where(eq(practices.id, practiceId))
    .limit(1);
  const locale: "sk" | "en" = practice?.country === "SK" ? "sk" : "en";
  ```
  **No schema migration required.**

### 0.2 i18n current state — ANSWERED
- `sk.json` / `en.json`: flat per-page namespaces, 474 lines each, key sets
  match 1:1 — confirmed by full read of both files.
- **Correction to the original plan's assumption:** the actual pattern is
  `const t = useTranslations();` called with **no namespace argument**, then
  every call site uses the full dotted key, e.g. `t("patients.title")`,
  `t("common.error_retry")` — confirmed on `patients/page.tsx`, the golden
  reference page. New marketing/automations/canvas code must follow this
  exact convention. Do **not** scope `useTranslations("marketing")`.
- Key casing is **inconsistent** in the existing app: older pages
  (patients, clients, billing, inventory) use `snake_case` keys; newer pages
  (schedule, dashboard, newSoap) use `camelCase`. There is no single existing
  convention to "match." **Default unless told otherwise: use `camelCase`**
  for all new `marketing`/`automations`/`canvas` keys, matching the more
  recently-added pages.
- Plurals use manual `plural_one`/`plural_few`/`plural_other` keys resolved
  in code with a bare `=== 1` ternary — confirmed on `patients/page.tsx`:
  `t(data.total === 1 ? "patients.plural_one" : "patients.plural_other",
  { count: data.total })`. `plural_few` is defined in the JSON but never
  referenced anywhere — a pre-existing dead-key pattern, not something to
  fix here. Follow the same one/other ternary for any new pluralized copy.
- `marketing` / `automations` / `canvas` namespaces **do not exist yet** in
  either JSON file — confirmed by full read. Only `nav.marketing`,
  `nav.automations`, `nav.documents` labels already exist. **No clobber
  risk** — create these namespaces fresh in Phase 3.
- FYI, out of scope: `sk.json`'s `newSoap.objective` key currently holds an
  unrelated sentence (looks like a copy-paste error), not "Objektívne."
  Pre-existing bug, unconnected to this integration — do not fix as part of
  this work unless separately asked to.

### 0.3 Design system reference — ANSWERED
- **No shared `PageHeader` or breadcrumb component exists anywhere in the
  codebase** — confirmed by reading `patients/page.tsx` (the golden
  reference page) in full. There are no breadcrumbs anywhere in the app
  today. The actual pattern is inline Tailwind:
  ```tsx
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-heading text-xl font-semibold">{t("...title")}</h2>
      <p className="text-sm text-muted-foreground">{t("...subtitle")}</p>
    </div>
    {actionButton}
  </div>
  ```
  **Phase 4 must standardize on this exact inline pattern** — do not expect
  or invent a `PageHeader`/breadcrumb component; none exists to adopt, and
  none should be introduced as part of this pass.
- `apps/web/components/ui/` inventory (confirmed via directory listing):
  `badge.tsx, button.tsx, card.tsx, checkbox.tsx, form-field.tsx, input.tsx,
  popover.tsx, progress.tsx, tabs.tsx, tooltip.tsx`. **No `dialog.tsx`
  exists.** See §0.5 OPEN DECISION #2 — flag before Phase 4 touches any
  modal/dialog UI in these 3 modules.
- Loading state: `<TableSkeleton rows={n} cols={n} />` from
  `@/components/common/loading` — confirmed real and in use.
- Empty state: `<EmptyState icon title description
  action={{label,onClick,icon}} />` from `@/components/common/empty-state` —
  confirmed real and in use.
- Toasts: `sonner` is confirmed in use across 17+ other dashboard pages
  (patients, clients, billing, records, inventory, inbox,
  controlled-substances, schedule, settings, whiteboard, and others) —
  established, real pattern. Confirmed **not currently used** in
  marketing/automations/documents — Phase 4's "wire up toasts" work is real
  and not already done.

### 0.4 Canvas route naming — ANSWERED
- `apps/web/components/layout/sidebar.tsx` (confirmed by direct read)
  already has:
  `{ href: "/documents", key: "nav.documents", icon: BookOpen, roles:
  allRoles }`, labeled **"AI Canvas & SOPs"** (EN) / **"AI Canvas a SOP"**
  (SK) in both message files, visible to all roles.
- **DECISION (confirmed): keep the `/documents` route/folder name.** The
  user-facing label is already "Canvas"-branded in production copy while the
  URL stays `/documents`. Only internal naming (variables, components,
  comments) should say "Canvas." No route rename, no folder rename.

### 0.5 Dependency/script safety check — ANSWERED
- Confirmed **zero references** to `fix.js`, `fix-risk.js`, `fix-risk2.js`,
  `rewrite.js`, `translate_sk.ts`, `test-login.ts` in any `package.json`
  script (root or `packages/db`) or in `.github/workflows/ci.yml`. Safe to
  `git rm` in Phase 1.1 exactly as originally planned.
- **New finding — extends Phase 1.3's dependency sweep:** root
  `devDependencies` include `ts-morph` and `@vitalets/google-translate-api`;
  `packages/db`'s `devDependencies` also include `ts-morph`. These almost
  certainly exist only to support `rewrite.js`/`fix*.js` (AST codemods,
  ts-morph) and `translate_sk.ts` (auto-translation). **After** deleting
  those scripts in Phase 1.1, run `pnpm why ts-morph` and `pnpm why
  @vitalets/google-translate-api` in both workspaces — if nothing else
  depends on them, remove with `pnpm remove` as part of Phase 1.3.
- **OPEN DECISION #1 — do not resolve silently, ask the requester before
  Phase 1.2:** `seed-suppliers.ts` exists at repo root and in `packages/db/`.
  Confirmed by full read of both: **neither is referenced by any script or
  import anywhere in the repo**, and they are not byte-identical — same
  demo supplier data, but the root copy imports via workspace alias
  (`from '@openpims/db'`, `from '@openpims/db/schema'`) while the
  `packages/db` copy uses relative imports (`from './client'`, `from
  './schema'`) plus its own `dotenv.config({ path: '../../.env' })`. Both
  would likely run correctly as-is. Recommendation if asked: keep
  `packages/db/seed-suppliers.ts` (more self-contained, colocated with the
  db package) and delete the root copy — **but get explicit confirmation
  before deleting either file.**
- **Correction, supersedes original Phase 1.4:** `RICH_TEXT_IMPLEMENTATION.md`
  is **not** about Canvas — confirmed by direct read, it documents the
  TipTap rich-text editor added to SOAP notes (Records module). It is
  unrelated to this integration's scope. **Leave it exactly where it is; do
  not move it or fold it into this cleanup pass.** (`docs/` has no folder
  that obviously fits it anyway — confirmed contents: `agents/, api/,
  brand/, help/, security/` plus a few top-level `.md` files.)

**Phase 0 exit criteria: all five answered above with confirmed facts, not
assumptions.** Two items are flagged **OPEN DECISION** and must be confirmed
with the requester before the relevant step:
1. Which `seed-suppliers.ts` to keep — blocks Phase 1.2.
2. How to handle modal/dialog UI given no `dialog.tsx` primitive exists —
   blocks the relevant part of Phase 4.1.

Everything else below is ready to execute as written.

---

## Phase 1 — Codebase hygiene & cleanup (Objective 4)

Do this phase first — it's the lowest-risk, and it gives every later phase a
clean working tree.

### 1.1 Delete confirmed-dead migration scripts
For each of `fix.js`, `fix-risk.js`, `fix-risk2.js`, `rewrite.js`,
`translate_sk.ts`, `test-login.ts` at repo root — **confirmed zero
references anywhere (§0.5)**:
- [ ] `git rm` it.
- [ ] Skim its content one last time before deleting for anything that looks
      like it documents an undone migration step — if so, note the missing
      follow-up in your report instead of silently losing that knowledge.

### 1.2 Resolve the duplicate `seed-suppliers.ts` — BLOCKED on OPEN DECISION #1
- [ ] **Do not delete either file until the requester confirms which to
      keep** (§0.5 — neither is referenced by any script, so the original
      "keep the one a script points to" rule doesn't resolve this cleanly).
- [ ] Once confirmed: `git rm` the other, keeping the chosen one exactly as
      it stands (its import style already matches where it lives).

### 1.3 Dead code / unused dependency sweep in the 3 modules
- [ ] In `apps/web/app/(dashboard)/{marketing,automations,documents}/**` and
      the three routers, search for: unused imports, commented-out prototype
      code left over from the merge, and any import of a package not in
      `apps/web/package.json` dependencies (confirm with `pnpm why <pkg>`
      before removing).
- [ ] Cross-check `apps/web/package.json` (and root `package.json`) against
      `OpenVPM-Social-Studio`'s `package.json` for prototype-only deps that
      are now unused.
- [ ] **New step, confirmed in §0.5:** after 1.1, run `pnpm why ts-morph` and
      `pnpm why @vitalets/google-translate-api` in root and in
      `packages/db`. If nothing else depends on them, `pnpm remove` both.

### 1.4 Documentation — SKIP
`RICH_TEXT_IMPLEMENTATION.md` is confirmed unrelated to Canvas (§0.5). No
action needed here for this integration — leave it in place.

**Phase 1 verification:**
```
git status                # only expected deletions show up
pnpm install               # lockfile still resolves cleanly after dependency removals
pnpm -w typecheck          # nothing broke from removed imports/deps
pnpm -w build               # full monorepo build still succeeds
```
Report the exact list of files removed and the four command outputs.

---

## Phase 2 — Database seeding architecture (Objective 3)

### 2.1 Add English translations for the Canvas master documents
`MASTER_DOCUMENTS` (canvas.ts, lines 31–219) is ~190 lines of Slovak-language
clinical/business rich-text HTML (strategy plan, SOPs, manuals, HR docs,
personas — 5 documents). No English version exists.
- [ ] Read the full `MASTER_DOCUMENTS` array content (all 5 documents).
- [ ] Produce faithful English translations of all 5 documents' `title`,
      `tags`, and full HTML `content` — not summaries, not placeholders.
      Preserve HTML structure exactly so the sanitizer allowlist and
      downstream rendering behave identically.
- [ ] Keep `docType`, `status`, `isRagSource` identical between locales.
- [ ] **Because this is clinical/HR/business content that will be shown to
      real practices, have a native-speaker or domain reviewer check the
      English translations before Phase 2's functional verification is
      considered passed** — a typecheck and a successful insert don't catch
      a mistranslated SOP.

### 2.2 Move seed data into `packages/db/data/{sk,en}/`
Follow the exact existing pattern (flat exported const, typed against the
Drizzle insert type — confirmed real via `packages/db/package.json`'s
`db:seed`/`db:seed:sk` scripts):
- [ ] In `packages/db/data/sk/index.ts`, append (do not reorder existing
      exports): `marketingTemplatesData`, `crmAutomationsData`,
      `canvasMasterDocumentsData` — moved content, unchanged (Slovak).
- [ ] In `packages/db/data/en/index.ts`, add the same three exports
      translated to English (marketing/automations are short — translate in
      full; canvas uses the Phase 2.1 translations).
- [ ] Add necessary type imports matching the existing style in those files.
- [ ] Verify `grep -c "SEED_TEMPLATES\|DEFAULT_AUTOMATIONS\|MASTER_DOCUMENTS"`
      inside the three router files returns 0 once removed in 2.3.

### 2.3 Wire the routers to the new locale-aware data source
For each of `marketing.ts`, `automations.ts`, `canvas.ts`:
- [ ] Delete the local hardcoded const (`SEED_TEMPLATES` /
      `DEFAULT_AUTOMATIONS` / `MASTER_DOCUMENTS`).
- [ ] Import both `packages/db/data/sk` and `packages/db/data/en` (or the
      shared helper from 2.4).
- [ ] Inside the seed mutation, resolve locale using the **confirmed §0.1
      query**:
  ```ts
  const [practice] = await tx
    .select({ country: practices.country })
    .from(practices)
    .where(eq(practices.id, practiceId))
    .limit(1);
  const locale: "sk" | "en" = practice?.country === "SK" ? "sk" : "en";
  ```
  then read from the matching data module and map exactly as before (the
  `.map()` body — adding `practiceId`, `authorId`, etc. — does not change).
- [ ] Do not touch the idempotency check, the `requireRole("admin",
      "veterinarian")` guard, or the return shape — backend contract, out of
      scope.

### 2.4 (Recommended) One shared helper instead of repeating locale-resolution 3x
- [ ] Create `packages/db/data/index.ts` exporting a single
      `getLocaleData(locale: "sk" | "en")` returning
      `{ marketingTemplatesData, crmAutomationsData,
      canvasMasterDocumentsData }`, so each router does one
      `getLocaleData(locale).marketingTemplatesData` call. Additive only —
      don't change how `packages/db/seed.ts` consumes the other 22 existing
      exports.

**Phase 2 verification:**
```
pnpm -w typecheck
```
Then functionally: seed a fresh test practice with an English-country
practice and confirm English content is inserted; repeat for a
Slovak-country (`country = "SK"`) practice and confirm Slovak content.
Re-run `apps/web/server/__tests__/canvas-safety.test.ts` to confirm the
sanitizer/security tests still pass unchanged.
Report: diff stats for all 3 routers + 2 data files, and both locale test
results.

---

## Phase 3 — Full i18n extraction (Objective 2)

Work module by module: **extract → key → translate → replace → verify zero
hardcoded strings remain.** For every page: `const t = useTranslations();`
with **no namespace argument**, full dotted keys at every call site,
**camelCase** for all new keys (confirmed conventions, §0.2).

### 3.1 Marketing (`marketing/page.tsx`, `marketing/planner/page.tsx`,
`marketing/reviews/page.tsx` — 885 lines combined)
- [ ] Extract every user-facing hardcoded string: labels, headings,
      empty-state copy, toasts, form labels/placeholders, status badges,
      dialog text, tooltips.
- [ ] Namespace under `"marketing"`, sub-namespaced per page
      (`"marketing": { "planner": {...}, "reviews": {...}, ... }`).
- [ ] Slovak values in `sk.json` = exact existing text, relocated verbatim.
- [ ] Full, natural English translations in `en.json` — not literal
      word-for-word.
- [ ] Replace hardcoded strings with `t("marketing.xxx")` calls, including
      interpolation cases, using the confirmed `{count}`-style pattern.
- [ ] **Confirmed present and in-scope:** `marketing/page.tsx`'s
      `STATUS_CONFIG` object has Slovak labels (`"Koncept"`, `"Na
      schválenie"`, `"Schválené"`, `"Naplánované"`, `"Publikované"`,
      `"Archivované"`) hardcoded in the map — move these to i18n keyed by
      the `PostStatus` enum value, same pattern as `patients/page.tsx`'s
      `formatStatus()` helper (map enum → translation key, then `t(key)`).

### 3.2 Automations (`automations/page.tsx` — 252 lines)
- [ ] Same loop, namespaced under `"automations"`.
- [ ] Only UI chrome strings go in `messages/*.json`; the seeded automation
      names/descriptions stay as data (already handled by Phase 2's sk/en
      split) — do not double-translate those through next-intl.

### 3.3 Canvas (`documents/page.tsx` — 344 lines)
- [ ] Same loop, namespaced under `"canvas"` (module name, not the
      `documents` URL — confirmed decision, §0.4).
- [ ] `DOC_TYPE_CONFIG` labels move to `"canvas": { "docTypes": { "strategy":
      "...", "sop": "...", ... } }`, keyed by the `docType` enum value. Keep
      `icon`/`color` in the config object — only `label` moves to i18n.
- [ ] Seeded document content (now in `packages/db/data/{sk,en}`) is data,
      not UI copy — don't route it through `next-intl`.

### 3.4 Verification (all three modules)
- [ ] Search all touched files for Slovak-diacritic characters (`á é í ó ú ý
      č ď ľ ň š ť ž ô`) outside JSON files and comments — any hit is a
      missed extraction.
- [ ] Confirm `en.json`/`sk.json` have matching key structures (no orphans).
- [ ] Manually toggle the app locale and visually confirm both languages
      render correctly on all 4 pages.
- [ ] Optional, out of scope unless separately requested: `sk.json`'s
      `newSoap.objective` bug noted in §0.2 could be fixed in the same PR
      since you'll already be touching the file — flag it in your report
      either way, don't fix it silently.

**Phase 3 verification:**
```
pnpm -w typecheck
pnpm -w lint
```
Report: total string count extracted per module, the key-diff result
(should be empty), confirmation of the manual locale-toggle check.

---

## Phase 4 — Unified design system & UX audit (Objective 1)

Do this last, using the i18n keys from Phase 3.

### 4.1 Per-page checklist — apply to all 5 pages
- [ ] **Page wrapper/header — corrected per §0.3:** there is no
      `PageHeader`/breadcrumb component and no breadcrumbs exist anywhere in
      the app. Use the exact inline pattern from `patients/page.tsx`:
      `<h2 className="font-heading text-xl font-semibold">` +
      `<p className="text-sm text-muted-foreground">`. Do not build or
      expect a shared header/breadcrumb component.
- [ ] **Buttons/inputs/badges:** use `@/components/ui/{button, input, badge,
      card, tabs, tooltip, popover, checkbox, form-field}` — confirmed
      inventory, §0.3. Do not invent new primitives for anything these
      already cover.
- [ ] **Dialogs/modals — OPEN DECISION #2, confirmed no `dialog.tsx`
      exists (§0.3, §0.5):** before touching any modal UI in these 3
      modules, check how `OpenVPM-Social-Studio`'s prototype implemented its
      modals (read-only reference) and whether any *other* OpenVPM page
      already has a modal need solved some other way. Then flag back to the
      requester: build one new shared `dialog.tsx` primitive now (the one
      justified exception to "don't invent new primitives," since none
      exists), or keep whatever ad-hoc modal markup these pages already
      have. Do not pick silently.
- [ ] **Icons:** confirm every icon is from `lucide-react` (already
      confirmed true on `marketing/page.tsx` and `documents/page.tsx` from
      direct reads) — spot-check the remaining 3 files.
- [ ] **Loading states:** tie every `useQuery()` to `<TableSkeleton
      rows={n} cols={n} />` (confirmed real, §0.3), not a bare "Loading..."
      string.
- [ ] **Mutation feedback:** every `useMutation()` — button `disabled` while
      `isPending`, inline spinner, and a `sonner` toast (confirmed
      established pattern across 17+ pages, §0.3; confirmed **not yet
      present** in these 3 modules) on both success and error. Grep for any
      mutation missing an `onError` handler.
- [ ] **Empty states:** use `<EmptyState icon title description action={{
      label, onClick, icon }} />` from `@/components/common/empty-state`
      (confirmed real, §0.3) instead of ad-hoc "Nothing here" text.
- [ ] **Mobile responsiveness:** verify each page collapses sensibly below
      the project's Tailwind breakpoint; tables become stacked/scrollable,
      dialogs don't overflow viewport.

### 4.2 Cross-page consistency pass
- [ ] Confirm the 3 marketing sub-pages share consistent tab/sub-nav
      styling.
- [ ] Confirm status badges (marketing/automations/canvas) use a consistent
      badge-color approach rather than each module inventing its own.
- [ ] **Reminder, confirmed §1:** do not touch anything under
      `docker/docker-compose.yml`'s `jaaz-server`/`ollama` services or
      `/tools/jaaz/*` routes — separate, unrelated "Marketing Studio"
      feature, out of scope.

**Phase 4 verification:**
```
pnpm -w typecheck
pnpm -w lint
pnpm -w build
```
Then run the Playwright suite filtered to specs touching these 3 modules,
plus a manual pass at 375px, 768px, and 1440px for all 5 pages.
Report: before/after description per page, plus full command output.

---

## Phase 5 — Final verification & definition of done

Run the full gate:
```
pnpm install
pnpm -w typecheck
pnpm -w lint
pnpm -w build
pnpm -w test              # includes canvas-safety.test.ts — must still pass unmodified
pnpm exec playwright test # full e2e suite
```

**Definition of done — all must be true:**
- [ ] Zero files matching `fix*.js`, `rewrite.js`, `translate_sk.ts`,
      `test-login.ts` remain at repo root; no duplicate `seed-suppliers.ts`.
- [ ] `SEED_TEMPLATES`, `DEFAULT_AUTOMATIONS`, `MASTER_DOCUMENTS` no longer
      exist as literals inside any router file; both exist as `sk`/`en`
      pairs under `packages/db/data/`.
- [ ] A newly seeded English-country practice gets English content; a
      Slovak-country (`country = "SK"`) practice gets Slovak content, via
      the confirmed §0.1 query — no schema migration was introduced.
- [ ] `rg` for Slovak diacritics across `marketing/`, `automations/`,
      `documents/` component files (excluding JSON/comments) returns
      nothing.
- [ ] `sk.json`/`en.json` key sets match exactly for the new namespaces.
- [ ] All 5 pages match `patients/page.tsx`'s inline header pattern, use the
      confirmed loading/empty-state/toast components, and are mobile
      responsive — no invented header/breadcrumb component was introduced.
- [ ] `canvas-safety.test.ts` and all other pre-existing security tests pass
      unmodified.
- [ ] Full monorepo typecheck, lint, build, unit tests, and e2e suite pass.
- [ ] No `any`, no `@ts-ignore`, no `TODO` introduced anywhere in the diff.
- [ ] **OPEN DECISION #1** (seed-suppliers.ts) was resolved with the
      requester and reflected in the diff, not decided silently.
- [ ] **OPEN DECISION #2** (dialog primitive strategy) was resolved with the
      requester and reflected in the diff, not decided silently.
- [ ] `RICH_TEXT_IMPLEMENTATION.md` was left untouched — it documents an
      unrelated feature (§0.5).
- [ ] `docker/docker-compose.yml`'s Jaaz-related services were left
      untouched — unrelated feature sharing similar naming (§1).

Final report format: one section per phase (1–5), each with files changed,
line-count delta, and verification output. Flag anything that couldn't be
cleanly resolved rather than working around it silently.
