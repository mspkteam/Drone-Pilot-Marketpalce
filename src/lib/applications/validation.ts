export type ApplicationInput = {
  proposedAmount?: number | string;
  message?: string | null;
  estimatedDeliveryDate?: string | null;
  currency?: string;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function validateApplicationInput(
  input: ApplicationInput,
): ValidationResult<{
  proposedAmount: number;
  message: string | null;
  estimatedDeliveryDate: string | null;
  currency: string;
}> {
  const amount =
    typeof input.proposedAmount === "string"
      ? Number(input.proposedAmount)
      : input.proposedAmount;

  if (amount == null || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid proposed amount greater than zero." };
  }

  const message = input.message?.trim() || null;
  if (message && message.length < 10) {
    return {
      ok: false,
      error: "Cover message must be at least 10 characters if provided.",
    };
  }

  let estimatedDeliveryDate: string | null = input.estimatedDeliveryDate ?? null;
  if (estimatedDeliveryDate === "") estimatedDeliveryDate = null;
  if (estimatedDeliveryDate) {
    const d = new Date(estimatedDeliveryDate);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "Invalid estimated delivery date." };
    }
  }

  return {
    ok: true,
    data: {
      proposedAmount: amount,
      message,
      estimatedDeliveryDate,
      currency: input.currency?.trim() || "USD",
    },
  };
}
