"use client";

import { FormField, inputClassName } from "@/components/ui/FormField";
import type { ClientProfileDto } from "@/types/client";

export type ClientFormState = {
  companyName: string;
  contactName: string;
  phone: string;
  billingLine1: string;
  billingCity: string;
  billingRegion: string;
  billingCountry: string;
  billingPostalCode: string;
};

export const emptyClientFormState: ClientFormState = {
  companyName: "",
  contactName: "",
  phone: "",
  billingLine1: "",
  billingCity: "",
  billingRegion: "",
  billingCountry: "",
  billingPostalCode: "",
};

type ClientProfileFormFieldsProps = {
  form: ClientFormState;
  onChange: (patch: Partial<ClientFormState>) => void;
  disabled?: boolean;
};

export function ClientProfileFormFields({
  form,
  onChange,
  disabled,
}: ClientProfileFormFieldsProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact details</h2>
        <FormField label="Contact name" htmlFor="contactName" required>
          <input
            id="contactName"
            className={inputClassName}
            value={form.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            disabled={disabled}
            required
          />
        </FormField>
        <FormField
          label="Company name"
          htmlFor="companyName"
          hint="Optional — for business clients."
        >
          <input
            id="companyName"
            className={inputClassName}
            value={form.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone" hint="Optional">
          <input
            id="phone"
            type="tel"
            className={inputClassName}
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            disabled={disabled}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Billing address</h2>
        <p className="text-sm text-muted-foreground">
          Optional for now — used for invoices when payments launch (M12).
        </p>
        <FormField label="Address line" htmlFor="billingLine1">
          <input
            id="billingLine1"
            className={inputClassName}
            value={form.billingLine1}
            onChange={(e) => onChange({ billingLine1: e.target.value })}
            disabled={disabled}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="billingCity">
            <input
              id="billingCity"
              className={inputClassName}
              value={form.billingCity}
              onChange={(e) => onChange({ billingCity: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="State / region" htmlFor="billingRegion">
            <input
              id="billingRegion"
              className={inputClassName}
              value={form.billingRegion}
              onChange={(e) => onChange({ billingRegion: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Country" htmlFor="billingCountry">
            <input
              id="billingCountry"
              className={inputClassName}
              value={form.billingCountry}
              onChange={(e) => onChange({ billingCountry: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Postal code" htmlFor="billingPostalCode">
            <input
              id="billingPostalCode"
              className={inputClassName}
              value={form.billingPostalCode}
              onChange={(e) => onChange({ billingPostalCode: e.target.value })}
              disabled={disabled}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}

export function clientFormToPayload(
  form: ClientFormState,
  completeOnboarding: boolean,
) {
  return {
    companyName: form.companyName || null,
    contactName: form.contactName,
    phone: form.phone || null,
    billingAddress: {
      line1: form.billingLine1 || undefined,
      city: form.billingCity || undefined,
      region: form.billingRegion || undefined,
      country: form.billingCountry || undefined,
      postalCode: form.billingPostalCode || undefined,
    },
    completeOnboarding,
  };
}

export function clientDtoToFormState(profile: ClientProfileDto): ClientFormState {
  const billing = profile.billingAddress;
  return {
    companyName: profile.companyName ?? "",
    contactName: profile.contactName,
    phone: profile.phone ?? "",
    billingLine1: billing?.line1 ?? "",
    billingCity: billing?.city ?? "",
    billingRegion: billing?.region ?? "",
    billingCountry: billing?.country ?? "",
    billingPostalCode: billing?.postalCode ?? "",
  };
}
