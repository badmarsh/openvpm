import { NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { createTRPCContext } from "@/server/trpc";
import { aiRouter } from "@/server/routers/ai";
import { readJsonRequestBody } from "@/lib/request-json";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const ctx = await createTRPCContext({ req: request });
    if (!ctx.session) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") {
      return NextResponse.json({ error: "application/json required" }, { status: 415, headers });
    }
    const body = await readJsonRequestBody(request, 32 * 1024);
    if (!body.ok) return NextResponse.json({ error: "Invalid or oversized JSON body" }, { status: body.reason === "too_large" ? 413 : 400, headers });
    const result = await aiRouter.createCaller(ctx).generalText(body.data as never);
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof TRPCError) {
      const statuses: Record<string, number> = { UNAUTHORIZED: 401, FORBIDDEN: 403, BAD_REQUEST: 400, PRECONDITION_FAILED: 412, TOO_MANY_REQUESTS: 429, SERVICE_UNAVAILABLE: 503 };
      const status = statuses[error.code] ?? 503;
      return NextResponse.json({ error: status === 503 ? "AI unavailable. Continue without AI." : error.code === "BAD_REQUEST" ? "Invalid text request" : error.message }, { status, headers: { ...headers, ...(status === 429 ? { "Retry-After": "60" } : {}) } });
    }
    return NextResponse.json({ error: "AI unavailable. Continue without AI." }, { status: 503, headers });
  }
}
