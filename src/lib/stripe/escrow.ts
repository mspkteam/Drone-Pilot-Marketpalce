import type Stripe from "stripe";
import { getEffectiveCommissionRateForPilot } from "@/lib/admin/pilot-rates";
import { calculateCommission } from "@/lib/commission/constants";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications/notify";
import { getAppBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { AUTO_RELEASE_DAYS, STRIPE_CURRENCY } from "@/lib/stripe/config";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { computeEscrowAmountsCents, fromCents, toCents } from "@/lib/stripe/money";

const HELD_STATUSES = ["held", "held_dispute"] as const;

function bookingLink(bookingId: string) {
  return { bookingId };
}

/**
 * Called when a client accepts a proposal. Creates the Payment row (status `pending`)
 * that the client then funds via Checkout. Never throws — acceptance must not fail.
 */
export async function ensureEscrowPaymentForBooking(bookingId: string) {
  if (!isStripeConfigured()) return null;
  try {
    const existing = await prisma.payment.findUnique({ where: { bookingId } });
    if (existing) return existing;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        clientProfile: { select: { userId: true } },
        pilotProfile: { select: { id: true, userId: true } },
      },
    });
    if (!booking) return null;

    const rate =
      booking.commissionRate ??
      (await getEffectiveCommissionRateForPilot(booking.pilotProfile.id));
    const amounts = computeEscrowAmountsCents(booking.agreedAmount, rate);

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        payerUserId: booking.clientProfile.userId,
        payeeUserId: booking.pilotProfile.userId,
        amountGross: booking.agreedAmount,
        amountNet: fromCents(amounts.pilotNetCents),
        serviceFeeAmount: fromCents(amounts.serviceFeeCents),
        currency: booking.currency,
        provider: "stripe",
        status: "pending",
      },
    });

    await sendNotification({
      userId: booking.clientProfile.userId,
      type: "booking_status",
      title: "Fund your booking",
      body: `Pay $${fromCents(amounts.totalCents).toFixed(2)} (job + 6% service fee) to hold funds in escrow.`,
      payload: bookingLink(bookingId),
    });
    return payment;
  } catch (err) {
    console.error("[stripe/escrow] ensureEscrowPaymentForBooking failed:", err);
    return null;
  }
}

/** Create a Checkout Session so the client can fund the escrow payment. */
export async function createEscrowCheckout(
  bookingId: string,
  clientUserId: string,
  request?: Request,
): Promise<
  | { ok: true; url: string }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      job: { select: { title: true } },
      clientProfile: { select: { userId: true } },
    },
  });
  if (!booking || booking.clientProfile.userId !== clientUserId) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }
  if (["cancelled"].includes(booking.status)) {
    return { ok: false, error: "This booking is cancelled.", status: 400 };
  }

  const payment =
    (await prisma.payment.findUnique({ where: { bookingId } })) ??
    (await ensureEscrowPaymentForBooking(bookingId));
  if (!payment || payment.provider !== "stripe") {
    return { ok: false, error: "No Stripe payment is due for this booking.", status: 400 };
  }
  if (payment.status !== "pending" && payment.status !== "failed") {
    return { ok: false, error: "This booking has already been paid.", status: 409 };
  }

  const stripe = getStripe();
  const customer = await getOrCreateStripeCustomer(clientUserId);
  const jobCents = toCents(payment.amountGross);
  const feeCents = toCents(payment.serviceFeeAmount);
  const base = getAppBaseUrl(request);
  const metadata = {
    kind: "escrow",
    bookingId,
    paymentId: payment.id,
    userId: clientUserId,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: jobCents,
          product_data: { name: `Job: ${booking.job.title}` },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: feeCents,
          product_data: { name: "Service fee (6%)" },
        },
      },
    ],
    payment_intent_data: {
      transfer_group: `booking_${bookingId}`,
      metadata,
    },
    metadata,
    success_url: `${base}/dashboard/client/bookings?payment=success`,
    cancel_url: `${base}/dashboard/client/bookings?payment=cancelled`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: session.id },
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL.", status: 400 };
  }
  return { ok: true, url: session.url };
}

/** Webhook: escrow Checkout paid → funds held. */
export async function handleEscrowCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const paymentId = session.metadata?.paymentId;
  if (!paymentId || session.payment_status !== "paid") return;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { dispute: { select: { status: true } }, job: { select: { title: true } } } } },
  });
  if (!payment || payment.status === "held" || payment.status === "held_dispute" || payment.status === "succeeded") {
    return;
  }

  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const disputeOpen =
    payment.booking.dispute &&
    !["resolved", "closed"].includes(payment.booking.dispute.status);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: disputeOpen ? "held_dispute" : "held",
      paidAt: new Date(),
      providerPaymentId: piId,
      stripeCheckoutSessionId: session.id,
    },
  });

  const title = payment.booking.job.title;
  await sendNotification({
    userId: payment.payeeUserId,
    type: "booking_status",
    title: "Client funded the booking",
    body: `Funds for "${title}" are held in escrow. You will be paid when the client approves delivery.`,
    payload: bookingLink(payment.bookingId),
  });
  await sendNotification({
    userId: payment.payerUserId,
    type: "booking_status",
    title: "Payment received",
    body: `Your payment for "${title}" is held in escrow until you approve delivery.`,
    payload: bookingLink(payment.bookingId),
  });

  // Booking may already be completed (paid late) — release right away.
  if (payment.booking.status === "completed") {
    await releaseEscrowForBooking(payment.bookingId);
  }
}

/** Dispute opened: pause auto-release. */
export async function markEscrowDisputed(bookingId: string) {
  await prisma.payment.updateMany({
    where: { bookingId, provider: "stripe", status: "held" },
    data: { status: "held_dispute", releaseNote: "Dispute open — release paused." },
  });
}

/** Dispute closed without a payment decision: resume holding. */
export async function clearEscrowDispute(bookingId: string) {
  await prisma.payment.updateMany({
    where: { bookingId, provider: "stripe", status: "held_dispute" },
    data: { status: "held", releaseNote: null },
  });
}

export type ReleaseResult =
  | { released: true; transferId: string }
  | { released: false; reason: string };

/** Transfer pilot net to their Connect account and record commission. */
export async function releaseEscrowForBooking(
  bookingId: string,
): Promise<ReleaseResult> {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          pilotProfile: {
            select: {
              id: true,
              userId: true,
              stripeConnectAccountId: true,
              stripeConnectStatus: true,
            },
          },
        },
      },
    },
  });
  if (!payment || payment.provider !== "stripe") {
    return { released: false, reason: "No Stripe payment." };
  }
  if (payment.status === "held_dispute") {
    return { released: false, reason: "Dispute open." };
  }
  if (payment.status !== "held") {
    return { released: false, reason: `Payment is ${payment.status}.` };
  }
  if (!payment.providerPaymentId) {
    return { released: false, reason: "Missing payment intent." };
  }

  const pilot = payment.booking.pilotProfile;
  if (!pilot.stripeConnectAccountId || pilot.stripeConnectStatus !== "complete") {
    const note = "Pilot payout account incomplete — funds held.";
    if (payment.releaseNote !== note) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { releaseNote: note },
      });
      await sendNotification({
        userId: pilot.userId,
        type: "booking_status",
        title: "Set up payouts to get paid",
        body: `Your payment for "${payment.booking.job.title}" is ready but held. Complete payout setup to receive it.`,
        payload: bookingLink(bookingId),
      });
    }
    return { released: false, reason: note };
  }

  const stripe = getStripe();
  const pi = await stripe.paymentIntents.retrieve(payment.providerPaymentId);
  const chargeId =
    typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;

  const remainingNetCents = Math.max(
    0,
    toCents(payment.amountNet) - toCents(payment.changeOrderReleasedNet ?? 0),
  );
  if (remainingNetCents <= 0) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "succeeded",
        releasedAt: new Date(),
        releaseNote: null,
      },
    });
    return { released: true, transferId: payment.stripeTransferId ?? "already_paid" };
  }

  const transfer = await stripe.transfers.create(
    {
      amount: remainingNetCents,
      currency: STRIPE_CURRENCY,
      destination: pilot.stripeConnectAccountId,
      transfer_group: `booking_${bookingId}`,
      ...(chargeId ? { source_transaction: chargeId } : {}),
      metadata: { bookingId, paymentId: payment.id },
    },
    { idempotencyKey: `release_${payment.id}` },
  );

  const rate =
    payment.booking.commissionRate ??
    (await getEffectiveCommissionRateForPilot(pilot.id));
  const commissionAmount = fromCents(
    toCents(payment.amountGross) - toCents(payment.amountNet),
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "succeeded",
        releasedAt: new Date(),
        stripeTransferId: transfer.id,
        releaseNote: null,
      },
    });
    await tx.commission.upsert({
      where: { bookingId },
      create: {
        bookingId,
        paymentId: payment.id,
        rate,
        amount: commissionAmount,
        currency: payment.currency,
        status: "collected",
      },
      update: { paymentId: payment.id, amount: commissionAmount, status: "collected" },
    });
  });

  await sendNotification({
    userId: pilot.userId,
    type: "booking_status",
    title: "Payout sent",
    body: `$${payment.amountNet.toFixed(2)} for "${payment.booking.job.title}" was sent to your payout account.`,
    payload: bookingLink(bookingId),
  });
  return { released: true, transferId: transfer.id };
}

/** After a pilot finishes Connect onboarding, release completed-booking payments. */
export async function releaseHeldPaymentsForPilot(pilotProfileId: string) {
  const rows = await prisma.payment.findMany({
    where: {
      provider: "stripe",
      status: "held",
      booking: { pilotProfileId, status: "completed" },
    },
    select: { bookingId: true },
  });
  for (const row of rows) {
    try {
      await releaseEscrowForBooking(row.bookingId);
    } catch (err) {
      console.error("[stripe/escrow] release failed", row.bookingId, err);
    }
  }
}

/**
 * Create Checkout for an accepted change order (delta + 6% fee) when escrow is held.
 */
export async function createChangeOrderCheckout(
  changeOrderId: string,
  clientUserId: string,
  request?: Request,
): Promise<
  | { ok: true; url: string }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Stripe is not configured.", status: 400 };
  }

  const order = await prisma.bookingChangeOrder.findUnique({
    where: { id: changeOrderId },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          clientProfile: { select: { userId: true } },
          payment: true,
        },
      },
    },
  });
  if (!order || order.booking.clientProfile.userId !== clientUserId) {
    return { ok: false, error: "Change order not found.", status: 404 };
  }
  if (order.status !== "accepted") {
    return {
      ok: false,
      error: "Only accepted change orders can be charged.",
      status: 409,
    };
  }
  if (order.chargedAt) {
    return { ok: false, error: "Change order already charged.", status: 409 };
  }

  const payment = order.booking.payment;
  if (!payment || payment.provider !== "stripe") {
    return { ok: false, error: "No Stripe escrow payment for this booking.", status: 400 };
  }
  if (!["held", "held_dispute"].includes(payment.status)) {
    return {
      ok: false,
      error: "Change-order Checkout requires held escrow funds.",
      status: 400,
    };
  }

  const stripe = getStripe();
  const customer = await getOrCreateStripeCustomer(clientUserId);
  const deltaCents = toCents(order.deltaAmount);
  const feeCents = toCents(order.serviceFee);
  const base = getAppBaseUrl(request);
  const metadata = {
    kind: "change_order",
    bookingId: order.bookingId,
    changeOrderId: order.id,
    paymentId: payment.id,
    userId: clientUserId,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: deltaCents,
          product_data: {
            name: `Change order: ${order.booking.job.title}`,
          },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: feeCents,
          product_data: { name: "Service fee (6%) on increase" },
        },
      },
    ],
    payment_intent_data: {
      transfer_group: `booking_${order.bookingId}`,
      metadata,
    },
    metadata,
    success_url: `${base}/dashboard/client/bookings?change_order=success`,
    cancel_url: `${base}/dashboard/client/bookings?change_order=cancelled`,
  });

  await prisma.bookingChangeOrder.update({
    where: { id: order.id },
    data: {
      provider: "stripe",
      stripeCheckoutSessionId: session.id,
    },
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL.", status: 400 };
  }
  return { ok: true, url: session.url };
}

/** Webhook: change-order Checkout paid → mark charged, bump ledger, Transfer pilot delta. */
export async function handleChangeOrderCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  const changeOrderId = session.metadata?.changeOrderId;
  if (!changeOrderId || session.payment_status !== "paid") return;

  const order = await prisma.bookingChangeOrder.findUnique({
    where: { id: changeOrderId },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          payment: { include: { commission: true } },
          pilotProfile: {
            select: {
              id: true,
              userId: true,
              stripeConnectAccountId: true,
              stripeConnectStatus: true,
            },
          },
          clientProfile: { select: { userId: true } },
        },
      },
    },
  });
  if (!order || order.chargedAt) return;

  const payment = order.booking.payment;
  if (!payment) return;

  const rate = order.commissionRate;
  const amounts = computeEscrowAmountsCents(order.deltaAmount, rate);
  const newGross =
    Math.round((payment.amountGross + order.deltaAmount) * 100) / 100;
  const newNet =
    Math.round((payment.amountNet + fromCents(amounts.pilotNetCents)) * 100) / 100;
  const newFee =
    Math.round((payment.serviceFeeAmount + order.serviceFee) * 100) / 100;
  const { amount: commissionAmount } = calculateCommission(newGross, rate);

  let transferredDelta = 0;
  const pilot = order.booking.pilotProfile;
  if (
    amounts.pilotNetCents > 0 &&
    pilot.stripeConnectAccountId &&
    pilot.stripeConnectStatus === "complete"
  ) {
    try {
      const stripe = getStripe();
      const piId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      let chargeId: string | undefined;
      if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        chargeId =
          typeof pi.latest_charge === "string"
            ? pi.latest_charge
            : (pi.latest_charge?.id ?? undefined);
      }
      await stripe.transfers.create(
        {
          amount: amounts.pilotNetCents,
          currency: STRIPE_CURRENCY,
          destination: pilot.stripeConnectAccountId,
          transfer_group: `booking_${order.bookingId}`,
          ...(chargeId ? { source_transaction: chargeId } : {}),
          metadata: {
            bookingId: order.bookingId,
            changeOrderId: order.id,
            paymentId: payment.id,
          },
        },
        { idempotencyKey: `change_order_${order.id}` },
      );
      transferredDelta = fromCents(amounts.pilotNetCents);
    } catch (err) {
      console.error("[stripe/escrow] change-order transfer failed", order.id, err);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookingChangeOrder.update({
      where: { id: order.id },
      data: {
        status: "charged",
        chargedAt: new Date(),
        provider: "stripe",
        stripeCheckoutSessionId: session.id,
      },
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        amountGross: newGross,
        amountNet: newNet,
        serviceFeeAmount: newFee,
        changeOrderReleasedNet:
          Math.round((payment.changeOrderReleasedNet + transferredDelta) * 100) / 100,
      },
    });
    if (payment.commission) {
      await tx.commission.update({
        where: { id: payment.commission.id },
        data: { amount: commissionAmount, rate },
      });
    }
  });

  const title = order.booking.job.title;
  await sendNotification({
    userId: order.booking.clientProfile.userId,
    type: "booking_status",
    title: "Change order paid",
    body: `Your change-order payment for "${title}" was received.`,
    payload: bookingLink(order.bookingId),
  });
  await sendNotification({
    userId: pilot.userId,
    type: "booking_status",
    title: "Change order funded",
    body: transferredDelta
      ? `Client paid the increase on "${title}". Your share was sent to your payout account.`
      : `Client paid the increase on "${title}". Your share will follow with escrow release.`,
    payload: bookingLink(order.bookingId),
  });
}

/**
 * Cron helper: email clients at day 7 and day 12 after delivery submit
 * while escrow is still held awaiting approval.
 */
export async function processEscrowApprovalReminders(now = new Date()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const held = await prisma.payment.findMany({
    where: {
      provider: "stripe",
      status: "held",
      booking: {
        dispute: null,
        delivery: { status: "submitted", submittedAt: { not: null } },
      },
    },
    include: {
      booking: {
        include: {
          job: { select: { title: true } },
          delivery: { select: { submittedAt: true } },
          clientProfile: { select: { userId: true } },
        },
      },
    },
  });

  let sent7 = 0;
  let sent12 = 0;
  for (const payment of held) {
    const submittedAt = payment.booking.delivery?.submittedAt;
    if (!submittedAt) continue;
    const ageDays = (now.getTime() - submittedAt.getTime()) / dayMs;
    const title = payment.booking.job.title;
    const userId = payment.booking.clientProfile.userId;
    const payload = bookingLink(payment.bookingId);

    if (ageDays >= 7 && ageDays < AUTO_RELEASE_DAYS && !payment.escrowReminder7SentAt) {
      await sendNotification({
        userId,
        type: "booking_status",
        title: "Reminder: approve delivery",
        body: `Delivery for "${title}" is waiting for your review. Funds auto-release in ${Math.max(1, Math.ceil(AUTO_RELEASE_DAYS - ageDays))} day(s) if you take no action.`,
        payload,
        forceEmail: true,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { escrowReminder7SentAt: now },
      });
      sent7 += 1;
    }

    if (ageDays >= 12 && ageDays < AUTO_RELEASE_DAYS && !payment.escrowReminder12SentAt) {
      await sendNotification({
        userId,
        type: "booking_status",
        title: "Final reminder: approve delivery",
        body: `Only a few days left to review "${title}" before escrow auto-releases to the pilot.`,
        payload,
        forceEmail: true,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { escrowReminder12SentAt: now },
      });
      sent12 += 1;
    }
  }
  return { checked: held.length, sent7, sent12 };
}

/**
 * Cron helper: complete + release bookings whose delivery has been waiting
 * for client review longer than AUTO_RELEASE_DAYS. Skips disputed payments.
 */
export async function processDueEscrowReleases(now = new Date()) {
  if (!isStripeConfigured()) return { checked: 0, released: 0, skipped: 0 };
  const cutoff = new Date(now.getTime() - AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000);

  const rows = await prisma.payment.findMany({
    where: {
      provider: "stripe",
      status: "held",
      booking: {
        dispute: null,
        status: { in: ["in_progress", "completed", "confirmed"] },
        delivery: { status: "submitted", submittedAt: { lte: cutoff } },
      },
    },
    include: { booking: { select: { id: true, status: true } } },
  });

  let released = 0;
  let skipped = 0;
  for (const row of rows) {
    try {
      if (row.booking.status !== "completed") {
        await prisma.bookingDelivery.update({
          where: { bookingId: row.bookingId },
          data: {
            status: "approved",
            reviewedAt: now,
            clientFeedback: `Auto-approved after ${AUTO_RELEASE_DAYS} days.`,
          },
        });
        const { updateBookingStatusForAdmin } = await import("@/lib/admin/bookings");
        await updateBookingStatusForAdmin(row.bookingId, "completed");
      }
      const result = await releaseEscrowForBooking(row.bookingId);
      if (result.released) released += 1;
      else skipped += 1;
    } catch (err) {
      skipped += 1;
      console.error("[stripe/escrow] auto-release failed", row.bookingId, err);
    }
  }
  return { checked: rows.length, released, skipped };
}

/**
 * Dispute resolution for Stripe-held funds: refund client share, transfer pilot share.
 * Returns true when handled (caller should skip the internal ledger update).
 */
export async function settleEscrowForDispute(
  bookingId: string,
  split: { pilotAmount: number; clientAmount: number; platformAmount: number },
): Promise<boolean> {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          pilotProfile: {
            select: { stripeConnectAccountId: true, stripeConnectStatus: true, userId: true },
          },
        },
      },
    },
  });
  if (!payment || payment.provider !== "stripe") return false;
  if (!HELD_STATUSES.includes(payment.status as (typeof HELD_STATUSES)[number])) return false;
  if (!payment.providerPaymentId) return false;

  const stripe = getStripe();
  const pilot = payment.booking.pilotProfile;
  const pilotCents = toCents(split.pilotAmount);
  const clientCents = toCents(split.clientAmount);
  // Full refund includes the service fee.
  const fullRefund = pilotCents === 0 && split.platformAmount === 0;
  let note: string | null = null;

  const pi = await stripe.paymentIntents.retrieve(payment.providerPaymentId);
  const chargeId =
    typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;

  if (clientCents > 0 || fullRefund) {
    await stripe.refunds.create(
      {
        payment_intent: payment.providerPaymentId,
        ...(fullRefund
          ? {}
          : { amount: clientCents }),
      },
      { idempotencyKey: `dispute_refund_${payment.id}` },
    );
  }

  let transferId: string | null = null;
  if (pilotCents > 0) {
    if (pilot.stripeConnectAccountId && pilot.stripeConnectStatus === "complete") {
      const t = await stripe.transfers.create(
        {
          amount: pilotCents,
          currency: STRIPE_CURRENCY,
          destination: pilot.stripeConnectAccountId,
          transfer_group: `booking_${bookingId}`,
          ...(chargeId ? { source_transaction: chargeId } : {}),
          metadata: { bookingId, paymentId: payment.id, reason: "dispute_resolution" },
        },
        { idempotencyKey: `dispute_transfer_${payment.id}` },
      );
      transferId = t.id;
    } else {
      note = "Dispute payout pending: pilot payout account incomplete.";
    }
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: fullRefund ? "refunded" : note ? "held" : "succeeded",
      amountNet: split.pilotAmount,
      releasedAt: transferId ? new Date() : null,
      stripeTransferId: transferId,
      releaseNote: note,
    },
  });
  await prisma.commission.upsert({
    where: { bookingId },
    create: {
      bookingId,
      paymentId: payment.id,
      rate: payment.booking.commissionRate ?? 0,
      amount: fullRefund ? 0 : split.platformAmount,
      currency: payment.currency,
      status: fullRefund ? "waived" : "collected",
    },
    update: {
      amount: fullRefund ? 0 : split.platformAmount,
      status: fullRefund ? "waived" : "collected",
    },
  });
  return true;
}
