import { afterEach, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
vi.mock("@/lib/audit", () => ({ recordAuditLog: vi.fn(async () => undefined) }));
const { clinicalAiRouter } = await import("../routers/clinical_ai");
const PRACTICE = "00000000-0000-0000-0000-000000000001";
const PATIENT = "00000000-0000-0000-0000-000000000002";
const SESSION = "00000000-0000-0000-0000-000000000003";
function setup(role = "veterinarian", found: unknown = undefined, patientFound = true) {
  vi.stubEnv("HOSTED_BILLING_ENABLED", "");
  const findFirst = vi.fn(async (_input: { where: import("drizzle-orm").SQL }) => found);
  const values = vi.fn(() => ({ returning: async () => [{ id: "synthetic-note" }] }));
  const insert = vi.fn(() => ({ values }));
  const db: Record<string, unknown> = { query: { aiConsultationSessions: { findFirst } }, execute: vi.fn(async () => undefined), insert,
    select: () => ({ from: () => ({ where: () => ({ limit: async () => patientFound ? [{ id: PATIENT }] : [] }) }) }) };
  db.transaction = async (fn: (tx: unknown) => unknown) => fn(db);
  const caller = clinicalAiRouter.createCaller({ db, session: { user: { id: "actor", role, practiceId: PRACTICE } } } as never);
  return { caller, findFirst, insert, values };
}
const input = { sessionId: SESSION, patientId: PATIENT, soapData: { subjective: "Synthetic staff-reviewed text", objective: "", assessment: "", plan: "" } };
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });
it.each(["front_desk", "technician", "viewer"])("denies clinical record apply for %s", async (role) => {
  const { caller, insert } = setup(role);
  await expect(caller.applyToRecord(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect(insert).not.toHaveBeenCalled();
});
it("requires a completed same-patient practice session before insertion", async () => {
  const { caller, findFirst, insert } = setup();
  await expect(caller.applyToRecord(input)).rejects.toMatchObject({ code: "NOT_FOUND" });
  const query = new PgDialect().sqlToQuery(findFirst.mock.calls[0]![0].where);
  expect(query.params).toEqual(expect.arrayContaining([PRACTICE, PATIENT, SESSION]));
  expect(query.sql).toContain('"deleted_at" is null');
  expect(insert).not.toHaveBeenCalled();
});
it("rejects incomplete sessions and missing/deleted patients", async () => {
  const incomplete = setup("veterinarian", { status: "RECORDING" });
  await expect(incomplete.caller.applyToRecord(input)).rejects.toMatchObject({ code: "NOT_FOUND" });
  const missing = setup("veterinarian", { status: "COMPLETED" }, false);
  await expect(missing.caller.applyToRecord(input)).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(missing.insert).not.toHaveBeenCalled();
});
it("allows explicit clinician save after session and patient checks", async () => {
  const { caller, values } = setup("veterinarian", { status: "COMPLETED" });
  expect(await caller.applyToRecord(input)).toMatchObject({ id: "synthetic-note" });
  expect(values).toHaveBeenCalledWith(expect.objectContaining({ patientId: PATIENT, practiceId: PRACTICE, authorId: "actor" }));
});
it("rejects empty SOAP data", async () => {
  await expect(setup().caller.applyToRecord({ ...input, soapData: { subjective: " ", objective: "", assessment: "", plan: "" } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
});
it("cannot start capture or process audio", async () => {
  const { caller, insert } = setup();
  await expect(caller.startSession({ patientId: PATIENT })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  await expect(caller.uploadAndProcess({ sessionId: SESSION, audioBase64: "synthetic" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  expect(insert).not.toHaveBeenCalled();
});
