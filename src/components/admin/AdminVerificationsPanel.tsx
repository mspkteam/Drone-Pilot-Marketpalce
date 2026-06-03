"use client";

import { useCallback, useEffect, useState } from "react";
import { VerificationDocumentLink } from "@/components/verification/VerificationDocumentLink";
import { VerificationStatusBadge } from "@/components/verification/VerificationStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import type { AdminVerificationDto } from "@/types/verification";
import type { VerificationStatus } from "@/types/verification";
import { cn } from "@/lib/utils";

const FILTERS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export function AdminVerificationsPanel() {
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [verifications, setVerifications] = useState<AdminVerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`);
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
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Approve failed.");
      } else {
        setRejectId(null);
        await load();
      }
    } catch {
      setError("Approve failed.");
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) {
      setError("Enter a rejection reason.");
      return;
    }
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reject failed.");
      } else {
        setRejectId(null);
        setRejectReason("");
        await load();
      }
    } catch {
      setError("Reject failed.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "filter-pill", filter === f.value && "filter-pill-active"
            )}
          >
            {f.label}
          </button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading verifications…</p>
      ) : verifications.length === 0 ? (
        <p className="empty-state">
          No verifications in this queue.
        </p>
      ) : (
        <ul className="list-panel">
          {verifications.map((v) => (
            <li key={v.id} className="space-y-3 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">
                    {getVerificationTypeLabel(v.type)} · {v.pilot.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {v.pilot.email} · License {v.pilot.licenseNumber}
                  </p>
                  <div className="mt-1">
                    <VerificationDocumentLink
                      verification={v}
                      audience="admin"
                    />
                  </div>
                  {v.notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Notes: {v.notes}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(v.submittedAt).toLocaleString()}
                  </p>
                </div>
                <VerificationStatusBadge status={v.status} />
              </div>

              {v.status === "pending" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={actingId === v.id}
                    onClick={() => void approve(v.id)}
                  >
                    Approve
                  </Button>
                  {rejectId === v.id ? (
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                      <FormField
                        label="Rejection reason"
                        htmlFor={`reject-${v.id}`}
                        className="flex-1"
                      >
                        <input
                          id={`reject-${v.id}`}
                          type="text"
                          className={inputClassName}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Required if rejecting"
                        />
                      </FormField>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={actingId === v.id}
                        onClick={() => void reject(v.id)}
                      >
                        Confirm reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectId(null);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRejectId(v.id)}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              ) : v.rejectionReason ? (
                <p className="text-sm text-destructive">
                  Rejected: {v.rejectionReason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
