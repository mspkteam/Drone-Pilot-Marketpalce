import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { listJobsForClient, toJobDto } from "@/lib/jobs/job";
import { validateJobInput } from "@/lib/jobs/validation";
import { prisma } from "@/lib/db";

export async function GET() {
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

  const jobs = await listJobsForClient(onboarded.profile.id);
  return NextResponse.json({ jobs: jobs.map(toJobDto) });
}

export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const validated = validateJobInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const data = validated.data;
    const scheduledDate = data.scheduledDate
      ? new Date(data.scheduledDate)
      : null;

    const job = await prisma.job.create({
      data: {
        clientProfileId: onboarded.profile.id,
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
        status: "draft",
      },
    });

    return NextResponse.json({ job: toJobDto(job) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create job." },
      { status: 500 },
    );
  }
}
