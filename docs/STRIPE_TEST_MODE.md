# Stripe test mode

Test-mode Stripe is wired for membership, Fast Forward, instructor add-on, background check, uniform shop, job escrow, and Connect Express payouts. Without `STRIPE_SECRET_KEY` every flow falls back to the previous demo behaviour.

## Env (`.env.local`)

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...      # printed by `stripe listen`
AUTH_URL=http://localhost:3000       # used for success / return URLs
CRON_SECRET=...                      # optional locally
```

## Webhooks need forwarding

Checkout fulfilment (membership active, order paid, escrow held, payout status) happens in the webhook, so **local dev needs the Stripe CLI**:

```
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`. Useful events: `checkout.session.completed`, `account.updated` (the listener forwards all by default).

Trigger manually: `stripe trigger checkout.session.completed` (no metadata — will no-op) — prefer clicking through the real UI.

## Test cards

- Success: `4242 4242 4242 4242`, any future expiry/CVC/ZIP.
- Declined: `4000 0000 0000 0002`.

## Flows

| Flow | Entry | Completed by |
| --- | --- | --- |
| Membership / Fast Forward | `POST /api/pilot/subscription` → `{ checkoutUrl }` | webhook → `setPilotMembershipTier` |
| Instructor add-on | `POST /api/pilot/subscription/instructor` (`active:true`) | webhook → `setPilotInstructorAddon` |
| Background check ($20) | `POST /api/pilot/background-check/pay` | webhook → paid status |
| Uniform order | `POST /api/pilot/shop/orders/[id]/pay` | webhook → order paid |
| Pilot payouts | `POST /api/pilot/payouts/connect` → Account Link | `account.updated` → `stripeConnectStatus` |
| Job escrow | accept proposal → `Payment(pending)`; client `POST /api/client/bookings/[id]/payment` | webhook → `held` |
| Change order (held) | client Accept on change order → Checkout for delta + 6% | webhook `kind=change_order` → `charged` + pilot Transfer of delta net |
| Escrow release | client approves delivery, or cron `GET /api/cron/release-payments` (14 days after submit) | Transfer of remaining pilot net; commission `collected` |
| Approval reminders | same cron, day 7 and day 12 after delivery submit | email + in-app to client |
| Invoice PDF | `GET /api/client/payments/[id]/invoice` | generated PDF (no Stripe Invoicing product) |
| Client cards | `GET/POST/DELETE /api/client/billing/payment-methods` | setup-mode Checkout |

### Escrow rules

- Client charge = job amount + 6% service fee (Checkout, USD cents). Pilot net = job − commission (15% default / per-pilot override).
- Funds are charged to the platform account and moved with a Transfer (`source_transaction` = the charge) on release.
- Mid-job change orders on **held** escrow open a second Checkout for the increase; pilot share of the delta Transfers immediately when possible. Unpaid (`pending`) escrow folds the delta into the main Checkout instead.
- Pilot Connect not `complete` → funds stay `held`, pilot is notified; they release automatically when `account.updated` reports complete.
- Open dispute → `held_dispute`; auto-release skips it. Resolution refunds the client share and transfers the pilot share.
- Design note: the PaymentIntent is created by Checkout (when the client pays) rather than at accept time; the `Payment` row (status `pending`) is created at accept and stores `providerPaymentId` after payment.

## Connect test onboarding

In test mode, on Stripe's hosted form use "Use test data" / phone `000 000 0000`, SSN `000-00-0000`, test bank `000123456789` routing `110000000`.

## Manual verification checklist

1. Pilot: Subscription → pick plan → Stripe Checkout → pay → membership active (webhook).
2. Pilot: Payouts → Set up payouts → finish Stripe form → status Complete.
3. Client accepts a proposal → Billing → Pay now → booking payment is `In escrow`.
4. Pilot delivers; client approves → pilot gets a Transfer; payment `succeeded`, commission `collected`.
5. Open a dispute while held → status `held_dispute`; cron skips it.
