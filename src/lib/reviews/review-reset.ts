import { prisma } from "@/lib/db";
import { evaluatePilotAwards } from "@/lib/certificates/awards";

export type ReviewResetRequestDto = {
  id: string;
  pilotProfileId: string;
  pilotDisplayName: string;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  reviewIds: string[];
  nonFiveStarCount: number;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

function parseReviewIds(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export async function listNonFiveStarReviewsForPilot(pilotProfileId: string) {
  return prisma.review.findMany({
    where: {
      targetPilotProfileId: pilotProfileId,
      status: "published",
      rating: { lt: 5 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOpenReviewResetRequest(pilotProfileId: string) {
  return prisma.reviewResetRequest.findFirst({
    where: { pilotProfileId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestReviewReset(
  pilotProfileId: string,
  note?: string | null,
): Promise<
  | { ok: true; request: ReviewResetRequestDto }
  | { ok: false; error: string; status: 400 | 409 }
> {
  const open = await getOpenReviewResetRequest(pilotProfileId);
  if (open) {
    return {
      ok: false,
      error: "You already have a pending review reset request.",
      status: 409,
    };
  }

  const reviews = await listNonFiveStarReviewsForPilot(pilotProfileId);
  if (reviews.length === 0) {
    return {
      ok: false,
      error: "You have no published reviews below 5 stars to reset.",
      status: 400,
    };
  }

  const created = await prisma.reviewResetRequest.create({
    data: {
      pilotProfileId,
      status: "pending",
      note: note?.trim() || null,
      reviewIdsJson: JSON.stringify(reviews.map((r) => r.id)),
    },
    include: {
      pilotProfile: { select: { displayName: true } },
    },
  });

  return {
    ok: true,
    request: {
      id: created.id,
      pilotProfileId: created.pilotProfileId,
      pilotDisplayName: created.pilotProfile.displayName,
      status: "pending",
      note: created.note,
      reviewIds: parseReviewIds(created.reviewIdsJson),
      nonFiveStarCount: reviews.length,
      resolutionNote: null,
      resolvedAt: null,
      createdAt: created.createdAt.toISOString(),
    },
  };
}

export async function listReviewResetRequestsForAdmin(
  status: "pending" | "approved" | "rejected" | "all" = "pending",
): Promise<ReviewResetRequestDto[]> {
  const rows = await prisma.reviewResetRequest.findMany({
    where: status === "all" ? undefined : { status },
    include: { pilotProfile: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map((row) => {
    const reviewIds = parseReviewIds(row.reviewIdsJson);
    return {
      id: row.id,
      pilotProfileId: row.pilotProfileId,
      pilotDisplayName: row.pilotProfile.displayName,
      status: row.status as ReviewResetRequestDto["status"],
      note: row.note,
      reviewIds,
      nonFiveStarCount: reviewIds.length,
      resolutionNote: row.resolutionNote,
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  });
}

export async function resolveReviewResetRequest(
  requestId: string,
  adminUserId: string,
  decision: "approve" | "reject",
  resolutionNote?: string | null,
): Promise<
  | { ok: true; request: ReviewResetRequestDto; hiddenCount: number }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const row = await prisma.reviewResetRequest.findUnique({
    where: { id: requestId },
    include: { pilotProfile: { select: { displayName: true } } },
  });
  if (!row) {
    return { ok: false, error: "Request not found.", status: 404 };
  }
  if (row.status !== "pending") {
    return { ok: false, error: "This request was already resolved.", status: 409 };
  }

  const reviewIds = parseReviewIds(row.reviewIdsJson);
  let hiddenCount = 0;

  if (decision === "approve") {
    const result = await prisma.review.updateMany({
      where: {
        id: { in: reviewIds },
        targetPilotProfileId: row.pilotProfileId,
        status: "published",
        rating: { lt: 5 },
      },
      data: { status: "hidden" },
    });
    hiddenCount = result.count;
    await evaluatePilotAwards(row.pilotProfileId);
  }

  const updated = await prisma.reviewResetRequest.update({
    where: { id: requestId },
    data: {
      status: decision === "approve" ? "approved" : "rejected",
      resolvedByUserId: adminUserId,
      resolvedAt: new Date(),
      resolutionNote: resolutionNote?.trim() || null,
    },
    include: { pilotProfile: { select: { displayName: true } } },
  });

  return {
    ok: true,
    hiddenCount,
    request: {
      id: updated.id,
      pilotProfileId: updated.pilotProfileId,
      pilotDisplayName: updated.pilotProfile.displayName,
      status: updated.status as ReviewResetRequestDto["status"],
      note: updated.note,
      reviewIds,
      nonFiveStarCount: reviewIds.length,
      resolutionNote: updated.resolutionNote,
      resolvedAt: updated.resolvedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    },
  };
}

export type AdminReviewListItem = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  authorEmail: string;
  targetLabel: string;
  targetPilotProfileId: string | null;
  targetClientProfileId: string | null;
  bookingId: string;
};

export async function listReviewsForAdmin(options?: {
  status?: string;
  ratingMax?: number;
}): Promise<AdminReviewListItem[]> {
  const rows = await prisma.review.findMany({
    where: {
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.ratingMax != null
        ? { rating: { lte: options.ratingMax } }
        : {}),
    },
    include: {
      authorUser: { select: { email: true } },
      targetPilotProfile: { select: { displayName: true } },
      targetClientProfile: { select: { contactName: true, companyName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    authorEmail: row.authorUser.email,
    targetLabel:
      row.targetPilotProfile?.displayName ??
      row.targetClientProfile?.companyName ??
      row.targetClientProfile?.contactName ??
      "—",
    targetPilotProfileId: row.targetPilotProfileId,
    targetClientProfileId: row.targetClientProfileId,
    bookingId: row.bookingId,
  }));
}

export async function updateReviewForAdmin(
  reviewId: string,
  input: { status?: "published" | "hidden" | "flagged"; rating?: number },
): Promise<
  | { ok: true; review: AdminReviewListItem }
  | { ok: false; error: string; status: 400 | 404 }
> {
  if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
    return { ok: false, error: "Rating must be 1–5.", status: 400 };
  }
  if (
    input.status != null &&
    !["published", "hidden", "flagged"].includes(input.status)
  ) {
    return { ok: false, error: "Invalid review status.", status: 400 };
  }

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing) {
    return { ok: false, error: "Review not found.", status: 404 };
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.rating != null ? { rating: input.rating } : {}),
    },
    include: {
      authorUser: { select: { email: true } },
      targetPilotProfile: { select: { displayName: true } },
      targetClientProfile: { select: { contactName: true, companyName: true } },
    },
  });

  if (updated.targetPilotProfileId) {
    await evaluatePilotAwards(updated.targetPilotProfileId);
  }

  return {
    ok: true,
    review: {
      id: updated.id,
      rating: updated.rating,
      comment: updated.comment,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      authorEmail: updated.authorUser.email,
      targetLabel:
        updated.targetPilotProfile?.displayName ??
        updated.targetClientProfile?.companyName ??
        updated.targetClientProfile?.contactName ??
        "—",
      targetPilotProfileId: updated.targetPilotProfileId,
      targetClientProfileId: updated.targetClientProfileId,
      bookingId: updated.bookingId,
    },
  };
}
