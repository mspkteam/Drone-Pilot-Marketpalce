"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JobForm,
  emptyJobFormState,
  jobFormToPayload,
  type JobFormState,
} from "@/components/jobs/JobForm";
import { ProfileReviewSummary } from "@/components/ui/ProfileReviewSummary";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";
import { WizardFormFooter } from "@/components/ui/WizardFormFooter";
import { JOB_CATEGORIES } from "@/types/job";

const STEPS: WizardStep[] = [
  { id: "basics", title: "Job basics", description: "Title & category" },
  { id: "requirements", title: "Project requirements", description: "Deliverables" },
  { id: "budget", title: "Budget & timeline", description: "Dates & budget" },
  { id: "location", title: "Locations", description: "Shoot site" },
  { id: "review", title: "Review & submit", description: "Draft or approval" },
];

function formatLocation(form: JobFormState): string {
  const parts = [
    form.locationLabel,
    form.locationCity,
    form.locationRegion,
    form.locationCountry,
  ].filter((p) => p.trim());
  return parts.join(", ") || "—";
}

function formatBudget(form: JobFormState): string {
  if (form.budgetMin && form.budgetMax) {
    return `$${form.budgetMin} – $${form.budgetMax} USD`;
  }
  if (form.budgetMin) return `From $${form.budgetMin} USD`;
  if (form.budgetMax) return `Up to $${form.budgetMax} USD`;
  return "—";
}

function validateStep(step: number, form: JobFormState): string | null {
  if (step === 0) {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category) return "Select a category.";
  }
  if (step === 3 && !form.locationLabel.trim()) {
    return "Location (site name or address) is required.";
  }
  return null;
}

function validateAll(form: JobFormState): string | null {
  for (let i = 0; i < STEPS.length - 1; i++) {
    const err = validateStep(i, form);
    if (err) return err;
  }
  return null;
}

export function JobPostForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<JobFormState>(emptyJobFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createJob() {
    const err = validateAll(form);
    if (err) throw new Error(err);

    const res = await fetch("/api/client/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobFormToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Failed to create job.");
    }
    return data.job.id as string;
  }

  async function handleSaveDraft() {
    setError(null);
    setLoading(true);
    try {
      const id = await createJob();
      router.push(`/dashboard/client/jobs/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const id = await createJob();
      const submitRes = await fetch(`/api/client/jobs/${id}/submit`, {
        method: "POST",
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.error ?? "Failed to submit job.");
      }
      router.push("/dashboard/client/jobs?submitted=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit job.");
    } finally {
      setLoading(false);
    }
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

  const categoryLabel =
    JOB_CATEGORIES.find((c) => c.id === form.category)?.label ?? form.category;

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
          onSaveDraft={() => void handleSaveDraft()}
          loading={loading}
          submitLabel="Submit for approval"
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
        <JobForm
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="basics"
          disabled={loading}
        />
      ) : null}
      {step === 1 ? (
        <JobForm
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="requirements"
          disabled={loading}
        />
      ) : null}
      {step === 2 ? (
        <JobForm
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="budget"
          disabled={loading}
        />
      ) : null}
      {step === 3 ? (
        <JobForm
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          section="location"
          disabled={loading}
        />
      ) : null}
      {step === 4 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review your job before saving as a draft or submitting for admin approval.
            You can edit drafts until they are approved.
          </p>
          <ProfileReviewSummary
            rows={[
              { label: "Title", value: form.title },
              { label: "Category", value: categoryLabel || "—" },
              {
                label: "Description",
                value:
                  form.description.length > 120
                    ? `${form.description.slice(0, 120)}…`
                    : form.description,
              },
              {
                label: "Requirements",
                value: form.requirements || "—",
              },
              { label: "Budget", value: formatBudget(form) },
              {
                label: "Shoot date",
                value: form.scheduledDate || "Flexible / TBD",
              },
              { label: "Location", value: formatLocation(form) },
            ]}
          />
        </div>
      ) : null}
    </MultiStepWizard>
  );
}
