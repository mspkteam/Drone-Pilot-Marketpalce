"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { PilotOpenJobDto } from "@/types/application";

type PilotBidFormProps = {
  jobId: string;
  currency: string;
};

export function PilotBidForm({ jobId, currency }: PilotBidFormProps) {
  const router = useRouter();
  const [proposedAmount, setProposedAmount] = useState("");
  const [message, setMessage] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/pilot/jobs/${jobId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedAmount,
          message: message.trim() || null,
          estimatedDeliveryDate: estimatedDeliveryDate || null,
          currency,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit application.");
        return;
      }

      router.push("/dashboard/pilot/proposals?submitted=1");
      router.refresh();
    } catch {
      setError("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <FormField label={`Proposed amount (${currency})`} htmlFor="proposedAmount" required>
        <input
          id="proposedAmount"
          name="proposedAmount"
          type="number"
          min="1"
          step="0.01"
          required
          value={proposedAmount}
          onChange={(e) => setProposedAmount(e.target.value)}
          className={inputClassName}
          placeholder="e.g. 1200"
        />
      </FormField>

      <FormField
        label="Cover message"
        htmlFor="message"
        hint="Optional — at least 10 characters if provided."
      >
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClassName}
          placeholder="Briefly describe your approach, equipment, and availability."
        />
      </FormField>

      <FormField
        label="Estimated delivery date"
        htmlFor="estimatedDeliveryDate"
        hint="Optional"
      >
        <input
          id="estimatedDeliveryDate"
          name="estimatedDeliveryDate"
          type="date"
          value={estimatedDeliveryDate}
          onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          className={inputClassName}
        />
      </FormField>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}

export function PilotJobSummary({ job }: { job: PilotOpenJobDto }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Description
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{job.description}</p>
      </div>
      {job.requirements ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Requirements
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{job.requirements}</p>
        </div>
      ) : null}
    </div>
  );
}
