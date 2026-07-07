"use client";

import { useCallback, useEffect, useState } from "react";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { getDisputeEntryTypeLabel, getDisputeResolutionLabel } from "@/lib/disputes/status";
import type { BookingStatus } from "@/types/booking";
import type { DisputeDetailDto, DisputeEntryType } from "@/types/dispute";
import { cn } from "@/lib/utils";

const OPEN_DISPUTE_STATUSES: BookingStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
];

type BookingDisputeSectionProps = {
  bookingId: string;
  bookingStatus: BookingStatus;
  actor: "client" | "pilot";
  /** Themed layout for client disputes detail — no duplicate header/reason shell */
  embedded?: boolean;
};

export function BookingDisputeSection({
  bookingId,
  bookingStatus,
  actor,
  embedded = false,
}: BookingDisputeSectionProps) {
  const apiBase = `/api/${actor}/bookings`;
  const entriesApi = `/api/${actor}/disputes`;

  const [dispute, setDispute] = useState<DisputeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openReason, setOpenReason] = useState("");
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [entryType, setEntryType] = useState<DisputeEntryType>("comment");
  const [entryBody, setEntryBody] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/dispute`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load dispute.");
        setDispute(null);
      } else {
        setDispute(data.dispute ?? null);
      }
    } catch {
      setError("Failed to load dispute.");
      setDispute(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase, bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canOpen =
    !dispute && OPEN_DISPUTE_STATUSES.includes(bookingStatus);

  const showSection =
    dispute != null ||
    canOpen ||
    bookingStatus === "disputed";

  async function openDispute() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: openReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not open dispute.");
      } else {
        setShowOpenForm(false);
        setOpenReason("");
        setDispute(data.dispute);
      }
    } catch {
      setError("Could not open dispute.");
    } finally {
      setSubmitting(false);
    }
  }

  async function addEntry() {
    if (!dispute) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${entriesApi}/${dispute.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType,
          body: entryBody,
          attachmentUrl: entryType === "evidence" ? evidenceUrl : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add entry.");
      } else {
        setEntryBody("");
        setEvidenceUrl("");
        await load();
      }
    } catch {
      setError("Could not add entry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return embedded ? (
      <p className="client-disputes-muted">Loading dispute thread…</p>
    ) : (
      <p className="text-sm text-muted-foreground">Loading dispute…</p>
    );
  }

  if (!showSection) {
    return null;
  }

  if (embedded) {
    return (
      <div className="client-disputes-dispute-section">
        {error ? (
          <p className="client-disputes-dispute-error" role="alert">
            {error}
          </p>
        ) : null}

        {!dispute && canOpen ? (
          <>
            <p className="client-disputes-dispute-intro">
              Open a dispute to flag payment or delivery issues on this booking.
              Both parties can add notes and evidence; moderators review and an
              admin resolves with payout or refund.
            </p>
            {showOpenForm ? (
              <>
                <div className="client-disputes-dispute-field">
                  <label className="client-disputes-dispute-label" htmlFor="dispute-reason">
                    Reason for dispute
                  </label>
                  <textarea
                    id="dispute-reason"
                    className="client-disputes-dispute-textarea"
                    rows={4}
                    value={openReason}
                    onChange={(e) => setOpenReason(e.target.value)}
                    placeholder="Describe the issue in detail…"
                  />
                </div>
                <div className="client-disputes-dispute-actions">
                  <button
                    type="button"
                    className="client-disputes-dispute-btn-primary"
                    disabled={submitting || openReason.trim().length < 10}
                    onClick={() => void openDispute()}
                  >
                    Submit dispute
                  </button>
                  <button
                    type="button"
                    className="client-disputes-dispute-btn-secondary"
                    onClick={() => setShowOpenForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="client-disputes-dispute-actions">
                <button
                  type="button"
                  className="client-disputes-dispute-btn-primary"
                  onClick={() => setShowOpenForm(true)}
                >
                  Open dispute
                </button>
              </div>
            )}
          </>
        ) : null}

        {dispute ? (
          <>
            {dispute.resolutionType ? (
              <div className="client-disputes-resolution">
                <strong>Resolution</strong>
                {getDisputeResolutionLabel(dispute.resolutionType)}
                {dispute.resolutionAmount != null
                  ? ` — $${dispute.resolutionAmount.toFixed(2)} to pilot`
                  : null}
                {dispute.resolutionNotes ? (
                  <>
                    <br />
                    {dispute.resolutionNotes}
                  </>
                ) : null}
              </div>
            ) : null}

            <ul className="client-disputes-dispute-entries">
              {dispute.entries.map((entry) => (
                <li
                  key={entry.id}
                  className={cn(
                    "client-disputes-dispute-entry",
                    entry.authorRole === actor &&
                      "client-disputes-dispute-entry--self",
                  )}
                >
                  <div className="client-disputes-dispute-entry-meta">
                    <span className="client-disputes-dispute-entry-author">
                      {entry.authorLabel}
                    </span>
                    <span>{getDisputeEntryTypeLabel(entry.entryType)}</span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="client-disputes-dispute-entry-body">{entry.body}</p>
                  {entry.attachmentUrl ? (
                    <a
                      href={entry.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="client-disputes-dispute-entry-link"
                    >
                      {entry.attachmentUrl}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>

            {dispute.canAddEntry ? (
              <div className="client-disputes-dispute-form">
                <div className="client-disputes-dispute-field">
                  <label className="client-disputes-dispute-label" htmlFor="entry-type">
                    Entry type
                  </label>
                  <select
                    id="entry-type"
                    className="client-disputes-dispute-select"
                    value={entryType}
                    onChange={(e) =>
                      setEntryType(e.target.value as DisputeEntryType)
                    }
                  >
                    <option value="comment">Comment</option>
                    <option value="note">Note</option>
                    <option value="evidence">Evidence (URL)</option>
                  </select>
                </div>
                <div className="client-disputes-dispute-field">
                  <label className="client-disputes-dispute-label" htmlFor="entry-body">
                    Message
                  </label>
                  <textarea
                    id="entry-body"
                    className="client-disputes-dispute-textarea"
                    rows={3}
                    value={entryBody}
                    onChange={(e) => setEntryBody(e.target.value)}
                  />
                </div>
                {entryType === "evidence" ? (
                  <div className="client-disputes-dispute-field">
                    <label className="client-disputes-dispute-label" htmlFor="evidence-url">
                      Evidence URL
                    </label>
                    <input
                      id="evidence-url"
                      type="url"
                      className="client-disputes-dispute-input"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                ) : null}
                <div className="client-disputes-dispute-actions">
                  <button
                    type="button"
                    className="client-disputes-dispute-btn-primary"
                    disabled={submitting || entryBody.trim().length < 2}
                    onClick={() => void addEntry()}
                  >
                    Add to dispute
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div id="dispute" className="rounded-lg border border-border p-6 space-y-4 scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">Dispute</h3>
        {dispute ? <DisputeStatusBadge status={dispute.status} /> : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!dispute && canOpen ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Open a dispute to flag payment or delivery issues on this booking.
            Both parties can add notes and evidence; moderators review and an
            admin resolves with payout or refund.
          </p>
          {showOpenForm ? (
            <>
              <FormField label="Reason for dispute" htmlFor="dispute-reason">
                <textarea
                  id="dispute-reason"
                  className={inputClassName}
                  rows={4}
                  value={openReason}
                  onChange={(e) => setOpenReason(e.target.value)}
                  placeholder="Describe the issue in detail…"
                />
              </FormField>
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={submitting || openReason.trim().length < 10}
                  onClick={() => void openDispute()}
                >
                  Submit dispute
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowOpenForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" onClick={() => setShowOpenForm(true)}>
              Open dispute
            </Button>
          )}
        </div>
      ) : null}

      {dispute ? (
        <>
          <p className="text-sm whitespace-pre-wrap">{dispute.reason}</p>
          {dispute.resolutionType ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <p className="font-medium text-emerald-800">Resolution</p>
              <p className="mt-1">
                {getDisputeResolutionLabel(dispute.resolutionType)}
                {dispute.resolutionAmount != null
                  ? ` — $${dispute.resolutionAmount.toFixed(2)} to pilot`
                  : null}
              </p>
              {dispute.resolutionNotes ? (
                <p className="mt-1 text-muted-foreground">
                  {dispute.resolutionNotes}
                </p>
              ) : null}
            </div>
          ) : null}

          <ul className="space-y-3 border-t border-border pt-4">
            {dispute.entries.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  "rounded-md border p-3 text-sm",
                  entry.authorRole === actor
                    ? "border-gold/30 bg-gold/5"
                    : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {entry.authorLabel}
                  </span>
                  <span>{getDisputeEntryTypeLabel(entry.entryType)}</span>
                  <span>
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{entry.body}</p>
                {entry.attachmentUrl ? (
                  <p className="mt-1 break-all text-xs">
                    <a
                      href={entry.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-dark hover:underline"
                    >
                      {entry.attachmentUrl}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {dispute.canAddEntry ? (
            <div className="space-y-3 border-t border-border pt-4">
              <FormField label="Entry type" htmlFor="entry-type">
                <select
                  id="entry-type"
                  className={inputClassName}
                  value={entryType}
                  onChange={(e) =>
                    setEntryType(e.target.value as DisputeEntryType)
                  }
                >
                  <option value="comment">Comment</option>
                  <option value="note">Note</option>
                  <option value="evidence">Evidence (URL)</option>
                </select>
              </FormField>
              <FormField label="Message" htmlFor="entry-body">
                <textarea
                  id="entry-body"
                  className={inputClassName}
                  rows={3}
                  value={entryBody}
                  onChange={(e) => setEntryBody(e.target.value)}
                />
              </FormField>
              {entryType === "evidence" ? (
                <FormField label="Evidence URL" htmlFor="evidence-url">
                  <input
                    id="evidence-url"
                    type="url"
                    className={inputClassName}
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </FormField>
              ) : null}
              <Button
                type="button"
                disabled={submitting || entryBody.trim().length < 2}
                onClick={() => void addEntry()}
              >
                Add to dispute
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
