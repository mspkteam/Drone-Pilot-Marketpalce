import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getAppBaseUrl, getStripe } from "@/lib/stripe/client";
import { resolveConnectStatus } from "@/lib/stripe/money";
import type { StripeConnectStatus } from "@/lib/stripe/config";
import { sendNotification } from "@/lib/notifications/notify";

export async function getPilotConnectState(userId: string) {
  const profile = await prisma.pilotProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      stripeConnectAccountId: true,
      stripeConnectStatus: true,
    },
  });
  if (!profile) return null;
  return {
    pilotProfileId: profile.id,
    accountId: profile.stripeConnectAccountId,
    status: (profile.stripeConnectStatus || "not_started") as StripeConnectStatus,
  };
}

/** Create (if needed) an Express account and return a fresh onboarding Account Link. */
export async function createConnectOnboardingLink(
  userId: string,
  request?: Request,
): Promise<
  | { ok: true; url: string; accountId: string }
  | { ok: false; error: string; status: 404 | 500 }
> {
  const profile = await prisma.pilotProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  });
  if (!profile) {
    return { ok: false, error: "Pilot profile not found.", status: 404 };
  }

  const stripe = getStripe();
  let accountId = profile.stripeConnectAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: profile.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { userId, pilotProfileId: profile.id },
    });
    accountId = account.id;
    await prisma.pilotProfile.update({
      where: { id: profile.id },
      data: {
        stripeConnectAccountId: accountId,
        stripeConnectStatus: "pending",
      },
    });
  }

  const base = getAppBaseUrl(request);
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${base}/dashboard/pilot/payouts?stripe=refresh`,
    return_url: `${base}/dashboard/pilot/payouts?stripe=return`,
  });

  return { ok: true, url: link.url, accountId };
}

/** Pull latest account state from Stripe and persist it. */
export async function syncConnectAccount(
  accountOrId: Stripe.Account | string,
): Promise<StripeConnectStatus | null> {
  const account =
    typeof accountOrId === "string"
      ? await getStripe().accounts.retrieve(accountOrId)
      : accountOrId;

  const profile = await prisma.pilotProfile.findUnique({
    where: { stripeConnectAccountId: account.id },
    select: { id: true, userId: true, stripeConnectStatus: true },
  });
  if (!profile) return null;

  const status = resolveConnectStatus(account);
  if (status !== profile.stripeConnectStatus) {
    await prisma.pilotProfile.update({
      where: { id: profile.id },
      data: { stripeConnectStatus: status },
    });
    if (status === "complete") {
      await sendNotification({
        userId: profile.userId,
        type: "welcome",
        title: "Payouts enabled",
        body: "Your payout account is verified. Held job payments will now be released.",
      });
      const { releaseHeldPaymentsForPilot } = await import("@/lib/stripe/escrow");
      await releaseHeldPaymentsForPilot(profile.id);
    }
  }
  return status;
}

/** Refresh status for a pilot (used when they return from Stripe or open the Payouts page). */
export async function refreshPilotConnectStatus(userId: string) {
  const state = await getPilotConnectState(userId);
  if (!state?.accountId) return state;
  await syncConnectAccount(state.accountId);
  return getPilotConnectState(userId);
}
