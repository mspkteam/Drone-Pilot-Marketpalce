import { prisma } from "@/lib/db";
import type { AdminReviewDto } from "@/types/admin";
import type { ReviewStatus } from "@/types/review";
import { REVIEW_STATUSES } from "@/types/review";

export async function listReviewsForAdmin(
  filter?: ReviewStatus | "all",
): Promise<AdminReviewDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const reviews = await prisma.review.findMany({
    where,
    include: {
      authorUser: { select: { email: true } },
      booking: {
        include: { job: { select: { title: true } } },
      },
      targetPilotProfile: { select: { displayName: true } },
      targetClientProfile: { select: { contactName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    bookingId: r.bookingId,
    jobTitle: r.booking.job.title,
    authorEmail: r.authorUser.email,
    targetLabel:
      r.targetPilotProfile?.displayName ??
      r.targetClientProfile?.contactName ??
      "—",
    rating: r.rating,
    comment: r.comment,
    status: r.status as ReviewStatus,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function updateReviewStatusForAdmin(
  reviewId: string,
  status: ReviewStatus,
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return { ok: false, error: "Review not found.", status: 404 };
  }

  if (!REVIEW_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid review status.", status: 400 };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { status },
  });

  return { ok: true };
}

export function isValidReviewFilter(
  value: string,
): value is ReviewStatus | "all" {
  return value === "all" || REVIEW_STATUSES.includes(value as ReviewStatus);
}
