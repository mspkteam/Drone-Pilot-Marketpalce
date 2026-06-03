"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import {
  getDisputeEntryTypeLabel,
  getDisputeResolutionLabel,
} from "@/lib/disputes/status";
import type {
  DisputeDetailDto,
  DisputeResolutionType,
} from "@/types/dispute";
import { DISPUTE_RESOLUTION_TYPES } from "@/types/dispute";
import type { UserRole } from "@/types/roles";

type AdminDisputeDetailPanelProps = {
  disputeId: string;
  viewerRole: UserRole;
};

export function AdminDisputeDetailPanel({
  disputeId,
  viewerRole,
}: AdminDisputeDetailPanelProps) {
  const [dispute, setDispute] = useState<DisputeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [resolutionType, setResolutionType] =
    useState<DisputeResolutionType>("full_payout");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load dispute.");
        setDispute(null);
      } else {
        setDispute(data.dispute);
      }
    } catch {
      setError("Failed to load dispute.");
      setDispute(null);
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function startReview() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/review`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Review start failed.");
      } else {
        setDispute(data.dispute);
      }
    } catch {
      setError("Review start failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resolve() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionType,
          resolutionNotes,
          resolutionAmount:
            resolutionType === "partial_payout"
              ? parseFloat(resolutionAmount)
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Resolution failed.");
      } else {
        setDispute(data.dispute);
      }
    } catch {
      setError("Resolution failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function addComment() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Comment failed.");
      } else {
        setComment("");
        await load();
      }
    } catch {
      setError("Comment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading dispute…</p>;
  }

  if (!dispute) {
    return (
      <p className="text-sm text-destructive">{error ?? "Dispute not found."}</p>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/admin/disputes"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All disputes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{dispute.booking.job.title}</h2>
        <DisputeStatusBadge status={dispute.status} />
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Client</dt>
          <dd>
            {dispute.booking.client.companyName ??
              dispute.booking.client.contactName}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pilot</dt>
          <dd>{dispute.booking.pilot.displayName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Agreed amount</dt>
          <dd>
            ${dispute.booking.agreedAmount} {dispute.booking.currency}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Opened by</dt>
          <dd>{dispute.openedByRole}</dd>
        </div>
      </dl>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Initial reason
        </p>
        <p className="mt-2 text-sm whitespace-pre-wrap">{dispute.reason}</p>
      </div>

      {dispute.resolutionType ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-medium text-emerald-800">Resolved</p>
          <p className="mt-1">
            {getDisputeResolutionLabel(dispute.resolutionType)}
            {dispute.resolutionAmount != null
              ? ` — pilot payout $${dispute.resolutionAmount}`
              : null}
          </p>
          {dispute.resolutionNotes ? (
            <p className="mt-1 text-muted-foreground">{dispute.resolutionNotes}</p>
          ) : null}
        </div>
      ) : null}

      <ul className="space-y-3">
        {dispute.entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-md border border-border p-3 text-sm"
          >
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {entry.authorLabel}
              </span>
              <span>{getDisputeEntryTypeLabel(entry.entryType)}</span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{entry.body}</p>
            {entry.attachmentUrl ? (
              <a
                href={entry.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all text-xs text-gold-dark hover:underline"
              >
                {entry.attachmentUrl}
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      {dispute.canAddEntry ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="font-medium text-sm">Moderator comment</h3>
          <FormField label="Comment" htmlFor="mod-comment">
            <textarea
              id="mod-comment"
              className={inputClassName}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting || comment.trim().length < 2}
            onClick={() => void addComment()}
          >
            Post comment
          </Button>
        </div>
      ) : null}

      {dispute.canStartReview ? (
        <Button type="button" disabled={submitting} onClick={() => void startReview()}>
          Start review
        </Button>
      ) : null}

      {dispute.canResolve && viewerRole === "super_admin" ? (
        <div className="space-y-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="font-medium">Resolve dispute (Super Admin)</h3>
          <FormField label="Resolution" htmlFor="resolution-type">
            <select
              id="resolution-type"
              className={inputClassName}
              value={resolutionType}
              onChange={(e) =>
                setResolutionType(e.target.value as DisputeResolutionType)
              }
            >
              {DISPUTE_RESOLUTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {getDisputeResolutionLabel(t)}
                </option>
              ))}
            </select>
          </FormField>
          {resolutionType === "partial_payout" ? (
            <FormField label="Pilot payout amount" htmlFor="partial-amount">
              <input
                id="partial-amount"
                type="number"
                min={0}
                step="0.01"
                className={inputClassName}
                value={resolutionAmount}
                onChange={(e) => setResolutionAmount(e.target.value)}
              />
            </FormField>
          ) : null}
          <FormField label="Resolution notes" htmlFor="resolution-notes">
            <textarea
              id="resolution-notes"
              className={inputClassName}
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            disabled={submitting || resolutionNotes.trim().length < 5}
            onClick={() => void resolve()}
          >
            Resolve dispute
          </Button>
        </div>
      ) : dispute.status === "under_review" && viewerRole === "moderator" ? (
        <p className="text-sm text-muted-foreground">
          Only a Super Admin can resolve this dispute after review.
        </p>
      ) : null}
    </div>
  );
}
