import { NextResponse } from "next/server";
import { addDisputeEntry } from "@/lib/disputes/dispute";
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

  const { id } = await context.params;
  const body = await request.json();
  const result = await addDisputeEntry(id, authResult.userId, authResult.role, {
    entryType: "comment",
    body: body.body ?? "",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ entry: result.entry }, { status: 201 });
}
