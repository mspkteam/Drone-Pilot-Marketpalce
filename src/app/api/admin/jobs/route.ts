import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listJobsForAdmin } from "@/lib/jobs/admin";
import { JOB_STATUSES, type JobStatus } from "@/types/job";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending_approval";

  if (status !== "all" && !JOB_STATUSES.includes(status as JobStatus)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const jobs = await listJobsForAdmin(
    status === "all" ? "all" : (status as JobStatus),
  );

  return NextResponse.json({ jobs });
}
