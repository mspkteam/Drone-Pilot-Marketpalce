import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { getJobForClient, toJobDto } from "@/lib/jobs/job";
import { prisma } from "@/lib/db";
import { triggerJobSubmitted } from "@/lib/notifications/triggers";
import type { JobStatus } from "@/types/job";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getJobForClient(id, onboarded.profile.id);
  if (!existing) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const status = existing.status as JobStatus;
  if (status !== "draft" && status !== "rejected") {
    return NextResponse.json(
      { error: "Only draft or rejected jobs can be submitted for approval." },
      { status: 409 },
    );
  }

  const now = new Date();
  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "pending_approval",
      submittedAt: now,
      rejectionReason: null,
    },
  });

  triggerJobSubmitted(authResult.userId, job.title, job.id);

  return NextResponse.json({ job: toJobDto(job) });
}
