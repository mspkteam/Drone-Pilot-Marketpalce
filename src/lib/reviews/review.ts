import type { Review } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { triggerReviewReceived } from "@/lib/notifications/triggers";
import { evaluateAndAssignWings } from "@/lib/wings/wings";
import type {
  BookingReviewsDto,
  ReviewDto,
  ReviewListItemDto,
  ReviewStatus,
} from "@/types/review";

export function toReviewDto(review: Review): ReviewDto {
  return {
    id: review.id,
    bookingId: review.bookingId,
    authorUserId: review.authorUserId,
    targetPilotProfileId: review.targetPilotProfileId,
    targetClientProfileId: review.targetClientProfileId,
    rating: review.rating,
    comment: review.comment,
    status: review.status as ReviewStatus,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

const reviewListInclude = {
  booking: {
    select: {
      id: true,
      job: { select: { id: true, title: true } },
      pilotProfile: { select: { displayName: true } },
      clientProfile: { select: { contactName: true, companyName: true } },
    },
  },
  authorUser: {
    select: {
      id: true,
      role: true,
      pilotProfile: { select: { displayName: true } },
      clientProfile: { select: { contactName: true } },
    },
  },
  targetPilotProfile: { select: { displayName: true } },
  targetClientProfile: { select: { contactName: true, companyName: true } },
} as const;

function authorLabel(
  author: {
    role: string;
    pilotProfile: { displayName: string } | null;
    clientProfile: { contactName: string } | null;
  },
): string {
  if (author.role === "pilot" && author.pilotProfile) {
    return author.pilotProfile.displayName;
  }
  if (author.clientProfile) {
    return author.clientProfile.contactName;
  }
  return "User";
}

function targetLabel(review: {
  targetPilotProfile: { displayName: string } | null;
  targetClientProfile: { contactName: string; companyName: string | null } | null;
}): string {
  if (review.targetPilotProfile) {
    return review.targetPilotProfile.displayName;
  }
  if (review.targetClientProfile) {
    return (
      review.targetClientProfile.companyName ??
      review.targetClientProfile.contactName
    );
  }
  return "Unknown";
}

function toListItem(
  review: Review & {
    booking: {
      id: string;
      job: { id: string; title: string };
      pilotProfile: { displayName: string };
      clientProfile: { contactName: string; companyName: string | null };
    };
    authorUser: {
      id: string;
      role: string;
      pilotProfile: { displayName: string } | null;
      clientProfile: { contactName: string } | null;
    };
    targetPilotProfile: { displayName: string } | null;
    targetClientProfile: {
      contactName: string;
      companyName: string | null;
    } | null;
  },
  viewerUserId: string,
): ReviewListItemDto {
  const direction = review.authorUserId === viewerUserId ? "given" : "received";
  return {
    ...toReviewDto(review),
    booking: {
      id: review.booking.id,
      job: review.booking.job,
    },
    authorLabel: authorLabel(review.authorUser),
    targetLabel: targetLabel(review),
    direction,
  };
}

export async function listReviewsForClientUser(userId: string, clientProfileId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      status: "published",
      OR: [
        { authorUserId: userId },
        { targetClientProfileId: clientProfileId },
      ],
    },
    include: reviewListInclude,
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => toListItem(r, userId));
}

export async function listReviewsForPilotUser(userId: string, pilotProfileId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      status: "published",
      OR: [
        { authorUserId: userId },
        { targetPilotProfileId: pilotProfileId },
      ],
    },
    include: reviewListInclude,
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => toListItem(r, userId));
}

export async function getBookingReviewsForParty(
  bookingId: string,
  options: {
    userId: string;
    role: "client" | "pilot";
    clientProfileId?: string;
    pilotProfileId?: string;
  },
): Promise<BookingReviewsDto | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      pilotProfile: { select: { displayName: true } },
      clientProfile: {
        select: { contactName: true, companyName: true },
      },
      reviews: true,
    },
  });

  if (!booking) return null;

  const isParty =
    options.role === "client"
      ? booking.clientProfileId === options.clientProfileId
      : booking.pilotProfileId === options.pilotProfileId;

  if (!isParty) return null;

  const published = booking.reviews.filter((r) => r.status === "published");
  const myReview = booking.reviews.find((r) => r.authorUserId === options.userId);

  const targetLabel =
    options.role === "client"
      ? booking.pilotProfile.displayName
      : (booking.clientProfile.companyName ?? booking.clientProfile.contactName);

  return {
    reviews: published.map(toReviewDto),
    myReview: myReview ? toReviewDto(myReview) : null,
    canReview: booking.status === "completed" && !myReview,
    targetLabel,
  };
}

export async function createReview(
  bookingId: string,
  authorUserId: string,
  role: "client" | "pilot",
  input: { rating: number; comment: string | null },
): Promise<
  | { ok: true; review: ReviewDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      clientProfile: { select: { userId: true, id: true } },
      pilotProfile: { select: { userId: true, id: true } },
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  if (booking.status !== "completed") {
    return {
      ok: false,
      error: "Reviews can only be left on completed bookings.",
      status: 400,
    };
  }

  if (role === "client") {
    if (booking.clientProfile.userId !== authorUserId) {
      return { ok: false, error: "Not your booking.", status: 403 };
    }
  } else if (booking.pilotProfile.userId !== authorUserId) {
    return { ok: false, error: "Not your booking.", status: 403 };
  }

  const existing = await prisma.review.findUnique({
    where: {
      bookingId_authorUserId: { bookingId, authorUserId },
    },
  });

  if (existing) {
    return {
      ok: false,
      error: "You have already reviewed this booking.",
      status: 409,
    };
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      authorUserId,
      targetPilotProfileId:
        role === "client" ? booking.pilotProfileId : null,
      targetClientProfileId:
        role === "pilot" ? booking.clientProfileId : null,
      rating: input.rating,
      comment: input.comment,
      status: "published",
    },
  });

  const job = await prisma.job.findUnique({
    where: { id: booking.jobId },
    select: { title: true },
  });
  const targetUserId =
    role === "client"
      ? booking.pilotProfile.userId
      : booking.clientProfile.userId;
  triggerReviewReceived(
    targetUserId,
    input.rating,
    job?.title ?? "your booking",
    bookingId,
  );

  if (role === "client" && input.rating === 5) {
    await evaluateAndAssignWings(booking.pilotProfileId);
  }

  return { ok: true, review: toReviewDto(review) };
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export {
  getPublicPilotRatingTag,
  MIN_REVIEWS_FOR_PUBLIC_RATING,
  PUBLIC_RATING_PENDING_LABEL,
} from "@/lib/reviews/public-rating";
