import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { listJobsForClient, toJobDto } from "@/lib/jobs/job";
import {
  parseJobPostProjectMetadata,
  serializeJobPostProjectMetadata,
  type JobPostProjectMetadata,
} from "@/lib/jobs/post-project-metadata";
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
    const postProjectRaw = body.postProject;
    let postProjectJson: string | null = null;
    if (postProjectRaw != null) {
      const serialized = serializeJobPostProjectMetadata(
        postProjectRaw as JobPostProjectMetadata,
      );
      const parsed = parseJobPostProjectMetadata(serialized);
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid post-project metadata." },
          { status: 400 },
        );
      }
      if (
        parsed.deadline &&
        parsed.completionDate &&
        parsed.completionDate < parsed.deadline
      ) {
        return NextResponse.json(
          {
            error:
              "Expected completion date cannot be before the project deadline.",
          },
          { status: 400 },
        );
      }
      // Persist normalized metadata (cleared travel amounts when not covered).
      postProjectJson = serializeJobPostProjectMetadata(parsed);
    }
    const scheduledDate = data.scheduledDate
      ? new Date(data.scheduledDate)
      : null;

    const fixedBudget = postProjectJson
      ? parseJobPostProjectMetadata(postProjectJson)?.quoteType ===
        "fixed_budget"
      : true;

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
        budgetMin: fixedBudget ? data.budgetMin : null,
        budgetMax: fixedBudget ? data.budgetMax : null,
        currency: data.currency ?? "USD",
        requirements: data.requirements,
        postProjectJson,
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
