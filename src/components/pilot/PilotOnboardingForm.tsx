"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  emptyPilotFormState,
  PilotProfileFormFields,
  pilotFormToPayload,
  type PilotFormState,
} from "@/components/pilot/PilotProfileFormFields";
import { Button } from "@/components/ui/Button";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";

const STEPS: WizardStep[] = [
  { id: "basics", title: "Basic info", description: "Name & bio" },
  { id: "location", title: "Location", description: "Service area" },
  { id: "services", title: "Services", description: "Skills & rates" },
  { id: "compliance", title: "Compliance", description: "License & checklist" },
  { id: "review", title: "Review", description: "Submit for approval" },
];

function validateStep(step: number, form: PilotFormState): string | null {
  if (step === 0 && form.displayName.trim().length < 2) {
    return "Display name is required.";
  }
  if (step === 1) {
    if (!form.locationCity.trim()) return "City is required.";
    if (!form.locationCountry.trim()) return "Country is required.";
  }
  if (step === 2 && form.servicesOffered.length === 0) {
    return "Select at least one service.";
  }
  if (step === 3) {
    if (!form.licenseNumber.trim()) return "License number is required.";
    if (form.complianceAcknowledged.length < 4) {
      return "Complete the compliance checklist.";
    }
  }
  return null;
}

export function PilotOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PilotFormState>(emptyPilotFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const payload = pilotFormToPayload(form, true);
    const res = await fetch("/api/pilot/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to submit profile.");
      return;
    }
    router.push("/dashboard/pilot?onboarding=complete");
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
        <>
          <div className="flex gap-2">
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
                {loading ? "Submitting…" : "Submit profile for review"}
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

      {step === 0 ? (
        <PilotProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="basics"
          disabled={loading}
        />
      ) : null}
      {step === 1 ? (
        <PilotProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="location"
          disabled={loading}
        />
      ) : null}
      {step === 2 ? (
        <PilotProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="services"
          disabled={loading}
        />
      ) : null}
      {step === 3 ? (
        <div className="space-y-8">
          <PilotProfileFormFields
            form={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            section="license"
            disabled={loading}
          />
          <PilotProfileFormFields
            form={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            section="compliance"
            showCompliance
            disabled={loading}
          />
        </div>
      ) : null}
      {step === 4 ? (
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Review your profile before submitting for admin approval.
          </p>
          <dl className="premium-card divide-y divide-border">
            {[
              ["Display name", form.displayName],
              ["Location", `${form.locationCity}, ${form.locationCountry}`],
              ["Services", form.servicesOffered.join(", ") || "—"],
              ["License", form.licenseNumber],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </MultiStepWizard>
  );
}
