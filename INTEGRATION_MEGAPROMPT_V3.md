# OpenVPM ⟷ Social Studio Integration — Completion Megaprompt (v3)

**Relationship to v2:** this does not replace `INTEGRATION_MEGAPROMPT.md` —
read that first for full Phase 0-2 background, the repo map, and the two
OPEN DECISIONs. This document picks up where a full line-by-line audit
(Desktop Commander, 2026-08-04) found execution actually stood, and defines
everything still needed to reach v2's Definition of Done.

**Status as of this audit - confirmed by direct read, not assumption:**
- Phase 1 (hygiene): done. One new item not in v2's scope (see Section 1).
- Phase 2 (DB seeding architecture): done, verified in full (all 3 routers
  read end to end, not spot-checked; getLocaleData() helper confirmed
  exactly as specified).
- Phase 3 (i18n extraction): functionally complete but violates operating
  rule #3 - 11 confirmed `as any` casts, not 10 as an earlier pass
  reported. Exact locations in Section 3.5.
- Phase 4 (design system/UX): not started. Confirmed via direct checks,
  not inference.
- Phase 5 (final verification): partially unblocked this session - a
  working shell was established via Desktop Commander and
  `pnpm --filter @openpims/web type-check` passed with exit code 0 as of
  this audit. Lint/build/unit-tests/e2e remain unverified.

This document defines the remaining work as Phase 3.5, Phase 4, and
Phase 5, under the same operating rules as v2.

---

## 0. Operating rules (unchanged from v2 - repeated so this stands alone)

1. Surgical edits only (str_replace/equivalent). Never regenerate a whole
   file for a few-line change.
2. Backend business logic, RLS, RBAC, rate limiting stay frozen except the
   Phase 2 changes already made. Anything else that looks like it needs to
   change: stop and flag it, don't just do it.
3. No `any`, no `@ts-ignore`, no `// TODO`. If something is incomplete,
   it is not done. (This is the rule Phase 3 currently violates.)
4. One git commit per phase, on `integration/social-studio-cleanup`
   (or continue on it if already the active branch).
5. Every phase ends with a verification step; do not start the next phase
   until the current one's verification passes.
6. Report back after each phase: files touched, line counts before/after,
   and pasted actual terminal output - not a summary of it.
7. OPEN DECISION #1 (seed-suppliers.ts) and OPEN DECISION #2
   (dialog.tsx) from v2 are still open in the sense that neither has a
   recorded requester confirmation - see Section 1 for the nuance on #1.

---

## 1. New confirmed facts from this audit (2026-08-04, via Desktop Commander)

- `packages/db/seed-suppliers.ts` is confirmed the only surviving copy; the
  root copy is gone. This matches OPEN DECISION #1's recommended
  resolution in v2, but there is no record of the requester explicitly
  confirming it before it happened. Flag this to the requester in your
  Phase 3.5 report - don't treat the file state as an implicit approval.
- New file at repo root, not in v2's scope: `compare-i18n-keys.js`. Read
  it before doing anything else in Phase 3.5 - confirm what it does
  (presumably a key-diff between en.json/sk.json) and whether it should
  become a permanent script, move under a scripts/ location, or be
  deleted now that its one-off job is done. It was evidently added ad hoc
  to support the Phase 3.4 verification step, but v2 never asked for a
  persistent script and Phase 5's definition-of-done should account for
  its presence one way or another.
- `packages/db/data/index.ts` (the Phase 2.4 shared helper) exists exactly
  as v2 specified - confirmed by direct read.
- All three routers (marketing.ts, automations.ts, canvas.ts) are wired to
  getLocaleData(), with idempotency checks, requireRole guards, and (for
  canvas.ts) sanitizeCanvasHtml/CANVAS_ALLOWED_TAGS untouched - confirmed
  by reading all three routers in full, not spot-checking one.
- **New finding, not in v2 or the prior audit pass:**
  `apps/web/server/routers/marketing.ts`, inside `createPost`'s history
  entry, hardcodes a Slovak string: `note: "Príspevok vytvorený"`. This is
  business logic, not a page.tsx UI string, so it didn't show up in the
  "5 pages, zero diacritics" check from Phase 3.4 - but it's real Slovak
  text that will render to English-locale practices. Fix it alongside the
  `as any` cleanup in Phase 3.5. (`automations.ts` and `canvas.ts` are
  clean of diacritics - confirmed.)
- **New finding:** `apps/web/i18n/request.ts` calls a `resolveLocale()`
  helper (in `lib/i18n/resolve-locale.ts`) that combines `user.locale`,
  `practice.country`, a `NEXT_LOCALE` cookie, and the `Accept-Language`
  header to pick which UI message JSON to load. This is a *different*
  concern from Phase 2's seed-data locale query (which only decides what
  language newly-seeded business data is created in, using
  `practice.country` alone). Both are correct for their own purpose - do
  not conflate them or try to "unify" the logic in Phase 3.5 or Phase 4.
- **New finding:** no `IntlMessages` type-augmentation
  (`declare global { interface IntlMessages ... }`) exists anywhere under
  `apps/web`. Before assuming why the 11 `as any` casts were added in the
  first place, Phase 3.5 must empirically confirm the actual compiler
  error (see 3.5.1) rather than guessing at next-intl's typing behavior.
- **Environment note for whoever executes this:** a working shell IS
  reachable via Desktop Commander's start_process with shell "cmd.exe",
  but read_process_output/session tracking is unreliable - it frequently
  reports "no active session" even for a process that's still legitimately
  running (or has already finished). Always redirect output to a log file
  (`> file.log 2>&1`) and poll the file with get_file_info/read_file
  rather than trusting the live session. Also, bare `pnpm` is not
  reliably on PATH inside spawned shells - resolve it once via
  `where pnpm` (typically
  `C:\Users\<user>\AppData\Local\pnpm\pnpm.CMD`) and invoke that full
  path directly rather than the bare command.
- **Confirmed empirically this session:**
  `pnpm --filter @openpims/web type-check` (i.e. `tsc --noEmit`) completed
  with exit code 0 - the package currently typechecks cleanly. (The 11
  `as any` casts are part of why - removing them without a proper fix
  would very likely reintroduce errors, per 3.5.1.) Lint, build, unit
  tests, and the e2e suite are still unverified this session - run them
  as part of Phase 5.

---

## Phase 3.5 — Close out the Phase 3 i18n violations (before Phase 4)

### 3.5.1 Diagnose before fixing - don't assume next-intl's typing

- [ ] Read `apps/web/i18n/request.ts` and confirm there is no
      `IntlMessages` augmentation anywhere under `apps/web` (already
      confirmed in this audit - re-verify yourself, don't take this
      document's word for it either).
- [ ] Pick ONE of the 11 casts (e.g. `marketing/page.tsx`'s
      `t(\`marketing.statusLabels.${status}\` as any)`), temporarily
      remove `as any`, and run `pnpm --filter @openpims/web type-check`.
      Read the actual compiler error message, if any.
- [ ] Revert the temporary change immediately after reading the error -
      don't leave the repo mid-experiment between steps.

### 3.5.2 Apply the fix based on what 3.5.1 found

- If removing `as any` produces **no error**: the casts were unnecessary
  defensive casts. Delete all 11 - cleanest outcome, zero new code.
- If removing `as any` **does** error (most likely something like
  "argument of type `string` is not assignable to parameter of type
  `<literal union>`"): the dynamic keys need a properly-typed lookup
  instead of a blanket cast. For each of the 5 call sites' key families,
  build an explicit, exhaustively-typed map from the enum/id to the
  literal key, e.g.:
  ```ts
  const STATUS_LABEL_KEY = {
    draft: "marketing.statusLabels.draft",
    in_review: "marketing.statusLabels.in_review",
    approved: "marketing.statusLabels.approved",
    scheduled: "marketing.statusLabels.scheduled",
    published: "marketing.statusLabels.published",
    archived: "marketing.statusLabels.archived",
  } as const satisfies Record<PostStatus, Parameters<typeof t>[0]>;
  // then call sites become: t(STATUS_LABEL_KEY[status])
  ```
  This gives compile-time exhaustiveness (TypeScript errors if a
  `PostStatus` value is missing from the map) with zero `any` anywhere.
  Apply the same pattern to all 11 occurrences, grouped by key family:
  - `marketing.statusLabels.*` - 1 use in `marketing/page.tsx`, 2 uses in
    `marketing/planner/page.tsx` (one line has two separate casts in a
    template literal - both need the map).
  - `marketing.planner.platformLabels.*` - 3 uses in
    `marketing/planner/page.tsx`.
  - `marketing.reviews.templateTexts.*` and `marketing.reviews.templates.*`
    - 2 uses in `marketing/reviews/page.tsx`, keyed off
    `REVIEW_TEMPLATE_META`'s ids - enumerate that array's ids explicitly
    in the map rather than typing it as a bare `string`.
  - `automations.triggerLabels.*` - 1 use in `automations/page.tsx`.
  - `canvas.docTypes.*` - 2 uses in `documents/page.tsx` (one inside the
    `cfg()` helper, one in the new-document type `<select>` options loop),
    keyed off `DOC_TYPE_ICONS`.
- [ ] If a genuinely open-ended/unbounded key ever needs a narrower
      assertion instead (should not apply to any of the 11 above, since
      all are closed enums), use `as Parameters<typeof t>[0]` - never a
      bare `as any` - and say so explicitly in the phase report.
- [ ] Confirm the exhaustiveness actually does something: temporarily
      remove one case from a map and confirm `pnpm type-check` fails.
      This proves the `satisfies Record<...>` is real, not decorative.

### 3.5.3 Fix the stray Slovak string

- [ ] In `apps/web/server/routers/marketing.ts`, replace the hardcoded
      `note: "Príspevok vytvorený"` in `createPost`'s initial history
      entry. This is server-side default text that ends up shown in the
      UI, so it needs an i18n key too - add something like
      `marketing.postCreatedNote` to both `en.json`/`sk.json`, and either
      have the client pass its own already-translated string (simplest -
      the client already has `t()` available at the call site) or leave a
      locale-neutral value server-side and translate at render time.
      Pick whichever keeps the router's return shape unchanged, per
      operating rule #2.

### 3.5.4 Account for `compare-i18n-keys.js`

- [ ] Read it, confirm what it does (presumably a key-diff between
      en.json/sk.json).
- [ ] Decide: keep it as a permanent `pnpm` script (add to
      `package.json`), move it into an existing `scripts/` location if one
      exists, or delete it if its one-off job is done. Don't leave it
      sitting unexplained at repo root - v2 never asked for a persistent
      script, and Phase 5's definition-of-done should account for its
      presence one way or another.

**Phase 3.5 verification:**
```
pnpm --filter @openpims/web type-check
rg "as any" "apps/web/app/(dashboard)/marketing" "apps/web/app/(dashboard)/automations" "apps/web/app/(dashboard)/documents" --type tsx
rg "[áäéíóôúýčďĺľňŕšťž]" apps/web/server/routers/marketing.ts apps/web/server/routers/automations.ts apps/web/server/routers/canvas.ts
```
All three must return clean (zero `as any` in the 3 modules' component
files, zero diacritics outside JSON/comments in the 3 routers). Paste
actual output, not a summary of it.

---

## Phase 4 — Unified design system & UX audit (still not started)

v2's Phase 4.1/4.2 checklist is unchanged and carries forward in full:
page-wrapper/header pattern, ui/ primitives, dialogs, icons, loading
states, mutation feedback, empty states, mobile responsiveness, and the
cross-page consistency pass. Nothing about that scope has changed. Two
items below are additions based on this audit's direct findings.

### 4.0 Resolve OPEN DECISION #2 first (confirmed still open)

- [ ] No `dialog.tsx` exists in `apps/web/components/ui/` - confirmed
      again this session (inventory unchanged from v2: badge, button,
      card, checkbox, form-field, input, popover, progress, tabs,
      tooltip). Do not start any modal/dialog work in these 3 modules
      until the requester has chosen: build one shared `dialog.tsx` now,
      or keep ad-hoc modal markup. Unchanged from v2 - repeating it here
      because Phase 4 is where it actually gets exercised.

### 4.1 Header pattern (confirmed not yet done)

- [ ] `marketing/page.tsx` still uses
      `<h1 className="text-2xl font-bold tracking-tight">` plus an
      icon-box wrapper - confirmed by direct read. Replace with the golden
      `patients/page.tsx` inline pattern from v2 Section 0.3:
      `<h2 className="font-heading text-xl font-semibold">` +
      `<p className="text-sm text-muted-foreground">`, no icon box, no
      invented header component. Apply to all 5 pages
      (`marketing/page.tsx`, `marketing/planner/page.tsx`,
      `marketing/reviews/page.tsx`, `automations/page.tsx`,
      `documents/page.tsx`).

### 4.2 Loading / empty states (confirmed not yet done)

- [ ] Zero uses of `TableSkeleton`, `EmptyState`, or `sonner`/`toast(`
      anywhere across the 3 modules' `.tsx` files - confirmed by direct
      search, not inferred. Wire up `<TableSkeleton rows={n} cols={n} />`
      for loading and `<EmptyState icon title description
      action={{label,onClick,icon}} />` for empty results, per v2
      Section 0.3's confirmed components.

### 4.3 Wire up mutation feedback (confirmed real gap, not partially done)

- [ ] All 8 `useMutation()` calls across the 3 modules are missing
      `onError` - confirmed by direct search, zero hits anywhere:
      - `marketing/page.tsx`: 1 mutation
      - `marketing/planner/page.tsx`: 1 mutation
      - `automations/page.tsx`: 3 mutations
      - `documents/page.tsx`: 3 mutations
      Add `sonner` toasts on both success and error to every one of them,
      matching the established pattern from the 17+ other pages that
      already use it (read one, e.g. `patients/page.tsx`, as the
      reference before writing the new calls - don't invent a new toast
      style). `disabled={isPending}` + inline spinner is already present
      on most buttons from the prototype merge - leave that part alone,
      it's not a gap.

**Phase 4 verification:** same as v2 - `pnpm --filter @openpims/web
type-check`, `pnpm -w lint`, `pnpm -w build`, the Playwright subset
touching these 3 modules, plus a manual pass at 375px/768px/1440px for
all 5 pages. Use the working-shell method from Section 1 above (redirect
to a log file, poll it - don't trust live session tracking).

---

## Phase 5 — Final verification & definition of done

Same gate as v2, with one correction: root `package.json` exposes
`type-check` (hyphenated), not `typecheck` as v2's verification blocks
wrote it - use the real script name, confirmed by reading `package.json`
directly.

```
pnpm install
pnpm -w type-check          # re-run after 3.5/4 changes; passed clean 2026-08-04 pre-changes
pnpm -w lint
pnpm -w build
pnpm -w test                 # includes canvas-safety.test.ts - must still pass unmodified
pnpm exec playwright test    # full e2e suite
```

**Definition of done — everything in v2's Phase 5 checklist, plus:**

- [ ] All 11 (not 10) `as any` casts resolved per Section 3.5.2, with
      `satisfies Record<...>` exhaustiveness where the diagnosis in 3.5.1
      shows it's needed.
- [ ] `marketing.ts`'s hardcoded Slovak history note is gone.
- [ ] `compare-i18n-keys.js` is either formalized (added to
      `package.json` scripts) or removed - not left unexplained at repo
      root.
- [ ] OPEN DECISION #1 (`seed-suppliers.ts`) is explicitly confirmed with
      the requester even though the file state already matches the
      recommendation - a de facto resolution is not the same as an
      actual answer.
- [ ] OPEN DECISION #2 (`dialog.tsx`) is resolved before or during
      Phase 4, not silently.
- [ ] All 8 mutations across the 3 modules have `onError` + `sonner`
      toast feedback, matching the established cross-app pattern.
- [ ] Full gate (type-check/lint/build/test/e2e) passes with pasted
      terminal output, not a paraphrase of it.

Report format: one section per phase (3.5, 4, 5), each with files
changed, line-count delta, and verification output. Flag anything that
couldn't be cleanly resolved rather than working around it silently.
