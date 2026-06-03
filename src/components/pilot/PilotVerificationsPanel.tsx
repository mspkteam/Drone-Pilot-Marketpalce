"use client";

import { useCallback, useEffect, useState } from "react";
import { VerificationDocumentLink } from "@/components/verification/VerificationDocumentLink";
import { VerificationStatusBadge } from "@/components/verification/VerificationStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { VERIFICATION_MAX_BYTES } from "@/lib/verification/constants";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import type { VerificationDto, VerificationType } from "@/types/verification";
import { VERIFICATION_TYPES } from "@/types/verification";

type SubmitMode = "upload" | "link";

export function PilotVerificationsPanel() {
  const [verifications, setVerifications] = useState<VerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<SubmitMode>("upload");
  const [type, setType] = useState<VerificationType>("license");
  const [file, setFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/verifications");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load verifications.");
        setVerifications([]);
      } else {
        setVerifications(data.verifications ?? []);
      }
    } catch {
      setError("Failed to load verifications.");
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let res: Response;

      if (mode === "upload") {
        if (!file) {
          setError("Choose a PDF or image file to upload.");
          setSubmitting(false);
          return;
        }
        if (file.size > VERIFICATION_MAX_BYTES) {
          setError("File must be 5 MB or smaller.");
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.set("type", type);
        formData.set("file", file);
        if (notes.trim()) formData.set("notes", notes.trim());

        res = await fetch("/api/pilot/verifications", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/pilot/verifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            documentUrl,
            notes: notes || null,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
      } else {
        setSuccess("Verification submitted for admin review.");
        setFile(null);
        setDocumentUrl("");
        setNotes("");
        await load();
      }
    } catch {
      setError("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">Submit verification</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a PDF or image (max 5 MB), or provide a secure document link.
          Files are stored privately and reviewed by moderators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={
              mode === "upload"
                ? "rounded-full border border-gold bg-gold/10 px-3 py-1 text-sm text-gold-dark"
                : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={
              mode === "link"
                ? "rounded-full border border-gold bg-gold/10 px-3 py-1 text-sm text-gold-dark"
                : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Document link
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
          <FormField label="Type" htmlFor="verification-type">
            <select
              id="verification-type"
              value={type}
              onChange={(e) => setType(e.target.value as VerificationType)}
              className={inputClassName}
            >
              {VERIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {getVerificationTypeLabel(t)}
                </option>
              ))}
            </select>
          </FormField>

          {mode === "upload" ? (
            <FormField
              label="Document file"
              htmlFor="verification-file"
              required
              hint="PDF, JPEG, PNG, or WebP — max 5 MB"
            >
              <input
                id="verification-file"
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className={inputClassName}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </FormField>
          ) : (
            <FormField
              label="Document link or reference"
              htmlFor="document-url"
              required
            >
              <input
                id="document-url"
                type="text"
                className={inputClassName}
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://… or certificate reference ID"
                required
              />
            </FormField>
          )}

          <FormField label="Notes (optional)" htmlFor="verification-notes">
            <input
              id="verification-notes"
              type="text"
              className={inputClassName}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Issuing authority, expiry, etc."
            />
          </FormField>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        </form>

        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-3 text-sm text-emerald-700" role="status">
            {success}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your submissions</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : verifications.length === 0 ? (
          <p className="mt-4 empty-state">
            No verifications submitted yet.
          </p>
        ) : (
          <ul className="mt-4 list-panel">
            {verifications.map((v) => (
              <li key={v.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {getVerificationTypeLabel(v.type)}
                  </p>
                  <VerificationStatusBadge status={v.status} />
                </div>
                <div className="mt-1">
                  <VerificationDocumentLink
                    verification={v}
                    audience="pilot"
                  />
                </div>
                {v.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{v.notes}</p>
                ) : null}
                {v.rejectionReason ? (
                  <p className="mt-2 text-sm text-destructive">
                    Rejected: {v.rejectionReason}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {new Date(v.submittedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
