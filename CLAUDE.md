# CLAUDE.md

Instructions for Claude Code agents working in this repo.

## Project management — Jira (OpenVPM)

We run the OpenVPM build lifecycle on Jira. **Agents coordinate through the board:
read your queue there, and record your work there.**

- **Board:** Jira project **`OPENVPM`** via the Atlassian MCP (the site host + cloud id resolve at runtime and are kept out of this public repo).
- **Before working the board or picking up a ticket, read
  [`docs/agents/jira-operating-manual.md`](docs/agents/jira-operating-manual.md)** —
  it defines the workflow states, the label vocabulary, the Golden Ticket template,
  the comment protocol, and the guardrails.

Quick rules (full detail in the manual):

- **Your queue:** `project = OPENVPM AND status = "To Do" AND labels = agent-ready ORDER BY priority DESC`
- **Pick up** → move to *In Progress*, comment `[agent:<role>] plan: …`. WIP = 1 per agent.
- **Finish** → move to *In Review*, flip the acceptance-criteria ☐ to ✅, comment
  `[agent:<role>] done: … · PR: <url> · tests: <evidence>`.
- **Stuck** → move to *Blocked*, comment `[blocked] waiting on: … · @Evan`.
- Sign every comment with your role: `[agent:eng|qa|gtm|ops|design]`.
- **Never** delete issues, bulk-transition, or move a `risk:*` ticket to *Done* —
  those need a human.

## Public voice — PRs, commits, and issues

This is a public open-source repo. Pull request descriptions, commit messages,
and GitHub issues are community-facing. Write them for the project and the
clinics it serves, not as an internal changelog:

- Frame every change by the problem it solves for people using OpenVPM.
- No customer, prospect, or partner names. No team-member names or first-person
  founder references ("X promised", "X asked for").
- No internal specifics: deals, conversations and their dates, production log
  or request ids, dashboard links, account identifiers.
- Who asked, why now, and other context with names belongs in the private
  tracker (Jira) — link the ticket key instead.
- Product roadmap and decision records stay out of the repo. Internal
  journals, launch checklists, call notes, and strategy write-ups live in the
  private tracker. The exception is community-facing material that materially
  betters the open-source project (ROADMAP.md, user docs, runbooks).

<!-- BEGIN jaz-agent-rules v5.37.0 -->
# Jaz — Agent Operating Rules

How any AI agent (Claude / GPT / Gemini / Copilot / Cursor) should use the Jaz accounting stack in this workspace. Drop this file into the path your platform expects and your agent picks it up automatically.

Source of truth lives in the installed skills (`.claude/skills/jaz-*/SKILL.md` or `.agents/skills/jaz-*/SKILL.md`). This file is a 30-second bias prompt — load the skill for the deep contract.

## Discovery

Jaz exposes **358 tools across 43 namespaces**. Your tool list shows **3, 43, or 358** entries depending on packaging — **never infer capability from its length.**

- **3** — `search_tools(query)` → `describe_tools(names)` → `execute_tool(name, args)`. Empty query returns the namespace map.
- **43** — namespace routers; call one with `{ operation, arguments }`. Its description lists its operations.
- **358** — call operations directly by name.

`describe_capabilities` returns the capability map on all three. **Call it before telling the user Jaz cannot do something.**

No API key needed: `describe_capabilities`, `plan_recipe`, `search_help_center` (marked `Offline.`).

## API contract — the 6 rules that prevent 90% of 422s

1. **IDs are `resourceId`** — never `id`.
2. **Transaction dates are `valueDate`** (YYYY-MM-DD) — never `issueDate` / `invoiceDate` / `date`.
3. **Line item text field is `name`** — never `description`.
4. **`saveAsDraft` defaults `false`** at the API; CLI/MCP create-tools default `true`. Set explicitly when the user says "finalize".
5. **Pagination uses `limit` / `offset`** — `offset` is a 0-indexed page number (offset=1 = second page), not a row-skip. Sort is required when `offset` is set.
6. **Create responses return `{ resourceId }` only** — re-GET to load the full entity.

## Transactions — never hand-construct journals for IFRS

For depreciation, amortization, ECL, IFRS 16 leases, hire purchase, loans, IAS 37 provisions, deferred revenue, fixed deposits, asset disposal, accrued expenses, leave accrual, dividends — **always use the recipe engine**:

1. `plan_recipe(recipe, ...)` → schedule + journals (offline, no posting).
2. `execute_recipe(recipe, ..., startDate)` → posts capsule + all entries (replaces ~20 manual tool calls).

Exception: `fx-reval` is verification-only — Jaz auto-handles period-end IAS 21.23 FX translation. Calling `execute_recipe(recipe: 'fx-reval')` would double-post.

## Bulk operations

- `bulk_upsert_*` tools accept up to 500 rows per call. Async tools return a `jobId` — poll `search_background_jobs(filter:{resourceId:{eq:jobId}})` until SUCCESS / FAILED / PARTIAL_SUCCESS.
- On `PARTIAL_SUCCESS`: succeeded rows are committed. Inspect `errorDetails[].rowIndex` and re-submit only failed rows.
- Sync `bulk_upsert_chart_of_accounts` returns `failedRows[]` inline — no polling.

## Safety

- Never echo `JAZ_API_KEY` or `jk-*` strings to the user or into generated code.
- Never invent enum values (UPPER_SNAKE_CASE only — match exactly).
- Errors come back structured (`code`, `message`, `failedRows[]`, `errorDetails[]`). Read them — don't guess at what went wrong.

## Jaz Jots: record the judgment behind a write

A jot is a one-line record of a judgment call: the decision and why. The org's judgment journal lets the next agent or human read the basis instead of re-deriving it.

**The one rule:** record a judgment when you chose among real alternatives and a write followed, or when you deliberately decided NOT to write. Skip mechanical actions and calls where the platform, the data, or the user left no choice.

- **Two ways to write one.** The `jot` field on the mutation you are already making (`"MATCH: distinct from BILL bil_x, references differ"`), or the `jot` tool alone. Jot AFTER the write succeeds, never before, and carry the record's resourceId.
- **Recall before repeating.** Call `recall` before repeating a judgment on the same record, kind, or workflow: a prior call with its basis beats re-deriving; a flag on it is a warning.
- **9 kinds:** CLASSIFICATION · MATCH · SCOPE · ASSUMPTION · RISK · METHOD · RECOVERY · DEVIATION · NOTE.
- Optional and non-blocking: a jot never delays or fails the action it rides on.
<!-- END jaz-agent-rules -->

## Tool Execution & Agent Behavior Guardrails

1. **Shell Environment Awareness (Windows)**:
   - Always verify the shell environment before running terminal commands.
   - Do NOT attempt to run raw PowerShell cmdlets (e.g. `Test-Path`, `Get-ChildItem`, `Select-Object`) directly in a standard CMD or Bash shell tool instance. Use cross-platform tools (`node -e`, standard shell primitives) or explicitly wrap commands in `powershell -Command "..."`.

2. **File Edit Guardrail (Always Read Before Edit)**:
   - ALWAYS execute `read_file` (or `view_file`) on a target file before attempting any `edit` or `replace_file_content` call in a chat session.
   - Never infer or guess exact character indentation or line strings without inspecting the exact file content first.

