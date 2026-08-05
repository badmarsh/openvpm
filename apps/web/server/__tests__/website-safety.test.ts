import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(async () => ({
    success: true,
    remaining: 4,
    resetAt: new Date("2026-07-01T12:15:00Z"),
  })),
  recordAuditLog: vi.fn(async () => undefined),
  dispatchWebhookEvent: vi.fn(async () => undefined),
  hasHostedFullAccess: vi.fn(() => true),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: mocks.recordAuditLog,
}));

vi.mock("@/lib/webhook-dispatcher", () => ({
  dispatchWebhookEvent: mocks.dispatchWebhookEvent,
}));

vi.mock("@/lib/billing/plans", () => ({
  billingEnforced: () => false,
  hasHostedFullAccess: mocks.hasHostedFullAccess,
}));

const { websiteRouter } = await import("../routers/website");

const PRACTICE_ID = "00000000-0000-0000-0000-0000000000aa";
const OTHER_PRACTICE_ID = "00000000-0000-0000-0000-0000000000bb";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const WEBSITE_ID = "00000000-0000-0000-0000-000000000002";
const PAGE_ID = "00000000-0000-0000-0000-000000000003";

function callerWithDb(
  db: Record<string, unknown>,
  role = "admin",
  practiceId: string = PRACTICE_ID
) {
  const session = {
    user: {
      id: USER_ID,
      email: `${role}@example.com`,
      name: "Test User",
      role,
      practiceId,
    },
  };
  return websiteRouter.createCaller({ db, session } as never);
}

function createDb(opts?: {
  websiteFindFirstResults?: unknown[];
  pageFindFirstResults?: unknown[];
  blockFindFirstResults?: unknown[];
  selectResults?: unknown[];
  updatedRows?: unknown[];
  insertedRows?: unknown[];
}) {
  const websiteFindFirstResults = [...(opts?.websiteFindFirstResults ?? [])];
  const pageFindFirstResults = [...(opts?.pageFindFirstResults ?? [])];
  const blockFindFirstResults = [...(opts?.blockFindFirstResults ?? [])];
  const selectResults = [...(opts?.selectResults ?? [])];

  const insertReturning = vi.fn(
    async () => opts?.insertedRows ?? [{ id: WEBSITE_ID }]
  );
  const insertValues = vi.fn(() => ({ returning: insertReturning }));
  const insert = vi.fn(() => ({ values: insertValues }));

  const updateReturning = vi.fn(async () => opts?.updatedRows ?? []);
  const updateWhere = vi.fn(() => ({ returning: updateReturning }));
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));

  const select = vi.fn(() => {
    const result = selectResults.shift() ?? [];
    const builder = {
      from: vi.fn(() => builder),
      innerJoin: vi.fn(() => builder),
      leftJoin: vi.fn(() => builder),
      where: vi.fn(() => builder),
      orderBy: vi.fn(() => builder),
      limit: vi.fn(async () => result),
      then: (
        resolve: (value: unknown) => unknown,
        reject?: (error: unknown) => unknown
      ) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  });

  const db: Record<string, unknown> = {
    transaction: async (fn: (tx: unknown) => unknown) => fn(db),
    execute: vi.fn(async () => undefined),
    query: {
      websites: {
        findFirst: vi.fn(
          async () => websiteFindFirstResults.shift() ?? undefined
        ),
        findMany: vi.fn(async () => []),
      },
      websitePages: {
        findFirst: vi.fn(async () => pageFindFirstResults.shift() ?? undefined),
        findMany: vi.fn(async () => []),
      },
      websiteBlocks: {
        findFirst: vi.fn(async () => blockFindFirstResults.shift() ?? undefined),
        findMany: vi.fn(async () => []),
      },
      websiteSubmissions: {
        findFirst: vi.fn(async () => undefined),
        findMany: vi.fn(async () => []),
      },
      crmAutomations: {
        findMany: vi.fn(async () => []),
      },
    },
    insert,
    update,
    select,
  };

  return { db, insertValues, updateSet };
}

afterEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue({
    success: true,
    remaining: 4,
    resetAt: new Date("2026-07-01T12:15:00Z"),
  });
});

describe("website RBAC", () => {
  it("blocks front_desk from create/update/publish mutations", async () => {
    const { db, insertValues, updateSet } = createDb();
    const frontDesk = callerWithDb(db, "front_desk");

    await expect(
      frontDesk.createSite({
        slug: "my-clinic",
        title: "My Clinic",
        templateId: "clean-modern",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.updateSite({ id: WEBSITE_ID, title: "Updated" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.publishSite({ id: WEBSITE_ID })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.unpublishSite({ id: WEBSITE_ID })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(insertValues).not.toHaveBeenCalled();
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("allows admin and veterinarian mutations", async () => {
    const { db: adminDb, insertValues } = createDb({
      insertedRows: [{ id: WEBSITE_ID, practiceId: PRACTICE_ID }],
    });
    await expect(
      callerWithDb(adminDb, "admin").createSite({
        slug: "my-clinic",
        title: "My Clinic",
        templateId: "clean-modern",
      })
    ).resolves.toMatchObject({ id: WEBSITE_ID });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ practiceId: PRACTICE_ID })
    );

    const { db: vetDb, updateSet } = createDb({
      selectResults: [[{ id: WEBSITE_ID, practiceId: PRACTICE_ID }]],
      websiteFindFirstResults: [{ id: WEBSITE_ID, practiceId: PRACTICE_ID }],
      updatedRows: [{ id: WEBSITE_ID }],
    });
    await expect(
      callerWithDb(vetDb, "veterinarian").publishSite({ id: WEBSITE_ID })
    ).resolves.toEqual({ published: true });
    expect(updateSet).toHaveBeenCalled();
  });
});

describe("website tenant scoping", () => {
  it("returns null from getSite when no website exists", async () => {
    const { db } = createDb();
    await expect(callerWithDb(db, "admin").getSite()).resolves.toBeFalsy();
  });

  it("rejects update/publish on websites owned by another practice", async () => {
    const { db: updateDb, updateSet: updateSet1 } = createDb({
      websiteFindFirstResults: [{ id: WEBSITE_ID, practiceId: OTHER_PRACTICE_ID }],
    });
    await expect(
      callerWithDb(updateDb, "admin").updateSite({ id: WEBSITE_ID, title: "X" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(updateSet1).not.toHaveBeenCalled();

    const { db: pubDb, updateSet: updateSet2 } = createDb({
      websiteFindFirstResults: [{ id: WEBSITE_ID, practiceId: OTHER_PRACTICE_ID }],
    });
    await expect(
      callerWithDb(pubDb, "admin").publishSite({ id: WEBSITE_ID })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(updateSet2).not.toHaveBeenCalled();
  });

  it("rejects reorderPages for pages outside the caller's practice", async () => {
    const { db, updateSet } = createDb();
    // No owned pages returned by the join query
    await expect(
      callerWithDb(db, "admin").reorderPages({
        pageOrders: [{ id: PAGE_ID, sortOrder: 1 }],
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateSet).not.toHaveBeenCalled();
  });
});

describe("website public contact form rate limiting", () => {
  it("rate-limits contact form submissions before any DB work", async () => {
    mocks.rateLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetAt: new Date("2026-07-01T12:15:00Z"),
    });
    const { db, insertValues } = createDb();
    const caller = callerWithDb(db, "admin"); // public procedure ignores session

    await expect(
      caller.submitContactForm({
        websiteSlug: "my-clinic",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Hello",
        consentTimestamp: new Date().toISOString(),
      })
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "Too many submissions. Please try again later.",
    });

    expect(mocks.rateLimit).toHaveBeenCalledWith({
      key: expect.stringContaining("website-contact:"),
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("allows a contact form submission when rate limit passes", async () => {
    const { db, insertValues } = createDb({
      websiteFindFirstResults: [
        { id: WEBSITE_ID, practiceId: PRACTICE_ID },
      ],
      insertedRows: [{ id: "submission-id" }],
    });
    const caller = callerWithDb(db, "admin");

    await expect(
      caller.submitContactForm({
        websiteSlug: "my-clinic",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Hello",
        consentTimestamp: new Date().toISOString(),
      })
    ).resolves.toMatchObject({ success: true });

    expect(mocks.rateLimit).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalled();
  });
});
