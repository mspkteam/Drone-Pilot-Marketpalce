import { NextResponse } from "next/server";
import {
  listPilotSubscriptionsForAdmin,
  listPlansForAdmin,
} from "@/lib/admin/subscriptions";
import { getSubscriptionStatsForAdmin } from "@/lib/admin/subscription-stats";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("subscriptions");
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
