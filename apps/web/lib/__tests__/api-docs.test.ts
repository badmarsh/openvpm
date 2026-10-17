import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("REST documentation matches implemented entrypoints", () => {
  it.each(["clients", "clients/[id]", "patients", "patients/[id]", "appointments", "appointments/[id]", "soap-notes"])("documents implemented %s", (route) => {
    expect(existsSync(`app/api/v1/${route}/route.ts`)).toBe(true);
    const docs = readFileSync("../../docs/api/README.md", "utf8");
    expect(docs).toContain(`/api/v1/${route.replace("[id]", ":id")}`);
  });
  it("does not advertise an unimplemented agent API as shipped", () => {
    const docs = readFileSync("../../docs/api/README.md", "utf8");
    const page = readFileSync("app/api-docs/page.tsx", "utf8");
    const readme = readFileSync("../../README.md", "utf8");
    expect(docs).toContain("not implemented");
    expect(docs).not.toContain("### `POST /api/v1/agent`");
    expect(page).not.toContain('name: "POST /api/v1/agent"');
    expect(readme).not.toContain("OpenVPM ships with a built-in AI agent");
    expect(readme).toContain("current Agent UI drafts text only");
  });
  it("preserves core API scope and date-limit documentation", () => {
    const docs = readFileSync("../../docs/api/README.md", "utf8");
    for (const text of ["600 requests/minute", "Retry-After", "rate_limit_buckets", "records:write", "appointments:write", "timezone-qualified ISO", "Date-only filters are interpreted", "soap_note.created"]) expect(docs).toContain(text);
  });
});
