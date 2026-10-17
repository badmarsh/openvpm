# Case result — copy to local-results/<case-id>-<run-id>.md

- Case ID / priority:
- Agent / reviewer / local timestamp:
- Revision / modified files:
- Track: source / unit / local HTTP / local browser / live RLS / provider
- Status: NOT_RUN / IN_PROGRESS / PASS / FAIL / BLOCKED / NOT_SUPPORTED
- Environment reference (no URLs containing credentials, no env values):
- Synthetic fixture IDs / prerequisite state:
- Expected result and contract/source establishing it:
- Reproduction steps before fix:
- Actual result before fix:
- Minimal implementation / regression test:
- Commands and exit codes:
- Actual result after fix:
- Side-effect checks (DB writes, outbound calls, credential exposure):
- Evidence references (private trace/screenshot/log):
- Remaining limitations / skipped tests / needed access:
- New follow-up IDs, dependencies and acceptance criteria:
- Next safe case:

A mock-only pass is UNIT_VERIFIED, not LOCAL_HTTP_VERIFIED or PROVIDER_VERIFIED.
Never store raw clinical prompts, patient/owner names, secrets or provider error
bodies in a public status file. Synthetic names must remain clearly synthetic.
