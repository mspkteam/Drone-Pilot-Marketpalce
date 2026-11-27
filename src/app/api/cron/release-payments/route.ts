import { NextResponse } from "next/server";
import {
  processDueEscrowReleases,
  processEscrowApprovalReminders,
} from "@/lib/stripe/escrow";

/**
 * Day-7/12 client approval reminders, then 14-day auto-release of held escrow.
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
    const reminders = await processEscrowApprovalReminders();
    const result = await processDueEscrowReleases();
    return NextResponse.json({ ok: true, reminders, ...result });
  } catch (err) {
    console.error("[cron/release-payments]", err);
    return NextResponse.json({ error: "Release run failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
