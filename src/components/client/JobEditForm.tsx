"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JobForm,
  JobFormActions,
  jobDtoToFormState,
  jobFormToPayload,
  type JobFormState,
} from "@/components/jobs/JobForm";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import type { JobDto } from "@/types/job";
import { canClientEditJob } from "@/lib/jobs/status";

type JobEditFormProps = {
  job: JobDto;
};

export function JobEditForm({ job }: JobEditFormProps) {
  const router = useRouter();
  const editable = canClientEditJob(job.status);
  const [form, setForm] = useState<JobFormState>(() => jobDtoToFormState(job));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function savePatch() {
    const res = await fetch(`/api/client/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobFormToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Failed to save job.");
    }
    return data.job;
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await savePatch();
      setSuccess("Draft saved.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await savePatch();
      const submitRes = await fetch(`/api/client/jobs/${job.id}/submit`, {
        method: "POST",
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.error ?? "Failed to submit.");
      }
      router.push("/dashboard/client/jobs?submitted=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <JobStatusBadge status={job.status} />
        {job.rejectionReason ? (
          <p className="text-sm text-destructive">
            Rejected: {job.rejectionReason}
          </p>
        ) : null}
      </div>

      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-dark"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <JobForm
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        disabled={loading || !editable}
      />

      {editable ? (
        <JobFormActions
          loading={loading}
          onSaveDraft={handleSave}
          onSubmit={handleSubmit}
          submitLabel={
            job.status === "rejected"
              ? "Resubmit for approval"
              : "Submit for approval"
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          This job cannot be edited while it is{" "}
          {job.status.replace("_", " ")}. Admin approval is handled in module
          M07.
        </p>
      )}
    </div>
  );
}
