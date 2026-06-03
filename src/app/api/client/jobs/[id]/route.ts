import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { getJobForClient, toJobDto } from "@/lib/jobs/job";
import { canClientEditJob } from "@/lib/jobs/status";
import { validateJobInput } from "@/lib/jobs/validation";
import { prisma } from "@/lib/db";
import type { JobStatus } from "@/types/job";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
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
  const job = await getJobForClient(id, onboarded.profile.id);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({ job: toJobDto(job) });
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

  if (!canClientEditJob(existing.status as JobStatus)) {
    return NextResponse.json(
      { error: "This job cannot be edited in its current status." },
      { status: 409 },
    );
  }

  try {
    const body = await request.json();
    const validated = validateJobInput({
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      category: body.category ?? existing.category,
      locationLabel: body.locationLabel ?? existing.locationLabel,
      locationCity: body.locationCity ?? existing.locationCity,
      locationRegion: body.locationRegion ?? existing.locationRegion,
      locationCountry: body.locationCountry ?? existing.locationCountry,
      scheduledDate:
        body.scheduledDate !== undefined
          ? body.scheduledDate
          : existing.scheduledDate?.toISOString() ?? null,
      budgetMin: body.budgetMin ?? existing.budgetMin,
      budgetMax: body.budgetMax ?? existing.budgetMax,
      currency: body.currency ?? existing.currency,
      requirements: body.requirements ?? existing.requirements,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const scheduledDate = data.scheduledDate
      ? new Date(data.scheduledDate)
      : null;

    const job = await prisma.job.update({
      where: { id },
      data: {
        title: data.title!,
        description: data.description!,
        category: data.category!,
        locationLabel: data.locationLabel!,
        locationCity: data.locationCity,
        locationRegion: data.locationRegion,
        locationCountry: data.locationCountry,
        scheduledDate:
          scheduledDate && !Number.isNaN(scheduledDate.getTime())
            ? scheduledDate
            : null,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        currency: data.currency ?? "USD",
        requirements: data.requirements,
        ...(existing.status === "rejected" && { status: "draft" }),
        rejectionReason: existing.status === "rejected" ? null : undefined,
      },
    });

    return NextResponse.json({ job: toJobDto(job) });
  } catch {
    return NextResponse.json(
      { error: "Failed to update job." },
      { status: 500 },
    );
  }
}
