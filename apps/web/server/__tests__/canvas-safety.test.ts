import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordAuditLog: vi.fn(async () => undefined),
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: mocks.recordAuditLog,
}));

const { canvasRouter } = await import("../routers/canvas");
const CANVAS_SOURCE = readFileSync(
  new URL("../routers/canvas.ts", import.meta.url),
  "utf8"
);

const PRACTICE_ID = "00000000-0000-0000-0000-0000000000aa";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const DOC_ID = "00000000-0000-0000-0000-000000000002";

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
  return canvasRouter.createCaller({ db, session } as never);
}

function createDb(opts?: {
  docFindFirstResults?: unknown[];
  insertedRows?: unknown[];
  updatedRows?: unknown[];
}) {
  const docFindFirstResults = [...(opts?.docFindFirstResults ?? [])];

  const insertReturning = vi.fn(
    async () => opts?.insertedRows ?? [{ id: DOC_ID }]
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
      canvasDocuments: {
        findFirst: vi.fn(
          async () => docFindFirstResults.shift() ?? undefined
        ),
        findMany: vi.fn(async () => []),
      },
      canvasTemplates: {
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

describe("canvas RBAC", () => {
  it("blocks front_desk and technician from writing or deleting documents", async () => {
    const { db, insertValues, updateSet } = createDb();

    for (const role of ["front_desk", "technician"]) {
      const caller = callerWithDb(db, role);
      await expect(
        caller.createDocument({
          title: "SOP",
          docType: "SOP",
          content: "<p>x</p>",
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(
        caller.updateDocument({ documentId: DOC_ID, title: "SOP 2" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(
        caller.deleteDocument({ documentId: DOC_ID })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    }

    expect(insertValues).not.toHaveBeenCalled();
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("blocks veterinarians from deleting documents (admin-only)", async () => {
    const { db, updateSet } = createDb();
    await expect(
      callerWithDb(db, "veterinarian").deleteDocument({ documentId: DOC_ID })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("allows admins to delete documents", async () => {
    const { db, updateSet } = createDb({
      docFindFirstResults: [{ id: DOC_ID, practiceId: PRACTICE_ID }],
      updatedRows: [{ id: DOC_ID, deletedAt: new Date() }],
    });
    await expect(
      callerWithDb(db, "admin").deleteDocument({ documentId: DOC_ID })
    ).resolves.toEqual({ deleted: true });
    expect(updateSet).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
  });
});

describe("canvas content sanitization", () => {
  it("strips scripts and event handlers from created document content", async () => {
    const { db, insertValues } = createDb({
      insertedRows: [{ id: DOC_ID }],
    });
    await callerWithDb(db, "admin").createDocument({
      title: "Crisis manual",
      docType: "MANUAL",
      content:
        '<h1>Title</h1><script>alert(1)</script><img src=x onerror="alert(2)"><p onclick="evil()">Text</p>',
    });

    const inserted = (insertValues as any).mock.calls[0][0];
    expect(inserted.content).toContain("<h1>Title</h1>");
    expect(inserted.content).not.toContain("<script");
    expect(inserted.content).not.toContain("onerror");
    expect(inserted.content).not.toContain("onclick");
  });

  it("strips scripts from updated document content", async () => {
    const { db, updateSet } = createDb({
      docFindFirstResults: [{ id: DOC_ID, practiceId: PRACTICE_ID }],
      updatedRows: [{ id: DOC_ID }],
    });
    await callerWithDb(db, "admin").updateDocument({
      documentId: DOC_ID,
      content: "<p>Safe</p><script>steal(document.cookie)</script>",
    });

    const setArg = (updateSet as any).mock.calls[0][0];
    expect(setArg.content).toContain("<p>Safe</p>");
    expect(setArg.content).not.toContain("<script");
  });
});
