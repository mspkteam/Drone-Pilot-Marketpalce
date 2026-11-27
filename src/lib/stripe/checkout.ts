import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import {
  getBackgroundCheckPayBlockReason,
} from "@/lib/background-check/rules";
import { getPilotActiveTier } from "@/lib/membership/membership";
import {
  getFastForwardFeeUsd,
  isInstructorEligibleTierCode,
} from "@/lib/membership/pilot-membership-catalog";
import {
  getCurrentPilotSubscription,
  previewMembershipDiscountUsd,
} from "@/lib/subscriptions/subscription";
import { getAppBaseUrl, getStripe } from "@/lib/stripe/client";
import { STRIPE_CURRENCY, STRIPE_PRICES_CENTS } from "@/lib/stripe/config";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { toCents } from "@/lib/stripe/money";

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: 400 | 403 | 404 | 409 };

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

function line(name: string, cents: number): LineItem {
  return {
    quantity: 1,
    price_data: {
      currency: STRIPE_CURRENCY,
      unit_amount: cents,
      product_data: { name },
    },
  };
}

async function createSession(params: {
  userId: string;
  lineItems: LineItem[];
  metadata: Record<string, string>;
  successPath: string;
  cancelPath: string;
  request?: Request;
}): Promise<CheckoutResult> {
  const customer = await getOrCreateStripeCustomer(params.userId);
  const base = getAppBaseUrl(params.request);
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer,
    line_items: params.lineItems,
    metadata: { ...params.metadata, userId: params.userId },
    payment_intent_data: { metadata: { ...params.metadata, userId: params.userId } },
    success_url: `${base}${params.successPath}`,
    cancel_url: `${base}${params.cancelPath}`,
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL.", status: 400 };
  }
  return { ok: true, url: session.url };
}

/** Annual membership enrollment or Fast Forward upgrade. */
export async function createMembershipCheckout(input: {
  userId: string;
  pilotProfileId: string;
  planId: string;
  instructorCode?: string | null;
  request?: Request;
}): Promise<CheckoutResult> {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: input.planId, isActive: true },
  });
  if (!plan) return { ok: false, error: "Membership tier not found.", status: 404 };

  const existing = await getCurrentPilotSubscription(input.pilotProfileId);
  const items: LineItem[] = [];
  let kind: "membership" | "fast_forward";

  if (!existing) {
    kind = "membership";
    const discountUsd = await previewMembershipDiscountUsd(
      input.pilotProfileId,
      input.instructorCode,
    );
    const membershipCents = Math.max(
      0,
      STRIPE_PRICES_CENTS.membership - toCents(discountUsd),
    );
    if (membershipCents > 0) items.push(line("Annual membership", membershipCents));
    const ffCents = toCents(getFastForwardFeeUsd(plan.code ?? ""));
    if (ffCents > 0) {
      items.push(line(`Fast Forward ${plan.name ?? plan.code}`, ffCents));
    }
  } else {
    kind = "fast_forward";
    if (existing.subscriptionPlanId === plan.id) {
      return { ok: false, error: "You are already on this membership grade.", status: 409 };
    }
    if (plan.sortOrder <= existing.plan.sortOrder) {
      return { ok: false, error: "Fast Forward upgrades must move to a higher grade.", status: 409 };
    }
    const diff =
      toCents(getFastForwardFeeUsd(plan.code ?? "")) -
      toCents(getFastForwardFeeUsd(existing.plan.code ?? ""));
    if (diff > 0) items.push(line(`Fast Forward upgrade to ${plan.name ?? plan.code}`, diff));
  }

  if (items.length === 0) {
    return { ok: false, error: "Nothing to charge — use direct enrollment.", status: 400 };
  }

  return createSession({
    userId: input.userId,
    lineItems: items,
    metadata: {
      kind,
      pilotProfileId: input.pilotProfileId,
      planId: plan.id,
      instructorCode: input.instructorCode?.trim() ?? "",
    },
    successPath: "/dashboard/pilot/subscription?checkout=success",
    cancelPath: "/dashboard/pilot/subscription?checkout=cancelled",
    request: input.request,
  });
}

export async function createInstructorCheckout(input: {
  userId: string;
  pilotProfileId: string;
  request?: Request;
}): Promise<CheckoutResult> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { id: input.pilotProfileId },
    select: { instructorAddonActive: true },
  });
  if (!profile) return { ok: false, error: "Pilot profile not found.", status: 404 };
  const sub = await getCurrentPilotSubscription(input.pilotProfileId);
  if (!sub) {
    return { ok: false, error: "Active annual membership is required for Instructor.", status: 403 };
  }
  if (!isInstructorEligibleTierCode(sub.plan.code)) {
    return { ok: false, error: "Instructor add-on requires grade A-4 or higher.", status: 403 };
  }
  if (profile.instructorAddonActive) {
    return { ok: false, error: "Instructor add-on is already active.", status: 409 };
  }
  return createSession({
    userId: input.userId,
    lineItems: [line("Instructor add-on (annual)", STRIPE_PRICES_CENTS.instructorAddon)],
    metadata: { kind: "instructor", pilotProfileId: input.pilotProfileId },
    successPath: "/dashboard/pilot/subscription?checkout=success",
    cancelPath: "/dashboard/pilot/subscription?checkout=cancelled",
    request: input.request,
  });
}

export async function createBackgroundCheckCheckout(input: {
  userId: string;
  consent: boolean;
  request?: Request;
}): Promise<CheckoutResult> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { userId: input.userId },
    include: { backgroundCheck: true },
  });
  if (!profile) return { ok: false, error: "Pilot profile not found.", status: 404 };
  const tier = await getPilotActiveTier(profile.id);
  const block = getBackgroundCheckPayBlockReason({
    profileApproved: profile.status === "approved",
    hasActiveMembership: tier != null,
    status: profile.backgroundCheck?.status,
    consentAccepted: input.consent,
  });
  if (block) return { ok: false, error: block, status: 400 };
  return createSession({
    userId: input.userId,
    lineItems: [line("Pilot background check", STRIPE_PRICES_CENTS.backgroundCheck)],
    metadata: { kind: "background_check", pilotProfileId: profile.id, consent: "1" },
    successPath: "/dashboard/pilot/background-check?checkout=success",
    cancelPath: "/dashboard/pilot/background-check?checkout=cancelled",
    request: input.request,
  });
}

export async function createUniformOrderCheckout(input: {
  userId: string;
  orderId: string;
  request?: Request;
}): Promise<CheckoutResult> {
  const order = await prisma.uniformOrder.findFirst({
    where: { id: input.orderId, userId: input.userId },
  });
  if (!order) return { ok: false, error: "Order not found.", status: 404 };
  if (order.status !== "pending_payment" || order.paymentStatus !== "pending") {
    return { ok: false, error: "Order is not awaiting payment.", status: 400 };
  }
  const session = await createSession({
    userId: input.userId,
    lineItems: [line(`Uniform order ${order.orderNumber}`, toCents(order.total))],
    metadata: { kind: "uniform_order", orderId: order.id },
    successPath: `/dashboard/pilot/shop/orders/${order.id}?checkout=success`,
    cancelPath: `/dashboard/pilot/shop/orders/${order.id}?checkout=cancelled`,
    request: input.request,
  });
  return session;
}

/** Setup-mode Checkout so a client can save a card. */
export async function createClientSetupCheckout(input: {
  userId: string;
  request?: Request;
}): Promise<CheckoutResult> {
  const customer = await getOrCreateStripeCustomer(input.userId);
  const base = getAppBaseUrl(input.request);
  const session = await getStripe().checkout.sessions.create({
    mode: "setup",
    customer,
    currency: STRIPE_CURRENCY,
    metadata: { kind: "client_setup", userId: input.userId },
    success_url: `${base}/dashboard/client/payments?setup=success`,
    cancel_url: `${base}/dashboard/client/payments?setup=cancelled`,
  });
  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL.", status: 400 };
  }
  return { ok: true, url: session.url };
}

export type SavedCardDto = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export async function listClientPaymentMethods(userId: string): Promise<SavedCardDto[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) return [];
  const list = await getStripe().paymentMethods.list({
    customer: user.stripeCustomerId,
    type: "card",
  });
  return list.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? "card",
    last4: pm.card?.last4 ?? "????",
    expMonth: pm.card?.exp_month ?? 0,
    expYear: pm.card?.exp_year ?? 0,
  }));
}

export async function detachClientPaymentMethod(userId: string, paymentMethodId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) return false;
  const pm = await getStripe().paymentMethods.retrieve(paymentMethodId);
  const owner = typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
  if (owner !== user.stripeCustomerId) return false;
  await getStripe().paymentMethods.detach(paymentMethodId);
  return true;
}
