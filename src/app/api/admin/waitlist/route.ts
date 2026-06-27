import { NextResponse } from "next/server";
import {
  isValidWaitlistFilter,
  listWaitlistForAdmin,
} from "@/lib/waitlist/waitlist";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("users");
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
