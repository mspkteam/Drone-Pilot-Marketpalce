import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { payBackgroundCheckDemo } from "@/lib/background-check/service";
import { setPilotInstructorAddon } from "@/lib/membership/instructor-addon";
import { sendNotification } from "@/lib/notifications/notify";
import { payUniformOrder } from "@/lib/shop/shop";
import { setPilotMembershipTier } from "@/lib/subscriptions/subscription";
import { syncConnectAccount } from "@/lib/stripe/connect";
import { handleEscrowCheckoutCompleted } from "@/lib/stripe/escrow";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === "payment" && session.payment_status !== "paid") return;
  const meta = session.metadata ?? {};
  const kind = meta.kind;
  const userId = meta.userId;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? undefined);

  switch (kind) {
    case "membership":
    case "fast_forward": {
      if (!meta.pilotProfileId || !meta.planId) return;
      const result = await setPilotMembershipTier(
        meta.pilotProfileId,
        meta.planId,
        meta.instructorCode || undefined,
        { externalSubscriptionId: session.id },
      );
      if (!result.ok && result.status !== 409) {
        throw new Error(`Membership fulfillment failed: ${result.error}`);
      }
      if (userId) {
        await sendNotification({
          userId,
          type: "welcome",
          title: kind === "membership" ? "Membership active" : "Grade upgraded",
          body:
            kind === "membership"
              ? "Your payment was received and your membership is active."
              : "Your Fast Forward upgrade payment was received.",
        });
      }
      return;
    }
    case "instructor": {
      if (!meta.pilotProfileId) return;
      const result = await setPilotInstructorAddon(meta.pilotProfileId, true);
      if (!result.ok && result.status !== 409) {
        throw new Error(`Instructor fulfillment failed: ${result.error}`);
      }
      return;
    }
    case "background_check": {
      if (!userId) return;
      const result = await payBackgroundCheckDemo(userId, meta.consent === "1", {
        reference: paymentIntentId ?? session.id,
      });
      if (!result.ok && result.status !== 400) {
        throw new Error(`Background check fulfillment failed: ${result.error}`);
      }
      return;
    }
    case "uniform_order": {
      if (!userId || !meta.orderId) return;
      const result = await payUniformOrder(meta.orderId, userId, {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      });
      if (!result.ok && result.status !== 400) {
        throw new Error(`Uniform order fulfillment failed: ${result.error}`);
      }
      return;
    }
    case "escrow":
      await handleEscrowCheckoutCompleted(session);
      return;
    case "client_setup":
      return;
    default:
      return;
  }
}

/** Process a verified Stripe event. Idempotent via StripeWebhookEvent. */
export async function processStripeEvent(event: Stripe.Event): Promise<{ duplicate: boolean }> {
  const seen = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (seen) return { duplicate: true };

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "account.updated":
      await syncConnectAccount(event.data.object as Stripe.Account);
      break;
    default:
      break;
  }

  await prisma.stripeWebhookEvent
    .create({ data: { id: event.id, type: event.type } })
    .catch(() => undefined);
  return { duplicate: false };
}
