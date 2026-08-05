import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordAuditLog: vi.fn(async () => undefined),
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: mocks.recordAuditLog,
}));

const { automationsRouter } = await import("../routers/automations");

const PRACTICE_ID = "00000000-0000-0000-0000-0000000000aa";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const AUTOMATION_ID = "00000000-0000-0000-0000-000000000002";

function callerWithDb(db: Record<string, unknown>, role = "admin") {
  const session = {
    user: {
      id: USER_ID,
      email: `${role}@example.com`,
      name: "Test User",
      role,
      practiceId: PRACTICE_ID,
    },
  };
  return automationsRouter.createCaller({ db, session } as never);
}

function createDb(opts?: {
  findFirstResults?: unknown[];
  insertedRows?: unknown[];
  updatedRows?: unknown[];
}) {
  const findFirstResults = [...(opts?.findFirstResults ?? [])];

  const insertReturning = vi.fn(
    async () => opts?.insertedRows ?? [{ id: AUTOMATION_ID }]
  );
  const insertValues = vi.fn(() => ({ returning: insertReturning }));
  const insert = vi.fn(() => ({ values: insertValues }));

  const updateReturning = vi.fn(async () => opts?.updatedRows ?? []);
  const updateWhere = vi.fn(() => ({ returning: updateReturning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));

  const db: Record<string, unknown> = {
    transaction: async (fn: (tx: unknown) => unknown) => fn(db),
    execute: vi.fn(async () => undefined),
    query: {
      crmAutomations: {
        findFirst: vi.fn(async () => findFirstResults.shift() ?? undefined),
        findMany: vi.fn(async () => []),
      },
      crmAutomationLogs: {
        findMany: vi.fn(async () => []),
      },
    },
    insert,
    update,
  };

  return { db, insertValues, updateSet };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("automations RBAC — mutations require admin or veterinarian", () => {
  it("blocks front_desk from creating automations", async () => {
    const { db, insertValues } = createDb();
    await expect(
      callerWithDb(db, "front_desk").createAutomation({
        name: "Test",
        triggerType: "REVIEW_REQUEST",
        conditions: {},
        actionType: "sms",
        actionPayload: { templatePrompt: "Hi" },
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("blocks front_desk from toggling automations", async () => {
    const { db, updateSet } = createDb();
    await expect(
      callerWithDb(db, "front_desk").toggleAutomation({
        automationId: AUTOMATION_ID,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("blocks front_desk from updating automations", async () => {
    const { db, updateSet } = createDb();
    await expect(
      callerWithDb(db, "front_desk").updateAutomation({
        automationId: AUTOMATION_ID,
        name: "New name",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("blocks front_desk from seeding automations", async () => {
    const { db, insertValues } = createDb();
    await expect(
      callerWithDb(db, "front_desk").seedDefaultAutomations()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("blocks front_desk and technician from deleting automations (admin-only)", async () => {
    for (const role of ["front_desk", "technician", "veterinarian"]) {
      const { db, updateSet } = createDb();
      await expect(
        callerWithDb(db, role).deleteAutomation({
          automationId: AUTOMATION_ID,
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(updateSet).not.toHaveBeenCalled();
    }
  });

  it("allows veterinarian to create automations", async () => {
    const { db, insertValues } = createDb({
      insertedRows: [{ id: AUTOMATION_ID }],
    });
    await expect(
      callerWithDb(db, "veterinarian").createAutomation({
        name: "Annual checkup",
        triggerType: "ANNUAL_REMINDER",
        conditions: { delayDays: 365 },
        actionType: "email",
        actionPayload: { templatePrompt: "Pripomienka" },
      })
    ).resolves.toBeDefined();
    expect(insertValues).toHaveBeenCalledOnce();
  });

  it("allows admin to delete automation (soft-delete)", async () => {
    const { db, updateSet } = createDb({
      findFirstResults: [{ id: AUTOMATION_ID, practiceId: PRACTICE_ID }],
      updatedRows: [{ id: AUTOMATION_ID, deletedAt: new Date() }],
    });
    await expect(
      callerWithDb(db, "admin").deleteAutomation({
        automationId: AUTOMATION_ID,
      })
    ).resolves.toEqual({ deleted: true });
    expect(updateSet).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
  });
});

describe("automations tenant scoping", () => {
  it("deleteAutomation returns NOT_FOUND when automation belongs to another practice", async () => {
    // findFirst returns undefined (not found for this practiceId) ↔ correct tenant filter
    const { db } = createDb({ findFirstResults: [] });
    await expect(
      callerWithDb(db, "admin").deleteAutomation({
        automationId: AUTOMATION_ID,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("updateAutomation returns NOT_FOUND when automation belongs to another practice", async () => {
    const { db } = createDb({ findFirstResults: [] });
    await expect(
      callerWithDb(db, "admin").updateAutomation({
        automationId: AUTOMATION_ID,
        name: "Hijacked",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("seedDefaultAutomations is idempotent — does not re-seed when automations exist", async () => {
    const { db, insertValues } = createDb({
      findFirstResults: [{ id: AUTOMATION_ID, practiceId: PRACTICE_ID }],
    });
    const result = await callerWithDb(db, "admin").seedDefaultAutomations();
    expect(result).toEqual({ seeded: false, message: "Automations already exist" });
    expect(insertValues).not.toHaveBeenCalled();
  });
});
