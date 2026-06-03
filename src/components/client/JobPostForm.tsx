"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JobForm,
  emptyJobFormState,
  jobFormToPayload,
  type JobFormState,
} from "@/components/jobs/JobForm";
import { Button } from "@/components/ui/Button";
import { MultiStepWizard, type WizardStep } from "@/components/ui/MultiStepWizard";
import { JOB_CATEGORIES } from "@/types/job";

const STEPS: WizardStep[] = [
  { id: "basics", title: "Job basics", description: "Title & category" },
  { id: "requirements", title: "Requirements", description: "Deliverables" },
  { id: "budget", title: "Budget & timeline", description: "Dates & budget" },
  { id: "location", title: "Location", description: "Where to fly" },
  { id: "review", title: "Review", description: "Submit or draft" },
];

function validateStep(step: number, form: JobFormState): string | null {
  if (step === 0) {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category) return "Select a category.";
  }
  if (step === 3 && !form.locationLabel.trim()) {
    return "Location is required.";
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
        <>
          <div>
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} disabled={loading}>
                Continue
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void handleSaveDraft()}
                >
                  {loading ? "Saving…" : "Save draft"}
                </Button>
                <Button type="button" disabled={loading} onClick={() => void handleSubmit()}>
                  {loading ? "Submitting…" : "Submit for approval"}
                </Button>
              </>
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
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Review your job posting before saving or submitting for admin approval.
          </p>
          <dl className="premium-card divide-y divide-border">
            {[
              ["Title", form.title],
              ["Category", categoryLabel || "—"],
              ["Location", form.locationLabel],
              ["Budget", `${form.budgetMin || "—"} – ${form.budgetMax || "—"} USD`],
              ["Date", form.scheduledDate || "Flexible"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="max-w-[60%] text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </MultiStepWizard>
  );
}
