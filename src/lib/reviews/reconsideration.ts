import { prisma } from "@/lib/db";
import { evaluatePilotAwards } from "@/lib/certificates/awards";

/**
 * RAS Payment v6 — free review reconsideration.
 * Pilot asks the client to reconsider; client keeps or updates. Nothing is
 * deleted or hidden without the client. Separate from the legacy lifetime reset.
 */

export type ReconsiderationStatus = "pending" | "kept" | "updated";

export type ReviewReconsiderationDto = {
  id: string;
  reviewId: string;
  status: ReconsiderationStatus;
  pilotNote: string | null;
  previousRating: number;
  newRating: number | null;
  clientResponseNote: string | null;
  createdAt: string;
  respondedAt: string | null;
  pilotDisplayName: string;
  jobTitle: string;
  reviewComment: string | null;
};

const include = {
  pilotProfile: { select: { displayName: true } },
  review: {
    select: {
      comment: true,
      booking: { select: { job: { select: { title: true } } } },
    },
  },
} as const;

type Row = {
  id: string;
  reviewId: string;
  status: string;
  pilotNote: string | null;
  previousRating: number;
  newRating: number | null;
  clientResponseNote: string | null;
  createdAt: Date;
  respondedAt: Date | null;
  pilotProfile: { displayName: string };
  review: { comment: string | null; booking: { job: { title: string } } };
};

function toDto(row: Row): ReviewReconsiderationDto {
  return {
    id: row.id,
    reviewId: row.reviewId,
    status: row.status as ReconsiderationStatus,
    pilotNote: row.pilotNote,
    previousRating: row.previousRating,
    newRating: row.newRating,
    clientResponseNote: row.clientResponseNote,
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString() ?? null,
    pilotDisplayName: row.pilotProfile.displayName,
    jobTitle: row.review.booking.job.title,
    reviewComment: row.review.comment,
  };
}

export function canRequestReconsideration(review: {
  rating: number;
  status: string;
}): boolean {
  return review.status === "published" && review.rating < 5;
}

export async function requestReviewReconsideration(
  pilotProfileId: string,
  reviewId: string,
  note?: string | null,
): Promise<
  | { ok: true; request: ReviewReconsiderationDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { booking: { select: { clientProfileId: true } } },
  });
  if (!review) return { ok: false, error: "Review not found.", status: 404 };
  if (review.targetPilotProfileId !== pilotProfileId) {
    return { ok: false, error: "Not your review.", status: 403 };
  }
  if (!canRequestReconsideration(review)) {
    return {
      ok: false,
      error: "Only published reviews below 5 stars can be reconsidered.",
      status: 400,
    };
  }

  const existing = await prisma.reviewReconsiderationRequest.findFirst({
    where: { reviewId },
  });
  if (existing) {
    return {
      ok: false,
      error:
        existing.status === "pending"
          ? "A reconsideration request is already pending for this review."
          : "A reconsideration request was already made for this review.",
      status: 409,
    };
  }

  const created = await prisma.reviewReconsiderationRequest.create({
    data: {
      reviewId,
      pilotProfileId,
      clientProfileId: review.booking.clientProfileId,
      pilotNote: note?.trim().slice(0, 1000) || null,
      previousRating: review.rating,
    },
    include,
  });
  return { ok: true, request: toDto(created) };
}

export async function listReconsiderationsForPilot(
  pilotProfileId: string,
): Promise<ReviewReconsiderationDto[]> {
  const rows = await prisma.reviewReconsiderationRequest.findMany({
    where: { pilotProfileId },
    include,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(toDto);
}

export async function listReconsiderationsForClient(
  clientProfileId: string,
): Promise<ReviewReconsiderationDto[]> {
  const rows = await prisma.reviewReconsiderationRequest.findMany({
    where: { clientProfileId },
    include,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(toDto);
}

export async function respondToReviewReconsideration(
  clientProfileId: string,
  requestId: string,
  input: {
    decision: "keep" | "update";
    rating?: number;
    comment?: string | null;
    note?: string | null;
  },
): Promise<
  | { ok: true; request: ReviewReconsiderationDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const row = await prisma.reviewReconsiderationRequest.findUnique({
    where: { id: requestId },
  });
  if (!row) return { ok: false, error: "Request not found.", status: 404 };
  if (row.clientProfileId !== clientProfileId) {
    return { ok: false, error: "Not your review.", status: 403 };
  }
  if (row.status !== "pending") {
    return { ok: false, error: "Already responded.", status: 409 };
  }

  const responseNote = input.note?.trim().slice(0, 1000) || null;
  const respondedAt = new Date();

  if (input.decision === "keep") {
    const updated = await prisma.reviewReconsiderationRequest.update({
      where: { id: requestId },
      data: { status: "kept", clientResponseNote: responseNote, respondedAt },
      include,
    });
    return { ok: true, request: toDto(updated) };
  }

  const rating = input.rating;
  if (
    rating == null ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, error: "Rating must be 1–5.", status: 400 };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: row.reviewId },
      data: {
        rating,
        ...(input.comment !== undefined
          ? { comment: input.comment?.trim() || null }
          : {}),
      },
    });
    return tx.reviewReconsiderationRequest.update({
      where: { id: requestId },
      data: {
        status: "updated",
        newRating: rating,
        clientResponseNote: responseNote,
        respondedAt,
      },
      include,
    });
  });

  await evaluatePilotAwards(row.pilotProfileId);
  return { ok: true, request: toDto(updated) };
}
