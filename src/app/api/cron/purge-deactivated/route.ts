import { NextResponse } from "next/server";
import { purgeExpiredDeactivatedAccounts } from "@/lib/account/deactivation";

/**
 * Permanently delete users whose 30-day reactivation window has ended.
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
    const result = await purgeExpiredDeactivatedAccounts();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/purge-deactivated]", err);
    return NextResponse.json({ error: "Purge failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
