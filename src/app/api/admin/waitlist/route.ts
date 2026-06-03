import { NextResponse } from "next/server";
import {
  isValidWaitlistFilter,
  listWaitlistForAdmin,
} from "@/lib/waitlist/waitlist";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") ?? "all";

  if (!isValidWaitlistFilter(role)) {
    return NextResponse.json({ error: "Invalid role filter." }, { status: 400 });
  }

  const entries = await listWaitlistForAdmin(role);
  return NextResponse.json({ entries });
}
