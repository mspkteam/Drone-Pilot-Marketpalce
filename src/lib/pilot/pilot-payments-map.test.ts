import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateCommission, DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { getPlatformFee } from "@/lib/pilot/pilot-payments-map";
import type { PaymentListItemDto } from "@/types/payment";

function paymentStub(
  amountGross: number,
  stored?: { rate: number; amount: number },
): PaymentListItemDto {
  return {
    id: "pay-1",
    bookingId: "book-1",
    payerUserId: "payer-1",
    payeeUserId: "payee-1",
    amountGross,
    amountNet: Math.round(amountGross * 0.85 * 100) / 100,
    currency: "USD",
    provider: "internal",
    status: "succeeded",
    createdAt: new Date().toISOString(),
    counterpartyLabel: "Client",
    booking: {
      id: "book-1",
      job: { id: "job-1", title: "Mission" },
    },
    commission: stored
      ? {
          id: "comm-1",
          bookingId: "book-1",
          paymentId: "pay-1",
          rate: stored.rate,
          amount: stored.amount,
          currency: "USD",
          status: "calculated",
          calculatedAt: new Date().toISOString(),
        }
      : null,
  };
}

describe("getPlatformFee", () => {
  it("defaults to flat 15% ($450 on $3000) when no commission row", () => {
    assert.equal(calculateCommission(3000, DEFAULT_COMMISSION_RATE).amount, 450);
    assert.equal(getPlatformFee(paymentStub(3000)), 450);
  });

  it("ignores legacy grade-band rates (10–14%) and uses platform 15%", () => {
    assert.equal(
      getPlatformFee(paymentStub(3000, { rate: 0.12, amount: 360 })),
      450,
    );
  });

  it("keeps intentional admin overrides outside the legacy grade band", () => {
    assert.equal(
      getPlatformFee(paymentStub(3000, { rate: 0.075, amount: 225 })),
      225,
    );
  });
});
