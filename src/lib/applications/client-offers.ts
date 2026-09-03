import { prisma } from "@/lib/db";
import { toApplicationDto } from "@/lib/applications/application";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { averageRating } from "@/lib/reviews/review";
import type { ClientJobApplicationDto } from "@/types/booking";
import { jobAcceptsApplications } from "@/lib/bookings/status";

export type ClientJobOffersResponse = {
  jobId: string;
  jobStatus: string;
  hasBooking: boolean;
  job: {
    id: string;
    title: string;
    locationLabel: string;
    submittedAt: string | null;
    createdAt: string;
  };
  offers: ClientJobApplicationDto[];
};

export async function listApplicationsForClientJob(
  jobId: string,
  clientProfileId: string,
): Promise<ClientJobOffersResponse | null> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    select: {
      id: true,
      title: true,
      locationLabel: true,
      status: true,
      submittedAt: true,
      createdAt: true,
      booking: { select: { id: true } },
    },
  });

  if (!job) return null;

  const applications = await prisma.jobApplication.findMany({
    where: { jobId },
    include: {
      pilotProfile: {
        select: {
          id: true,
          displayName: true,
          locationCity: true,
          locationRegion: true,
          status: true,
          profileExtrasJson: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const pilotIds = applications.map((app) => app.pilotProfileId);
  const [reviewStats, completedCounts] = await Promise.all([
    getReviewStatsForPilots(pilotIds),
    getCompletedBookingCounts(pilotIds),
  ]);

  const offers: ClientJobApplicationDto[] = applications.map((app) => ({
    ...toApplicationDto(app),
    shortlistedAt: app.shortlistedAt?.toISOString() ?? null,
    pilot: {
      id: app.pilotProfile.id,
      displayName: app.pilotProfile.displayName,
      locationCity: app.pilotProfile.locationCity,
      locationRegion: app.pilotProfile.locationRegion,
      averageRating: reviewStats.get(app.pilotProfileId)?.average ?? null,
      reviewCount: reviewStats.get(app.pilotProfileId)?.count ?? 0,
      completedBookings: completedCounts.get(app.pilotProfileId) ?? 0,
      verified: app.pilotProfile.status === "approved",
      avatarUrl: parseProfileExtrasJson(app.pilotProfile.profileExtrasJson)
        .avatarUrl,
    },
  }));

  return {
    jobId: job.id,
    jobStatus: job.status,
    hasBooking: Boolean(job.booking),
    job: {
      id: job.id,
      title: job.title,
      locationLabel: job.locationLabel,
      submittedAt: job.submittedAt?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
    },
    offers,
  };
}

async function getReviewStatsForPilots(pilotProfileIds: string[]) {
  if (pilotProfileIds.length === 0) {
    return new Map<string, { average: number | null; count: number }>();
  }

  const reviews = await prisma.review.findMany({
    where: {
      targetPilotProfileId: { in: pilotProfileIds },
      status: "published",
    },
    select: { targetPilotProfileId: true, rating: true },
  });

  const grouped = new Map<string, number[]>();
  for (const review of reviews) {
    if (!review.targetPilotProfileId) continue;
    const ratings = grouped.get(review.targetPilotProfileId) ?? [];
    ratings.push(review.rating);
    grouped.set(review.targetPilotProfileId, ratings);
  }

  const result = new Map<string, { average: number | null; count: number }>();
  for (const [id, ratings] of grouped) {
    result.set(id, {
      average: averageRating(ratings.map((rating) => ({ rating }))),
      count: ratings.length,
    });
  }
  return result;
}

async function getCompletedBookingCounts(pilotProfileIds: string[]) {
  if (pilotProfileIds.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prisma.booking.groupBy({
    by: ["pilotProfileId"],
    where: {
      pilotProfileId: { in: pilotProfileIds },
      status: "completed",
    },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.pilotProfileId, row._count._all]));
}

export async function rejectJobApplication(
  jobId: string,
  applicationId: string,
  clientProfileId: string,
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    include: { booking: true },
  });

  if (!job) {
    return { ok: false, error: "Job not found.", status: 404 };
  }

  if (job.booking) {
    return {
      ok: false,
      error: "This job already has an assigned pilot.",
      status: 409,
    };
  }

  if (!jobAcceptsApplications(job.status) && job.status !== "in_bidding") {
    return {
      ok: false,
      error: "This job is not accepting offer changes.",
      status: 400,
    };
  }

  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, jobId, status: "submitted" },
  });

  if (!application) {
    return {
      ok: false,
      error: "Application not found or no longer available.",
      status: 404,
    };
  }

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "rejected", shortlistedAt: null },
  });

  return { ok: true };
}

export async function toggleJobApplicationShortlist(
  jobId: string,
  applicationId: string,
  clientProfileId: string,
): Promise<
  | { ok: true; shortlisted: boolean }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    include: { booking: true },
  });

  if (!job) {
    return { ok: false, error: "Job not found.", status: 404 };
  }

  if (job.booking) {
    return {
      ok: false,
      error: "This job already has an assigned pilot.",
      status: 409,
    };
  }

  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, jobId, status: "submitted" },
  });

  if (!application) {
    return {
      ok: false,
      error: "Application not found or no longer available.",
      status: 404,
    };
  }

  const shortlisted = application.shortlistedAt == null;
  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { shortlistedAt: shortlisted ? new Date() : null },
  });

  return { ok: true, shortlisted };
}

export async function markJobApplicationViewed(
  jobId: string,
  applicationId: string,
  clientProfileId: string,
): Promise<
  | { ok: true; clientViewedAt: string }
  | { ok: false; error: string; status: 404 }
> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, clientProfileId },
    select: { id: true },
  });
  if (!job) {
    return { ok: false, error: "Job not found.", status: 404 };
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      jobId,
      status: { not: "draft" },
    },
  });
  if (!application) {
    return { ok: false, error: "Application not found.", status: 404 };
  }

  if (application.clientViewedAt) {
    return {
      ok: true,
      clientViewedAt: application.clientViewedAt.toISOString(),
    };
  }

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { clientViewedAt: new Date() },
  });

  return { ok: true, clientViewedAt: updated.clientViewedAt!.toISOString() };
}
