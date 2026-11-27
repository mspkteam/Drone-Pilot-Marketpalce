import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { respondToChangeOrder } from "@/lib/bookings/change-orders";

type RouteContext = { params: Promise<{ id: string; changeOrderId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  if (body?.action !== "accept" && body?.action !== "reject") {
    return NextResponse.json({ error: "action must be accept or reject." }, { status: 400 });
  }

  const { id, changeOrderId } = await context.params;
  const result = await respondToChangeOrder({
    bookingId: id,
    changeOrderId,
    clientProfileId: onboarded.profile.id,
    clientUserId: authResult.userId,
    action: body.action,
    request,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    changeOrder: result.changeOrder,
    ...(result.checkoutUrl ? { checkoutUrl: result.checkoutUrl } : {}),
  });
}
