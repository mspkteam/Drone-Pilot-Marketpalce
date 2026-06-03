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

export function PilotOnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState<PilotFormState>(emptyPilotFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <PilotProfileFormFields
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        showCompliance
        disabled={loading}
      />

      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "Submitting…" : "Submit profile for review"}
      </Button>
    </form>
  );
}
