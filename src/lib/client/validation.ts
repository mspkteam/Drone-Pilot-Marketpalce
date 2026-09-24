import type { ClientBillingAddress } from "@/types/client";
import type { ClientProfilePreferences } from "@/lib/client/preferences";

export type ClientProfileInput = {
  companyName?: string | null;
  contactName?: string;
  phone?: string | null;
  billingAddress?: ClientBillingAddress | null;
  preferences?: Partial<ClientProfilePreferences> | null;
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
  // Keep preferences as a partial patch so PATCH { notifications } does not
  // wipe projectTypes / logoPath via full normalize-before-merge.
  const preferences =
    input.preferences === undefined
      ? undefined
      : sanitizeClientPreferencesPatch(input.preferences);

  return {
    ok: true,
    data: {
      companyName,
      contactName,
      phone,
      billingAddress: billing,
      preferences,
      completeOnboarding: input.completeOnboarding,
    },
  };
}

function sanitizeClientPreferencesPatch(
  input: Partial<ClientProfilePreferences> | null,
): Partial<ClientProfilePreferences> {
  if (!input) return {};

  const patch: Partial<ClientProfilePreferences> = {};
  if (Object.prototype.hasOwnProperty.call(input, "roleTitle")) {
    patch.roleTitle = input.roleTitle?.trim() ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(input, "preferredContact")) {
    patch.preferredContact = input.preferredContact;
  }
  if (Object.prototype.hasOwnProperty.call(input, "typicalProjectArea")) {
    patch.typicalProjectArea = input.typicalProjectArea?.trim() ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(input, "defaultBudgetRange")) {
    patch.defaultBudgetRange = input.defaultBudgetRange?.trim() ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(input, "approvalContact")) {
    patch.approvalContact = input.approvalContact?.trim() ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(input, "billingEmail")) {
    patch.billingEmail = input.billingEmail?.trim() ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(input, "projectTypes")) {
    patch.projectTypes = Array.isArray(input.projectTypes)
      ? input.projectTypes.map((item) => item.trim()).filter(Boolean)
      : [];
  }
  if (Object.prototype.hasOwnProperty.call(input, "logoPath")) {
    patch.logoPath = input.logoPath ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(input, "notifications")) {
    patch.notifications = input.notifications;
  }
  return patch;
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
