"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PilotProfileFormFields,
  pilotDtoToFormState,
  pilotFormToPayload,
  type PilotFormState,
} from "@/components/pilot/PilotProfileFormFields";
import { Button } from "@/components/ui/Button";
import type { PilotProfileDto } from "@/types/pilot";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";

type PilotProfileEditorProps = {
  profile: PilotProfileDto;
};

export function PilotProfileEditor({ profile }: PilotProfileEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<PilotFormState>(() =>
    pilotDtoToFormState(profile),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canEdit = profile.status !== "suspended";
  const showCompliance = !profile.onboardingCompletedAt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const completing = showCompliance;
    const payload = pilotFormToPayload(form, completing);

    const res = await fetch("/api/pilot/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      return;
    }

    setSuccess(
      completing
        ? "Profile submitted for review."
        : "Profile saved successfully.",
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-medium text-gold-dark">
          {getProfileStatusLabel(profile.status)}
        </span>
        {profile.status === "pending_review" ? (
          <p className="text-sm text-muted-foreground">
            An admin will review your profile before you can bid on jobs.
          </p>
        ) : null}
        {profile.status === "approved" ? (
          <p className="text-sm text-muted-foreground">
            Your profile is approved for marketplace activity.
            {profile.isPublic && isPublicPilotProfileEnabled() ? (
              <>
                {" "}
                <Link
                  href={`/pilots/${profile.id}`}
                  className="text-gold-dark hover:text-gold"
                >
                  View public profile →
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <PilotProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          showCompliance={showCompliance}
          showPublicToggle={profile.status === "approved"}
          disabled={loading || !canEdit}
        />

        {canEdit ? (
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : showCompliance ? "Submit for review" : "Save changes"}
          </Button>
        ) : null}
      </form>
    </div>
  );
}
