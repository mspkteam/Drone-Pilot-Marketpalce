import { NextResponse } from "next/server";
import { resolveDispute } from "@/lib/disputes/dispute";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("disputes", "resolve");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const result = await resolveDispute(id, authResult.userId, {
    resolutionType: body.resolutionType ?? "",
    resolutionNotes: body.resolutionNotes ?? "",
    resolutionAmount: body.resolutionAmount,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ dispute: result.dispute });
}
