import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getJobForAdmin } from "@/lib/jobs/admin";
import { canRejectJob } from "@/lib/jobs/status";
import { toJobDto } from "@/lib/jobs/job";
import { prisma } from "@/lib/db";
import { triggerJobRejected } from "@/lib/notifications/triggers";
import type { JobStatus } from "@/types/job";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await params;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const status = existing.status as JobStatus;
  if (!canRejectJob(status)) {
    return NextResponse.json(
      { error: "Only jobs pending approval can be rejected." },
      { status: 409 },
    );
  }

  let body: { reason?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const reason = body.reason?.trim() ?? "";
  if (reason.length < 5) {
    return NextResponse.json(
      { error: "Rejection reason is required (at least 5 characters)." },
      { status: 400 },
    );
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "rejected",
      rejectionReason: reason,
      approvedAt: null,
      approvedByUserId: null,
    },
  });

  triggerJobRejected(job.id, job.title, reason);

  const full = await getJobForAdmin(job.id);
  return NextResponse.json({ job: full ?? toJobDto(job) });
}
