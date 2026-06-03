"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClientProfileFormFields,
  clientFormToPayload,
  emptyClientFormState,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import { Button } from "@/components/ui/Button";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";

const STEPS: WizardStep[] = [
  { id: "contact", title: "Basic info", description: "Your name" },
  { id: "company", title: "Company", description: "Business details" },
  { id: "billing", title: "Billing", description: "Optional address" },
  { id: "review", title: "Review", description: "Save profile" },
];

function validateStep(step: number, form: ClientFormState): string | null {
  if (step === 0 && form.contactName.trim().length < 2) {
    return "Contact name is required.";
  }
  return null;
}

export function ClientOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ClientFormState>(emptyClientFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
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

  const sectionMap = ["contact", "company", "billing"] as const;

  return (
    <MultiStepWizard
      steps={STEPS}
      currentStep={step}
      footer={
        <>
          <div>
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} disabled={loading}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleSubmit()} disabled={loading}>
                {loading ? "Saving…" : "Complete setup"}
              </Button>
            )}
          </div>
        </>
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
          section={sectionMap[step]}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">Review your details before saving.</p>
          <dl className="premium-card divide-y divide-border">
            {[
              ["Contact", form.contactName],
              ["Company", form.companyName || "—"],
              ["Phone", form.phone || "—"],
              ["Billing city", form.billingCity || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </MultiStepWizard>
  );
}
