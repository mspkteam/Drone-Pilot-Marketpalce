import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateCommission, DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { getPlatformFee } from "@/lib/pilot/pilot-payments-map";
import type { PaymentListItemDto } from "@/types/payment";

function paymentStub(
  amountGross: number,
  storedRate?: number,
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
    commission:
      storedRate != null
        ? {
            id: "comm-1",
            bookingId: "book-1",
            paymentId: "pay-1",
            rate: storedRate,
            amount: Math.round(amountGross * storedRate * 100) / 100,
            currency: "USD",
            status: "calculated",
            calculatedAt: new Date().toISOString(),
          }
        : null,
  };
}

describe("getPlatformFee", () => {
  it("charges flat 15% ($450 on $3000)", () => {
    assert.equal(calculateCommission(3000, DEFAULT_COMMISSION_RATE).amount, 450);
    assert.equal(getPlatformFee(paymentStub(3000)), 450);
  });

  it("ignores legacy grade-based stored rates (e.g. 13.5%)", () => {
    assert.equal(getPlatformFee(paymentStub(3000, 0.135)), 450);
  });
});
