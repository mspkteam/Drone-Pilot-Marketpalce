import "server-only";

import { listApplicationsForClientJob } from "@/lib/applications/client-offers";
import {
  mapOfferToProjectBid,
  type ClientProjectBid,
  type ClientProjectBidSummary,
  type ClientProjectJobOption,
} from "@/lib/client/project-bids";
import { formatClientProjectPostedLabel } from "@/lib/client/my-projects";
import { prisma } from "@/lib/db";

export type ClientProjectBidsPageData = {
  jobOptions: ClientProjectJobOption[];
  selectedJobId: string | null;
  summary: ClientProjectBidSummary | null;
  bids: ClientProjectBid[];
  hasBooking: boolean;
  bookingId: string | null;
};

export async function getClientProjectBidsPageData(
  clientProfileId: string,
  requestedJobId?: string | null,
): Promise<ClientProjectBidsPageData> {
  const jobs = await prisma.job.findMany({
    where: {
      clientProfileId,
      status: { not: "draft" },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { applications: true } },
      booking: { select: { id: true } },
    },
  });

  const jobOptions: ClientProjectJobOption[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    bidCount: job._count.applications,
  }));

  if (jobs.length === 0) {
    return {
      jobOptions: [],
      selectedJobId: null,
      summary: null,
      bids: [],
      hasBooking: false,
      bookingId: null,
    };
  }

  const selectedJobId =
    requestedJobId && jobs.some((job) => job.id === requestedJobId)
      ? requestedJobId
      : (jobs.find((job) => job._count.applications > 0)?.id ?? jobs[0].id);

  const offersResult = await listApplicationsForClientJob(
    selectedJobId,
    clientProfileId,
  );

  if (!offersResult) {
    return {
      jobOptions,
      selectedJobId,
      summary: null,
      bids: [],
      hasBooking: false,
      bookingId: null,
    };
  }

  const postedAt =
    offersResult.job.submittedAt ?? offersResult.job.createdAt;

  return {
    jobOptions,
    selectedJobId,
    summary: {
      jobId: offersResult.job.id,
      title: offersResult.job.title,
      location: offersResult.job.locationLabel,
      postedLabel: formatClientProjectPostedLabel(postedAt),
    },
    bids: offersResult.offers.map((offer) => mapOfferToProjectBid(offer)),
    hasBooking: offersResult.hasBooking,
    bookingId: offersResult.hasBooking
      ? (jobs.find((job) => job.id === selectedJobId)?.booking?.id ?? null)
      : null,
  };
}
