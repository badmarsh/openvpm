import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordAuditLog: vi.fn(async () => undefined),
}));

vi.mock("@/lib/audit", () => ({
  recordAuditLog: mocks.recordAuditLog,
}));

const { marketingRouter } = await import("../routers/marketing");
const MARKETING_SOURCE = readFileSync(
  new URL("../routers/marketing.ts", import.meta.url),
  "utf8"
);

const PRACTICE_ID = "00000000-0000-0000-0000-0000000000aa";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const POST_ID = "00000000-0000-0000-0000-000000000002";

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
  return marketingRouter.createCaller({ db, session } as never);
}

function createDb(opts?: {
  postFindFirstResults?: unknown[];
  insertedRows?: unknown[];
  updatedRows?: unknown[];
}) {
  const postFindFirstResults = [...(opts?.postFindFirstResults ?? [])];

  const insertReturning = vi.fn(
    async () => opts?.insertedRows ?? [{ id: POST_ID }]
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
      marketingPosts: {
        findFirst: vi.fn(
          async () => postFindFirstResults.shift() ?? undefined
        ),
        findMany: vi.fn(async () => []),
      },
      marketingTemplates: {
        findFirst: vi.fn(async () => undefined),
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

describe("marketing RBAC", () => {
  it("blocks front_desk from every marketing mutation", async () => {
    const { db, insertValues, updateSet } = createDb();
    const frontDesk = callerWithDb(db, "front_desk");

    await expect(
      frontDesk.createPost({ status: "draft", variants: {} })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.updatePost({ postId: POST_ID, status: "approved" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.updatePostStatus({ postId: POST_ID, newStatus: "approved" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      frontDesk.deletePost({ postId: POST_ID })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(frontDesk.seedDefaultTemplates()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    expect(insertValues).not.toHaveBeenCalled();
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("blocks viewers from mutating via the global read-only guard", async () => {
    const { db, insertValues } = createDb();
    await expect(
      callerWithDb(db, "viewer").createPost({ status: "draft", variants: {} })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("lets technicians write posts but not delete them", async () => {
    const { db: writeDb, insertValues } = createDb({
      insertedRows: [{ id: POST_ID, status: "draft" }],
    });
    await expect(
      callerWithDb(writeDb, "technician").createPost({
        status: "draft",
        variants: {},
      })
    ).resolves.toMatchObject({ id: POST_ID });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ practiceId: PRACTICE_ID, authorId: USER_ID })
    );

    const { db: deleteDb, updateSet } = createDb();
    await expect(
      callerWithDb(deleteDb, "technician").deletePost({ postId: POST_ID })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("allows admins and veterinarians to delete posts", async () => {
    const { db, updateSet } = createDb({
      postFindFirstResults: [{ id: POST_ID, practiceId: PRACTICE_ID }],
      updatedRows: [{ id: POST_ID, deletedAt: new Date() }],
    });
    await expect(
      callerWithDb(db, "veterinarian").deletePost({ postId: POST_ID })
    ).resolves.toEqual({ deleted: true });
    expect(updateSet).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
  });
});

describe("marketing tenant scoping", () => {
  it("rejects updates, status changes, and deletes for posts outside the caller's practice", async () => {
    const { db: updateDb, updateSet: updateSet1 } = createDb({
      postFindFirstResults: [undefined],
    });
    await expect(
      callerWithDb(updateDb, "admin").updatePost({
        postId: POST_ID,
        status: "approved",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(updateSet1).not.toHaveBeenCalled();

    const { db: statusDb, updateSet: updateSet2 } = createDb({
      postFindFirstResults: [undefined],
    });
    await expect(
      callerWithDb(statusDb, "admin").updatePostStatus({
        postId: POST_ID,
        newStatus: "approved",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(updateSet2).not.toHaveBeenCalled();

    const { db: deleteDb, updateSet: updateSet3 } = createDb({
      postFindFirstResults: [undefined],
    });
    await expect(
      callerWithDb(deleteDb, "admin").deletePost({ postId: POST_ID })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(updateSet3).not.toHaveBeenCalled();
  });

  it("keeps every post and template query scoped to ctx.practiceId and active rows", () => {
    expect(
      MARKETING_SOURCE.match(
        /eq\(marketingPosts\.practiceId, ctx\.practiceId\)/g
      )?.length ?? 0
    ).toBeGreaterThanOrEqual(5);
    expect(
      MARKETING_SOURCE.match(/isNull\(marketingPosts\.deletedAt\)/g)
        ?.length ?? 0
    ).toBeGreaterThanOrEqual(5);
    expect(MARKETING_SOURCE).toContain(
      "eq(marketingTemplates.practiceId, ctx.practiceId)"
    );
  });

  it("requires staff roles for every marketing mutation", () => {
    expect(MARKETING_SOURCE).toContain(
      '.use(requireRole("admin", "veterinarian"))'
    );
    expect(
      MARKETING_SOURCE.match(
        /\.use\(requireRole\("admin", "veterinarian", "technician"\)\)/g
      )?.length ?? 0
    ).toBeGreaterThanOrEqual(3);
  });
});
