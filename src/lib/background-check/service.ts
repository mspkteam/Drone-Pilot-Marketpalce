import { prisma } from "@/lib/db";
import { getPilotActiveTier } from "@/lib/membership/membership";
import { sendNotification } from "@/lib/notifications/notify";
import {
  BACKGROUND_CHECK_FEE_CENTS,
  BACKGROUND_CHECK_FEE_USD,
  BACKGROUND_CHECK_PAUSED_MESSAGE,
  computeBackgroundCheckDeadline,
  daysUntilDeadline,
  getBackgroundCheckPayBlockReason,
  isBackgroundCheckStatus,
  isMarketplacePausedByBackgroundCheck,
  resolveDeadlineStart,
} from "@/lib/background-check/rules";
import {
  BACKGROUND_CHECK_STATUS_LABELS,
  type AdminBackgroundCheckRowDto,
  type BackgroundCheckStatus,
  type PilotBackgroundCheckDto,
} from "@/types/background-check";

function normalizeStatus(value: string | null | undefined): BackgroundCheckStatus {
  return isBackgroundCheckStatus(value) ? value : "not_started";
}

/** Called when admin approves a pilot profile: starts the 30-day window. */
export async function startBackgroundCheckWindow(pilotProfileId: string) {
  const existing = await prisma.pilotBackgroundCheck.findUnique({
    where: { pilotProfileId },
    select: { id: true, deadlineStartedAt: true },
  });
  if (!existing) {
    await prisma.pilotBackgroundCheck.create({
      data: { pilotProfileId, deadlineStartedAt: new Date() },
    });
  } else if (!existing.deadlineStartedAt) {
    await prisma.pilotBackgroundCheck.update({
      where: { pilotProfileId },
      data: { deadlineStartedAt: new Date() },
    });
  }
}

/** True when marketplace actions (proposals / hire) must be blocked for this pilot. */
export async function isPilotMarketplacePaused(
  pilotProfileId: string,
): Promise<boolean> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: pilotProfileId },
    select: { status: true, backgroundCheck: true },
  });
  // Only approved pilots are on the marketplace; others are gated elsewhere.
  if (!profile || profile.status !== "approved") return false;
  return isMarketplacePausedByBackgroundCheck({
    status: profile.backgroundCheck?.status,
    deadlineStartedAt: profile.backgroundCheck?.deadlineStartedAt,
  });
}

export async function requireMarketplaceNotPaused(pilotProfileId: string) {
  if (await isPilotMarketplacePaused(pilotProfileId)) {
    return {
      ok: false as const,
      status: 403 as const,
      error: BACKGROUND_CHECK_PAUSED_MESSAGE,
    };
  }
  return { ok: true as const };
}

export async function getPilotBackgroundCheck(
  userId: string,
): Promise<PilotBackgroundCheckDto | null> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { userId },
    include: { backgroundCheck: true },
  });
  if (!profile) return null;

  const record = profile.backgroundCheck;
  const status = normalizeStatus(record?.status);
  const tier = await getPilotActiveTier(profile.id);
  const deadlineStart = resolveDeadlineStart(record?.deadlineStartedAt);
  const deadline = computeBackgroundCheckDeadline(record?.deadlineStartedAt);

  const payBlockReason = getBackgroundCheckPayBlockReason({
    profileApproved: profile.status === "approved",
    hasActiveMembership: tier != null,
    status,
    consentAccepted: true,
  });

  let verifiedByName: string | null = null;
  if (record?.faaVerifiedById) {
    const u = await prisma.user.findUnique({
      where: { id: record.faaVerifiedById },
      select: { email: true },
    });
    verifiedByName = u?.email ?? null;
  }

  return {
    id: record?.id ?? null,
    pilotProfileId: profile.id,
    status,
    consentAcceptedAt: record?.consentAcceptedAt?.toISOString() ?? null,
    feeUsd: BACKGROUND_CHECK_FEE_USD,
    paidAt: record?.paidAt?.toISOString() ?? null,
    deadlineStartedAt: deadlineStart.toISOString(),
    deadlineAt: deadline.toISOString(),
    daysRemaining: daysUntilDeadline(deadline),
    marketplacePaused:
      profile.status === "approved" &&
      isMarketplacePausedByBackgroundCheck({
        status,
        deadlineStartedAt: record?.deadlineStartedAt,
      }),
    canPay: payBlockReason === null,
    payBlockReason,
    faaCertificateNumber: record?.faaCertificateNumber ?? null,
    faaVerifiedAt: record?.faaVerifiedAt?.toISOString() ?? null,
    faaVerifiedByName: verifiedByName,
    reviewedAt: record?.reviewedAt?.toISOString() ?? null,
  };
}

/** Marks the check Paid (demo fallback, or Stripe webhook with a real reference). */
export async function payBackgroundCheckDemo(
  userId: string,
  consent: boolean,
  options?: { reference?: string },
): Promise<
  | { ok: true; check: PilotBackgroundCheckDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { userId },
    include: { backgroundCheck: true },
  });
  if (!profile) return { ok: false, error: "Pilot profile not found.", status: 404 };

  const tier = await getPilotActiveTier(profile.id);
  const blockReason = getBackgroundCheckPayBlockReason({
    profileApproved: profile.status === "approved",
    hasActiveMembership: tier != null,
    status: profile.backgroundCheck?.status,
    consentAccepted: consent,
  });
  if (blockReason) return { ok: false, error: blockReason, status: 400 };

  const now = new Date();
  const reference = options?.reference ?? `demo_bgc_${Date.now().toString(36)}`;
  const data = {
    status: "paid",
    consentAcceptedAt: now,
    paidAt: now,
    feeAmountCents: BACKGROUND_CHECK_FEE_CENTS,
    paymentReference: reference,
  };
  const record = await prisma.pilotBackgroundCheck.upsert({
    where: { pilotProfileId: profile.id },
    create: { pilotProfileId: profile.id, ...data },
    update: data,
  });

  await sendNotification({
    userId,
    type: "welcome",
    title: "Background check payment received",
    body: `Your $${BACKGROUND_CHECK_FEE_USD} background check fee was received. Our team will review it shortly.`,
    payload: { backgroundCheckId: record.id },
  });

  const check = await getPilotBackgroundCheck(userId);
  return { ok: true, check: check! };
}

export async function listAdminBackgroundChecks(): Promise<
  AdminBackgroundCheckRowDto[]
> {
  const rows = await prisma.pilotBackgroundCheck.findMany({
    where: { status: { not: "not_started" } },
    include: {
      pilotProfile: {
        select: {
          displayName: true,
          licenseNumber: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { paidAt: "asc" },
  });

  return rows.map((r) => {
    const status = normalizeStatus(r.status);
    const deadline = computeBackgroundCheckDeadline(r.deadlineStartedAt);
    return {
      id: r.id,
      pilotProfileId: r.pilotProfileId,
      pilotName: r.pilotProfile.displayName,
      pilotEmail: r.pilotProfile.user.email,
      licenseNumber: r.pilotProfile.licenseNumber,
      status,
      paidAt: r.paidAt?.toISOString() ?? null,
      deadlineAt: deadline.toISOString(),
      daysRemaining: daysUntilDeadline(deadline),
      marketplacePaused: isMarketplacePausedByBackgroundCheck({
        status,
        deadlineStartedAt: r.deadlineStartedAt,
      }),
      adminNotes: r.adminNotes,
      faaCertificateNumber: r.faaCertificateNumber,
      faaVerifiedById: r.faaVerifiedById,
      faaVerifiedAt: r.faaVerifiedAt?.toISOString() ?? null,
    };
  });
}

export type AdminBackgroundCheckUpdate = {
  status?: BackgroundCheckStatus;
  adminNotes?: string | null;
  faaCertificateNumber?: string | null;
  /** When true, stamps verifiedBy/verifiedAt using the acting admin. */
  faaVerified?: boolean;
};

export async function adminUpdateBackgroundCheck(
  id: string,
  adminUserId: string,
  update: AdminBackgroundCheckUpdate,
): Promise<
  { ok: true; row: AdminBackgroundCheckRowDto } | { ok: false; error: string; status: 400 | 404 }
> {
  const existing = await prisma.pilotBackgroundCheck.findUnique({
    where: { id },
    include: { pilotProfile: { select: { userId: true } } },
  });
  if (!existing) return { ok: false, error: "Background check not found.", status: 404 };
  if (existing.status === "not_started") {
    return {
      ok: false,
      error: "Pilot has not paid the background check fee yet.",
      status: 400,
    };
  }

  const now = new Date();
  const data: Record<string, unknown> = {};
  if (update.adminNotes !== undefined) data.adminNotes = update.adminNotes;
  if (update.faaCertificateNumber !== undefined) {
    data.faaCertificateNumber = update.faaCertificateNumber;
  }
  if (update.faaVerified) {
    const cert = update.faaCertificateNumber ?? existing.faaCertificateNumber;
    if (!cert) {
      return {
        ok: false,
        error: "Enter the FAA certificate number before recording verification.",
        status: 400,
      };
    }
    data.faaVerifiedById = adminUserId;
    data.faaVerifiedAt = now;
  }

  const statusChanged = update.status != null && update.status !== existing.status;
  if (statusChanged) {
    data.status = update.status;
    data.reviewedAt = now;
    data.reviewedById = adminUserId;
  }

  await prisma.pilotBackgroundCheck.update({ where: { id }, data });

  if (statusChanged && update.status) {
    const label = BACKGROUND_CHECK_STATUS_LABELS[update.status];
    const final = update.status === "cleared" || update.status === "not_cleared";
    await sendNotification({
      userId: existing.pilotProfile.userId,
      type: "welcome",
      title: `Background check: ${label}`,
      body:
        update.status === "cleared"
          ? "Your background check is cleared. Thank you."
          : update.status === "not_cleared"
            ? "Your background check was not cleared. Marketplace access is paused — contact support."
            : `Your background check status is now: ${label}.`,
      payload: { backgroundCheckId: id },
      forceEmail: final,
    });
  }

  const rows = await listAdminBackgroundChecks();
  const row = rows.find((r) => r.id === id);
  return { ok: true, row: row! };
}
