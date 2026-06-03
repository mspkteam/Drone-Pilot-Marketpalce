import type { ClientBillingAddress } from "@/types/client";

export type ClientProfileInput = {
  companyName?: string | null;
  contactName?: string;
  phone?: string | null;
  billingAddress?: ClientBillingAddress | null;
  completeOnboarding?: boolean;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const PHONE_RE = /^[\d\s+().-]{7,20}$/;

export function validateClientProfileInput(
  input: ClientProfileInput,
  options: { requireAllForOnboarding: boolean },
): ValidationResult<ClientProfileInput> {
  const contactName = input.contactName?.trim() ?? "";
  const companyName = input.companyName?.trim() || null;
  const phone = input.phone?.trim() || null;

  if (options.requireAllForOnboarding) {
    if (contactName.length < 2) {
      return {
        ok: false,
        error: "Contact name is required (at least 2 characters).",
      };
    }
  } else if (contactName && contactName.length < 2) {
    return { ok: false, error: "Contact name must be at least 2 characters." };
  }

  if (phone && !PHONE_RE.test(phone)) {
    return { ok: false, error: "Enter a valid phone number." };
  }

  const billing = normalizeBillingAddress(input.billingAddress);

  return {
    ok: true,
    data: {
      companyName,
      contactName,
      phone,
      billingAddress: billing,
      completeOnboarding: input.completeOnboarding,
    },
  };
}

function normalizeBillingAddress(
  address: ClientBillingAddress | null | undefined,
): ClientBillingAddress | null {
  if (!address) return null;

  const normalized: ClientBillingAddress = {
    line1: address.line1?.trim() || undefined,
    city: address.city?.trim() || undefined,
    region: address.region?.trim() || undefined,
    country: address.country?.trim() || undefined,
    postalCode: address.postalCode?.trim() || undefined,
  };

  const hasValue = Object.values(normalized).some(Boolean);
  return hasValue ? normalized : null;
}
