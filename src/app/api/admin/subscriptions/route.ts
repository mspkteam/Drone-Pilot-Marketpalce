import { NextResponse } from "next/server";
import {
  listPilotSubscriptionsForAdmin,
  listPlansForAdmin,
} from "@/lib/admin/subscriptions";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const [plans, subscriptions] = await Promise.all([
    listPlansForAdmin(),
    listPilotSubscriptionsForAdmin(),
  ]);

  return NextResponse.json({ plans, subscriptions });
}
