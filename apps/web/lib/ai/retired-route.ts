import { NextResponse } from "next/server";

/** Fail closed without parsing input, reading legacy credential rows or fetching. */
export function retiredAiRoute() {
  return NextResponse.json(
    { error: "This legacy AI endpoint is retired. Use authenticated /api/ai/text for text drafts. Configure credentials in the server environment; image analysis and browser-managed model settings are unavailable." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
