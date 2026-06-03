"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClientProfileFormFields,
  clientFormToPayload,
  emptyClientFormState,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import { ProfileReviewSummary } from "@/components/ui/ProfileReviewSummary";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";
import { WizardFormFooter } from "@/components/ui/WizardFormFooter";

const STEPS: WizardStep[] = [
  { id: "basic", title: "Basic information", description: "Your name" },
  { id: "company", title: "Company details", description: "Business name" },
  { id: "contact", title: "Contact details", description: "Phone & billing" },
  { id: "review", title: "Review & save", description: "Confirm details" },
];

const SECTIONS = ["basic", "company", "contact"] as const;

function validateStep(step: number, form: ClientFormState): string | null {
  if (step === 0 && form.contactName.trim().length < 2) {
    return "Your name is required (at least 2 characters).";
  }
  return null;
}

function validateAll(form: ClientFormState): string | null {
  for (let i = 0; i < SECTIONS.length; i++) {
    const err = validateStep(i, form);
    if (err) return err;
  }
  return null;
}

function formatBilling(form: ClientFormState): string {
  const parts = [
    form.billingLine1,
    [form.billingCity, form.billingRegion].filter(Boolean).join(", "),
    form.billingPostalCode,
    form.billingCountry,
  ].filter((p) => p?.trim());
  return parts.length ? parts.join(" · ") : "—";
}

export function ClientOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ClientFormState>(emptyClientFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const err = validateAll(form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/client/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientFormToPayload(form, true)),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      return;
    }
    router.push("/dashboard/client?onboarding=complete");
    router.refresh();
  }

  function goNext() {
    const err = validateStep(step, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <MultiStepWizard
      steps={STEPS}
      currentStep={step}
      footer={
        <WizardFormFooter
          step={step}
          totalSteps={STEPS.length}
          onBack={goBack}
          onNext={goNext}
          onSubmit={() => void handleSubmit()}
          loading={loading}
          submitLabel="Save profile"
        />
      }
    >
      {error ? (
        <p
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {step < 3 ? (
        <ClientProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section={SECTIONS[step]}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review your details before saving. You can update your profile anytime from
            settings.
          </p>
          <ProfileReviewSummary
            rows={[
              { label: "Your name", value: form.contactName },
              { label: "Company", value: form.companyName || "—" },
              { label: "Phone", value: form.phone || "—" },
              { label: "Billing address", value: formatBilling(form) },
            ]}
          />
        </div>
      )}
    </MultiStepWizard>
  );
}
