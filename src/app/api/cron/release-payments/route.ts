import { NextResponse } from "next/server";
import { processDueEscrowReleases } from "@/lib/stripe/escrow";

/**
 * Auto-release held escrow payments whose delivery has waited 14+ days for client review.
 * Protect with CRON_SECRET (Authorization: Bearer <secret>) when set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("authorization") ?? "";
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const result = await processDueEscrowReleases();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/release-payments]", err);
    return NextResponse.json({ error: "Release run failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
