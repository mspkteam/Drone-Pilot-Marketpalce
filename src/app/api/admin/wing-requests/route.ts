import { NextResponse } from "next/server";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import { listAviatorWingRequestsForAdmin } from "@/lib/wings/aviator-wing-requests";
import { isAviatorWingRequestStatus } from "@/lib/wings/request-wings";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("verifications");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const status = new URL(request.url).searchParams.get("status") ?? "pending";
  if (status !== "all" && !isAviatorWingRequestStatus(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const requests = await listAviatorWingRequestsForAdmin(
    status === "all" ? "all" : status,
  );
  return NextResponse.json({ requests });
}
