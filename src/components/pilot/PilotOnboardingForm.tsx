"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  emptyPilotFormState,
  PilotProfileFormFields,
  pilotFormToPayload,
  type PilotFormState,
} from "@/components/pilot/PilotProfileFormFields";
import { validateComplianceAcknowledgments } from "@/lib/pilot/compliance";
import { PILOT_SERVICE_OPTIONS } from "@/types/pilot";
import { ProfileReviewSummary } from "@/components/ui/ProfileReviewSummary";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";
import { WizardFormFooter } from "@/components/ui/WizardFormFooter";

const STEPS: WizardStep[] = [
  { id: "basics", title: "Basic information", description: "Name & bio" },
  { id: "location", title: "Location & service area", description: "Where you fly" },
  { id: "services", title: "Services & equipment", description: "Skills & rates" },
  { id: "compliance", title: "Compliance", description: "License & checklist" },
  { id: "review", title: "Review & submit", description: "Send for approval" },
];

function serviceLabels(ids: string[]): string {
  if (ids.length === 0) return "—";
  return ids
    .map((id) => PILOT_SERVICE_OPTIONS.find((s) => s.id === id)?.label ?? id)
    .join(", ");
}

function formatLocation(form: PilotFormState): string {
  const parts = [
    form.locationCity,
    form.locationRegion,
    form.locationCountry,
  ].filter((p) => p.trim());
  return parts.join(", ") || "—";
}

function formatRateRange(form: PilotFormState): string {
  if (form.hourlyRateMin && form.hourlyRateMax) {
    return `$${form.hourlyRateMin} – $${form.hourlyRateMax} / hr`;
  }
  if (form.hourlyRateMin) return `From $${form.hourlyRateMin} / hr`;
  if (form.hourlyRateMax) return `Up to $${form.hourlyRateMax} / hr`;
  return "—";
}

function validateStep(step: number, form: PilotFormState): string | null {
  if (step === 0 && form.displayName.trim().length < 2) {
    return "Full name is required (at least 2 characters).";
  }
  if (step === 1) {
    if (!form.locationCity.trim()) return "City is required.";
    if (!form.locationCountry.trim()) return "Country is required.";
  }
  if (step === 2 && form.servicesOffered.length === 0) {
    return "Select at least one service.";
  }
  if (step === 3) {
    if (!form.licenseNumber.trim()) return "License / certificate number is required.";
    if (!validateComplianceAcknowledgments(form.complianceAcknowledged)) {
      return "Complete all items on the compliance checklist.";
    }
  }
  return null;
}

function validateAll(form: PilotFormState): string | null {
  for (let i = 0; i < STEPS.length - 1; i++) {
    const err = validateStep(i, form);
    if (err) return err;
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
    const err = validateAll(form);
    if (err) {
      setError(err);
      return;
    }
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
        <WizardFormFooter
          step={step}
          totalSteps={STEPS.length}
          onBack={goBack}
          onNext={goNext}
          onSubmit={() => void handleSubmit()}
          loading={loading}
          submitLabel="Submit profile for review"
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
          <div className="premium-card border-gold/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Verification upload</p>
            <p className="mt-1">
              After you submit your profile, upload license and insurance documents under{" "}
              <Link
                href="/dashboard/pilot/verifications"
                className="text-gold-light hover:text-gold underline"
              >
                Verifications
              </Link>{" "}
              for admin review.
            </p>
          </div>
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review your profile before submitting for admin approval. You will be notified
            when your account is approved to browse jobs and bid.
          </p>
          <ProfileReviewSummary
            rows={[
              { label: "Full name", value: form.displayName },
              { label: "Bio", value: form.bio || "—" },
              { label: "Home location", value: formatLocation(form) },
              {
                label: "Travel radius",
                value: form.serviceRadiusKm
                  ? `${form.serviceRadiusKm} km`
                  : "—",
              },
              { label: "Services", value: serviceLabels(form.servicesOffered) },
              { label: "Rate range", value: formatRateRange(form) },
              {
                label: "License / certificate",
                value: form.licenseNumber
                  ? `${form.licenseNumber}${form.licenseCountry ? ` (${form.licenseCountry})` : ""}`
                  : "—",
              },
              {
                label: "Compliance checklist",
                value: validateComplianceAcknowledgments(form.complianceAcknowledged)
                  ? "Complete"
                  : "Incomplete",
              },
            ]}
          />
        </div>
      ) : null}
    </MultiStepWizard>
  );
}
