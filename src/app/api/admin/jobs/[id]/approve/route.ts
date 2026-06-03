import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getJobForAdmin } from "@/lib/jobs/admin";
import { canApproveJob } from "@/lib/jobs/status";
import { toJobDto } from "@/lib/jobs/job";
import { prisma } from "@/lib/db";
import { triggerJobApproved } from "@/lib/notifications/triggers";
import type { JobStatus } from "@/types/job";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
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
  if (!canApproveJob(status)) {
    return NextResponse.json(
      { error: "Only jobs pending approval can be approved." },
      { status: 409 },
    );
  }

  const now = new Date();
  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "open",
      approvedAt: now,
      approvedByUserId: authResult.userId,
      rejectionReason: null,
    },
  });

  triggerJobApproved(job.id, job.title);

  const full = await getJobForAdmin(job.id);
  return NextResponse.json({ job: full ?? toJobDto(job) });
}
