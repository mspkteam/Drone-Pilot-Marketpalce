import { NextResponse } from "next/server";
import { rejectVerification } from "@/lib/verification/verification";
import { requireAdminSession } from "@/lib/auth/require-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = (await request.json()) as { reason?: string };
  const { id } = await context.params;
  const result = await rejectVerification(
    id,
    authResult.userId,
    body.reason ?? "",
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
