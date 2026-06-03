"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JobForm,
  JobFormActions,
  emptyJobFormState,
  jobFormToPayload,
  type JobFormState,
} from "@/components/jobs/JobForm";

export function JobPostForm() {
  const router = useRouter();
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

  return (
    <div className="space-y-6">
      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <JobForm
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        disabled={loading}
      />

      <JobFormActions
        loading={loading}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
