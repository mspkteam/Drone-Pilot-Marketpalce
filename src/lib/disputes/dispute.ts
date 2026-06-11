import type { Dispute, DisputeEntry } from "@/generated/prisma/client";
import { calculateCommission, DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import type { BookingStatus } from "@/types/booking";
import type {
  DisputeDetailDto,
  DisputeEntryDto,
  DisputeEntryType,
  DisputeListItemDto,
  DisputePartyRole,
  DisputeResolutionType,
  DisputeStatus,
  DisputeSummaryDto,
} from "@/types/dispute";
import {
  DISPUTE_ENTRY_TYPES,
  DISPUTE_PARTY_ROLES,
  DISPUTE_RESOLUTION_TYPES,
  DISPUTE_STATUSES,
} from "@/types/dispute";
import { isAdminRole, type UserRole } from "@/types/roles";

const BOOKING_STATUSES_OPEN_DISPUTE: BookingStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
];

const disputeBookingInclude = {
  job: { select: { id: true, title: true } },
  pilotProfile: { select: { id: true, displayName: true } },
  clientProfile: {
    select: { id: true, contactName: true, companyName: true },
  },
} as const;

const disputeListInclude = {
  booking: {
    include: disputeBookingInclude,
  },
  _count: { select: { entries: true } },
} as const;

const disputeDetailInclude = {
  booking: {
    include: disputeBookingInclude,
  },
  entries: {
    include: {
      authorUser: {
        select: {
          id: true,
          role: true,
          email: true,
          pilotProfile: { select: { displayName: true } },
          clientProfile: { select: { contactName: true, companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

type DisputeWithBooking = Dispute & {
  booking: {
    id: string;
    agreedAmount: number;
    currency: string;
    status: string;
    job: { id: string; title: string };
    pilotProfile: { id: string; displayName: string };
    clientProfile: {
      id: string;
      contactName: string;
      companyName: string | null;
    };
  };
  _count?: { entries: number };
};

type DisputeWithDetail = DisputeWithBooking & {
  entries: (DisputeEntry & {
    authorUser: {
      id: string;
      role: string;
      email: string;
      pilotProfile: { displayName: string } | null;
      clientProfile: {
        contactName: string;
        companyName: string | null;
      } | null;
    };
  })[];
};

function authorLabel(user: {
  role: string;
  email: string;
  pilotProfile: { displayName: string } | null;
  clientProfile: { contactName: string; companyName: string | null } | null;
}): string {
  if (user.role === "pilot" && user.pilotProfile) {
    return user.pilotProfile.displayName;
  }
  if (user.role === "client" && user.clientProfile) {
    return (
      user.clientProfile.companyName ?? user.clientProfile.contactName
    );
  }
  if (isAdminRole(user.role as UserRole)) {
    return user.role === "super_admin" ? "Admin" : "Moderator";
  }
  return user.email;
}

function toEntryDto(
  entry: DisputeEntry & {
    authorUser: Parameters<typeof authorLabel>[0];
  },
): DisputeEntryDto {
  return {
    id: entry.id,
    disputeId: entry.disputeId,
    authorUserId: entry.authorUserId,
    authorRole: entry.authorUser.role,
    authorLabel: authorLabel(entry.authorUser),
    entryType: entry.entryType as DisputeEntryType,
    body: entry.body,
    attachmentUrl: entry.attachmentUrl,
    createdAt: entry.createdAt.toISOString(),
  };
}

function toSummaryDto(dispute: DisputeWithBooking): DisputeSummaryDto {
  return {
    id: dispute.id,
    bookingId: dispute.bookingId,
    status: dispute.status as DisputeStatus,
    reason: dispute.reason,
    openedByRole: dispute.openedByRole as DisputePartyRole,
    openedByUserId: dispute.openedByUserId,
    resolutionType: dispute.resolutionType as DisputeResolutionType | null,
    resolutionAmount: dispute.resolutionAmount,
    resolutionNotes: dispute.resolutionNotes,
    reviewedAt: dispute.reviewedAt?.toISOString() ?? null,
    resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
    createdAt: dispute.createdAt.toISOString(),
    updatedAt: dispute.updatedAt.toISOString(),
    entryCount: dispute._count?.entries ?? 0,
  };
}

function toListItem(dispute: DisputeWithBooking): DisputeListItemDto {
  return {
    ...toSummaryDto(dispute),
    booking: {
      id: dispute.booking.id,
      agreedAmount: dispute.booking.agreedAmount,
      currency: dispute.booking.currency,
      status: dispute.booking.status,
      job: dispute.booking.job,
      pilot: dispute.booking.pilotProfile,
      client: dispute.booking.clientProfile,
    },
  };
}

function toDetailDto(
  dispute: DisputeWithDetail,
  viewer: { userId: string; role: UserRole },
): DisputeDetailDto {
  const isParty =
    viewer.role === "client" || viewer.role === "pilot";
  const isAdmin = isAdminRole(viewer.role);
  const resolved = dispute.status === "resolved";

  return {
    ...toListItem(dispute),
    entries: dispute.entries.map(toEntryDto),
    canAddEntry: !resolved && (isParty || isAdmin),
    canStartReview:
      isAdmin &&
      !resolved &&
      dispute.status === "open",
    canResolve:
      viewer.role === "super_admin" &&
      !resolved &&
      dispute.status === "under_review",
  };
}

async function getBookingPartyContext(
  bookingId: string,
  userId: string,
  role: "client" | "pilot",
): Promise<
  | {
      ok: true;
      booking: {
        id: string;
        status: string;
        agreedAmount: number;
        clientProfileId: string;
        pilotProfileId: string;
        clientUserId: string;
        pilotUserId: string;
      };
    }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      clientProfile: { select: { id: true, userId: true } },
      pilotProfile: { select: { id: true, userId: true } },
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const profileId =
    role === "client"
      ? booking.clientProfileId
      : booking.pilotProfileId;
  const profileUserId =
    role === "client"
      ? booking.clientProfile.userId
      : booking.pilotProfile.userId;

  if (profileUserId !== userId) {
    return { ok: false, error: "Access denied.", status: 403 };
  }

  return {
    ok: true,
    booking: {
      id: booking.id,
      status: booking.status,
      agreedAmount: booking.agreedAmount,
      clientProfileId: booking.clientProfileId,
      pilotProfileId: booking.pilotProfileId,
      clientUserId: booking.clientProfile.userId,
      pilotUserId: booking.pilotProfile.userId,
    },
  };
}

function notifyDisputeParties(
  clientUserId: string,
  pilotUserId: string,
  title: string,
  body: string,
  disputeId: string,
  bookingId: string,
) {
  notifyAsync(async () => {
    for (const userId of [clientUserId, pilotUserId]) {
      await sendNotification({
        userId,
        type: "dispute_update",
        title,
        body,
        payload: { disputeId, bookingId },
      });
    }
  });
}

export async function getDisputeForBookingByParty(
  bookingId: string,
  userId: string,
  role: "client" | "pilot",
): Promise<
  | { ok: true; dispute: DisputeDetailDto | null }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const ctx = await getBookingPartyContext(bookingId, userId, role);
  if (!ctx.ok) return ctx;

  const dispute = await prisma.dispute.findUnique({
    where: { bookingId },
    include: disputeDetailInclude,
  });

  if (!dispute) {
    return { ok: true, dispute: null };
  }

  return {
    ok: true,
    dispute: toDetailDto(dispute as DisputeWithDetail, {
      userId,
      role,
    }),
  };
}

export async function openDispute(
  userId: string,
  role: "client" | "pilot",
  bookingId: string,
  reason: string,
): Promise<
  | { ok: true; dispute: DisputeDetailDto }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 }
> {
  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10) {
    return {
      ok: false,
      error: "Describe the dispute in at least 10 characters.",
      status: 400,
    };
  }

  const ctx = await getBookingPartyContext(bookingId, userId, role);
  if (!ctx.ok) return ctx;

  const status = ctx.booking.status as BookingStatus;
  if (!BOOKING_STATUSES_OPEN_DISPUTE.includes(status)) {
    return {
      ok: false,
      error:
        "Disputes can only be opened for confirmed, in-progress, or completed bookings.",
      status: 400,
    };
  }

  const existing = await prisma.dispute.findUnique({
    where: { bookingId },
  });
  if (existing) {
    return {
      ok: false,
      error: "A dispute already exists for this booking.",
      status: 409,
    };
  }

  const dispute = await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "disputed" },
    });

    const created = await tx.dispute.create({
      data: {
        bookingId,
        openedByUserId: userId,
        openedByRole: role,
        reason: trimmedReason,
        status: "open",
        entries: {
          create: {
            authorUserId: userId,
            entryType: "note",
            body: trimmedReason,
          },
        },
      },
      include: disputeDetailInclude,
    });

    return created;
  });

  notifyDisputeParties(
    ctx.booking.clientUserId,
    ctx.booking.pilotUserId,
    "Dispute opened",
    `A dispute was opened on booking ${bookingId.slice(0, 8)}…`,
    dispute.id,
    bookingId,
  );

  return {
    ok: true,
    dispute: toDetailDto(dispute as DisputeWithDetail, { userId, role }),
  };
}

export async function addDisputeEntry(
  disputeId: string,
  userId: string,
  role: UserRole,
  input: {
    entryType: string;
    body: string;
    attachmentUrl?: string | null;
  },
): Promise<
  | { ok: true; entry: DisputeEntryDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          clientProfile: { select: { userId: true } },
          pilotProfile: { select: { userId: true } },
        },
      },
    },
  });

  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  if (dispute.status === "resolved") {
    return {
      ok: false,
      error: "This dispute is resolved. No further entries.",
      status: 400,
    };
  }

  const isClient = dispute.booking.clientProfile.userId === userId;
  const isPilot = dispute.booking.pilotProfile.userId === userId;
  const isAdmin = isAdminRole(role);

  if (!isClient && !isPilot && !isAdmin) {
    return { ok: false, error: "Access denied.", status: 403 };
  }

  const entryType = input.entryType as DisputeEntryType;
  if (!DISPUTE_ENTRY_TYPES.includes(entryType)) {
    return { ok: false, error: "Invalid entry type.", status: 400 };
  }

  if (isAdmin && entryType !== "comment") {
    return {
      ok: false,
      error: "Moderators and admins may only add comments.",
      status: 400,
    };
  }

  const body = input.body.trim();
  if (body.length < 2) {
    return { ok: false, error: "Entry text is required.", status: 400 };
  }

  let attachmentUrl: string | null = null;
  if (entryType === "evidence") {
    const url = input.attachmentUrl?.trim();
    if (!url || url.length < 8) {
      return {
        ok: false,
        error: "Evidence requires a document or file URL (min 8 chars).",
        status: 400,
      };
    }
    if (url.length > 500) {
      return { ok: false, error: "URL is too long.", status: 400 };
    }
    attachmentUrl = url;
  }

  const entry = await prisma.disputeEntry.create({
    data: {
      disputeId,
      authorUserId: userId,
      entryType,
      body,
      attachmentUrl,
    },
    include: {
      authorUser: {
        select: {
          id: true,
          role: true,
          email: true,
          pilotProfile: { select: { displayName: true } },
          clientProfile: {
            select: { contactName: true, companyName: true },
          },
        },
      },
    },
  });

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { updatedAt: new Date() },
  });

  notifyDisputeParties(
    dispute.booking.clientProfile.userId,
    dispute.booking.pilotProfile.userId,
    "Dispute updated",
    `New ${entryType} on dispute ${disputeId.slice(0, 8)}…`,
    disputeId,
    dispute.bookingId,
  );

  return { ok: true, entry: toEntryDto(entry) };
}

export async function listDisputesForAdmin(
  statusFilter?: DisputeStatus | "all",
): Promise<DisputeListItemDto[]> {
  const where =
    statusFilter && statusFilter !== "all"
      ? { status: statusFilter }
      : undefined;

  const rows = await prisma.dispute.findMany({
    where,
    include: disputeListInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return rows.map((r) => toListItem(r as DisputeWithBooking));
}

export async function listDisputesForClient(
  clientProfileId: string,
  statusFilter?: DisputeStatus | "all",
): Promise<DisputeListItemDto[]> {
  const where: {
    booking: { clientProfileId: string };
    status?: DisputeStatus;
  } = {
    booking: { clientProfileId },
  };

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter;
  }

  const rows = await prisma.dispute.findMany({
    where,
    include: disputeListInclude,
    orderBy: [{ updatedAt: "desc" }],
  });

  return rows.map((r) => toListItem(r as DisputeWithBooking));
}

export async function getDisputeForClient(
  disputeId: string,
  clientProfileId: string,
  userId: string,
): Promise<
  | { ok: true; dispute: DisputeDetailDto }
  | { ok: false; error: string; status: 403 | 404 }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: disputeDetailInclude,
  });

  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  if (dispute.booking.clientProfile.id !== clientProfileId) {
    return { ok: false, error: "Not allowed.", status: 403 };
  }

  return {
    ok: true,
    dispute: toDetailDto(dispute as DisputeWithDetail, {
      userId,
      role: "client",
    }),
  };
}

export async function getDisputeForAdmin(
  disputeId: string,
  viewer: { userId: string; role: UserRole },
): Promise<
  | { ok: true; dispute: DisputeDetailDto }
  | { ok: false; error: string; status: 404 }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: disputeDetailInclude,
  });

  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  return {
    ok: true,
    dispute: toDetailDto(dispute as DisputeWithDetail, viewer),
  };
}

export async function startDisputeReview(
  disputeId: string,
  moderatorUserId: string,
): Promise<
  | { ok: true; dispute: DisputeDetailDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          clientProfile: { select: { userId: true } },
          pilotProfile: { select: { userId: true } },
        },
      },
    },
  });

  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  if (dispute.status !== "open") {
    return {
      ok: false,
      error: "Only open disputes can be moved to review.",
      status: 400,
    };
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: "under_review",
        reviewedByUserId: moderatorUserId,
        reviewedAt: now,
      },
      include: disputeDetailInclude,
    });

    await tx.disputeEntry.create({
      data: {
        disputeId,
        authorUserId: moderatorUserId,
        entryType: "comment",
        body: "Dispute marked under review by moderation team.",
      },
    });

    return d;
  });

  notifyDisputeParties(
    dispute.booking.clientProfile.userId,
    dispute.booking.pilotProfile.userId,
    "Dispute under review",
    "A moderator is reviewing your dispute.",
    disputeId,
    dispute.bookingId,
  );

  return {
    ok: true,
    dispute: toDetailDto(updated as DisputeWithDetail, {
      userId: moderatorUserId,
      role: "moderator",
    }),
  };
}

async function applyResolutionPayment(
  bookingId: string,
  resolutionType: DisputeResolutionType,
  resolutionAmount: number | null,
  agreedAmount: number,
) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { commission: true },
  });
  if (!payment) return;

  if (resolutionType === "refund") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "refunded", amountNet: 0 },
      });
      if (payment.commission) {
        await tx.commission.update({
          where: { id: payment.commission.id },
          data: { status: "waived", amount: 0 },
        });
      }
    });
    return;
  }

  if (resolutionType === "full_payout") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "succeeded",
        amountNet: payment.amountGross,
      },
    });
    return;
  }

  if (resolutionType === "partial_payout") {
    const pilotNet =
      resolutionAmount ?? payment.amountNet;
    const capped = Math.min(
      Math.max(0, pilotNet),
      payment.amountGross,
    );
    const { amount: commissionAmount } = calculateCommission(
      payment.amountGross,
      DEFAULT_COMMISSION_RATE,
    );
    const adjustedCommission = Math.min(
      commissionAmount,
      payment.amountGross - capped,
    );

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "succeeded",
          amountNet: capped,
        },
      });
      if (payment.commission) {
        await tx.commission.update({
          where: { id: payment.commission.id },
          data: { amount: adjustedCommission },
        });
      }
    });
  }
}

export async function resolveDispute(
  disputeId: string,
  adminUserId: string,
  input: {
    resolutionType: string;
    resolutionNotes: string;
    resolutionAmount?: number | null;
  },
): Promise<
  | { ok: true; dispute: DisputeDetailDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const resolutionType = input.resolutionType as DisputeResolutionType;
  if (!DISPUTE_RESOLUTION_TYPES.includes(resolutionType)) {
    return { ok: false, error: "Invalid resolution type.", status: 400 };
  }

  const notes = input.resolutionNotes.trim();
  if (notes.length < 5) {
    return {
      ok: false,
      error: "Resolution notes are required (min 5 chars).",
      status: 400,
    };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          clientProfile: { select: { userId: true } },
          pilotProfile: { select: { userId: true } },
        },
      },
    },
  });

  if (!dispute) {
    return { ok: false, error: "Dispute not found.", status: 404 };
  }

  if (dispute.status !== "under_review") {
    return {
      ok: false,
      error: "Dispute must be under review before resolution.",
      status: 400,
    };
  }

  let resolutionAmount: number | null = null;
  if (resolutionType === "partial_payout") {
    const amount = input.resolutionAmount;
    if (typeof amount !== "number" || amount <= 0) {
      return {
        ok: false,
        error: "Partial payout requires a positive pilot payout amount.",
        status: 400,
      };
    }
    if (amount > dispute.booking.agreedAmount) {
      return {
        ok: false,
        error: "Payout amount cannot exceed the agreed booking amount.",
        status: 400,
      };
    }
    resolutionAmount = amount;
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: "resolved",
        resolutionType,
        resolutionAmount,
        resolutionNotes: notes,
        resolvedByUserId: adminUserId,
        resolvedAt: now,
      },
      include: disputeDetailInclude,
    });

    await tx.disputeEntry.create({
      data: {
        disputeId,
        authorUserId: adminUserId,
        entryType: "comment",
        body: `Resolved: ${resolutionType}. ${notes}`,
      },
    });

    return d;
  });

  await applyResolutionPayment(
    dispute.bookingId,
    resolutionType,
    resolutionAmount,
    dispute.booking.agreedAmount,
  );

  notifyDisputeParties(
    dispute.booking.clientProfile.userId,
    dispute.booking.pilotProfile.userId,
    "Dispute resolved",
    `Resolution: ${resolutionType}.`,
    disputeId,
    dispute.bookingId,
  );

  return {
    ok: true,
    dispute: toDetailDto(updated as DisputeWithDetail, {
      userId: adminUserId,
      role: "super_admin",
    }),
  };
}

export async function countActiveDisputes(): Promise<number> {
  return prisma.dispute.count({
    where: { status: { in: ["open", "under_review"] } },
  });
}

export function isDisputePartyRole(value: string): value is DisputePartyRole {
  return (DISPUTE_PARTY_ROLES as readonly string[]).includes(value);
}
