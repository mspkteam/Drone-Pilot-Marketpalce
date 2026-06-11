import { NextResponse } from "next/server";
import {
  listPilotSubscriptionsForAdmin,
  listPlansForAdmin,
} from "@/lib/admin/subscriptions";
import { getSubscriptionStatsForAdmin } from "@/lib/admin/subscription-stats";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const [plans, subscriptions, stats] = await Promise.all([
    listPlansForAdmin(),
    listPilotSubscriptionsForAdmin(),
    getSubscriptionStatsForAdmin(),
  ]);

  return NextResponse.json({ plans, subscriptions, stats });
}
