"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { BookingActor } from "@/lib/bookings/status";
import type { BookingDeliveryDto, DeliveryStatus } from "@/types/delivery";
import type { BookingStatus } from "@/types/booking";

type BookingDeliverySectionProps = {
  bookingId: string;
  bookingStatus: BookingStatus;
  actor: BookingActor;
};

function statusLabel(status: DeliveryStatus | null): string {
  switch (status) {
    case "submitted":
      return "Awaiting client review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Revisions requested";
    case "draft":
    default:
      return "Draft";
  }
}

export function BookingDeliverySection({
  bookingId,
  bookingStatus,
  actor,
}: BookingDeliverySectionProps) {
  const router = useRouter();
  const apiBase =
    actor === "pilot" ? "/api/pilot/bookings" : "/api/client/bookings";
  const [delivery, setDelivery] = useState<BookingDeliveryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch(`${apiBase}/${bookingId}/delivery`)
      .then((res) => res.json())
      .then((data) => {
        setDelivery(data.delivery ?? null);
        if (data.delivery?.notes) setNotes(data.delivery.notes);
      })
      .catch(() => setError("Failed to load deliverables."))
      .finally(() => setLoading(false));
  }, [apiBase, bookingId]);

  const canPilotEdit =
    actor === "pilot" &&
    bookingStatus === "in_progress" &&
    (delivery?.status === "draft" ||
      delivery?.status === "rejected" ||
      !delivery);

  const canClientReview =
    actor === "client" &&
    bookingStatus === "in_progress" &&
    delivery?.status === "submitted";

  if (
    bookingStatus === "pending" ||
    bookingStatus === "confirmed" ||
    bookingStatus === "cancelled"
  ) {
    return null;
  }

  async function refreshDelivery() {
    const res = await fetch(`${apiBase}/${bookingId}/delivery`);
    const data = await res.json();
    setDelivery(data.delivery ?? null);
    router.refresh();
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl, label: linkLabel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add link.");
        return;
      }
      setDelivery(data.delivery);
      setLinkUrl("");
      setLinkLabel("");
      router.refresh();
    } catch {
      setError("Failed to add link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBase}/${bookingId}/delivery`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to upload file.");
        return;
      }
      setDelivery(data.delivery);
      router.refresh();
    } catch {
      setError("Failed to upload file.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleSaveNotes() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save notes.");
        return;
      }
      setDelivery(data.delivery);
    } catch {
      setError("Failed to save notes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitForReview() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/delivery/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit deliverables.");
        return;
      }
      setDelivery(data.delivery);
      router.refresh();
    } catch {
      setError("Failed to submit deliverables.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReview(decision: "approve" | "reject") {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${bookingId}/delivery/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, feedback }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to review deliverables.");
        return;
      }
      setDelivery(data.delivery);
      setFeedback("");
      await refreshDelivery();
    } catch {
      setError("Failed to review deliverables.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-6" id="deliver">
      <h3 className="text-lg font-semibold">Deliver work</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {actor === "pilot"
          ? "Upload files or share links, then submit for client approval."
          : "Review submitted deliverables and approve to complete the contract."}
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading deliverables…</p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {delivery ? (
        <p className="mt-4 text-sm">
          Status: <strong>{statusLabel(delivery.status)}</strong>
        </p>
      ) : null}

      {delivery?.clientFeedback ? (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          Client feedback: {delivery.clientFeedback}
        </p>
      ) : null}

      {delivery?.items.length ? (
        <ul className="mt-4 space-y-2">
          {delivery.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span>{item.label}</span>
              {item.kind === "link" && item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-dark hover:text-gold"
                >
                  Open link →
                </a>
              ) : item.storedFileName ? (
                <a
                  href={`${apiBase}/${bookingId}/delivery/files/${item.id}`}
                  className="text-gold-dark hover:text-gold"
                >
                  Download →
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No deliverables yet.</p>
      )}

      {delivery?.notes ? (
        <p className="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">
          Pilot notes: {delivery.notes}
        </p>
      ) : null}

      {canPilotEdit ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Upload file</label>
            <input
              type="file"
              className="mt-2 block w-full text-sm"
              disabled={busy}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.zip"
              onChange={(e) => void handleFileChange(e)}
            />
          </div>

          <form onSubmit={handleAddLink} className="space-y-2">
            <label className="block text-sm font-medium">Add link</label>
            <input
              type="url"
              placeholder="https://"
              value={linkUrl}
              disabled={busy}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={linkLabel}
              disabled={busy}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              onChange={(e) => setLinkLabel(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={busy || !linkUrl.trim()}>
              Add link
            </Button>
          </form>

          <div>
            <label className="block text-sm font-medium">Notes for client</label>
            <textarea
              rows={3}
              value={notes}
              disabled={busy}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={busy}
              onClick={() => void handleSaveNotes()}
            >
              Save notes
            </Button>
          </div>

          <Button
            type="button"
            disabled={busy || !delivery?.items.length}
            onClick={() => void handleSubmitForReview()}
          >
            {busy ? "Submitting…" : "Submit for client review"}
          </Button>
        </div>
      ) : null}

      {canClientReview ? (
        <div className="mt-6 space-y-3">
          <textarea
            rows={3}
            placeholder="Optional feedback or revision notes"
            value={feedback}
            disabled={busy}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleReview("approve")}
            >
              Approve deliverables
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void handleReview("reject")}
            >
              Request revisions
            </Button>
          </div>
        </div>
      ) : null}

      {bookingStatus === "completed" && delivery?.status === "approved" ? (
        <p className="mt-4 text-sm text-green-600" role="status">
          Deliverables approved and contract completed.
        </p>
      ) : null}
    </div>
  );
}
