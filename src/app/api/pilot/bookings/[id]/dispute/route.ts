import { NextResponse } from "next/server";
import {
  getDisputeForBookingByParty,
  openDispute,
} from "@/lib/disputes/dispute";
import { requirePilotSession } from "@/lib/auth/require-pilot";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id: bookingId } = await context.params;
  const result = await getDisputeForBookingByParty(
    bookingId,
    authResult.userId,
    "pilot",
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ dispute: result.dispute });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id: bookingId } = await context.params;
  const body = await request.json();
  const result = await openDispute(
    authResult.userId,
    "pilot",
    bookingId,
    body.reason ?? "",
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ dispute: result.dispute }, { status: 201 });
}
