"use client";

import { useState } from "react";
import { calculateServiceFee } from "@/lib/commission/constants";
import type { ChangeOrderSummaryDto } from "@/types/change-order";

type Props = {
  bookingId: string;
  bookingStatus: string;
  actor: "client" | "pilot";
  summary: ChangeOrderSummaryDto;
  onChanged: () => void;
};

export function BookingChangeOrders({
  bookingId,
  bookingStatus,
  actor,
  summary,
  onChanged,
}: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = bookingStatus === "confirmed" || bookingStatus === "in_progress";
  const open = summary.changeOrders.find((c) => c.status === "proposed");
  const money = (n: number) => `${summary.currency} ${n.toLocaleString()}`;
  const base = actor === "client" ? "/api/client/bookings" : "/api/pilot/bookings";

  async function call(url: string, method: string, body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }
      if (typeof data.checkoutUrl === "string" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setAmount("");
      setNote("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const previewDelta = Number(amount) - summary.currentAmount;
  const showPreview = Number.isFinite(previewDelta) && previewDelta > 0;

  if (!active && summary.changeOrders.length === 0) return null;

  return (
    <div className="ras-panel space-y-3">
      <h3 className="ras-panel-title">Change orders</h3>
      <p className="ras-help">
        Mid-job price increases are capped at +20% of the original amount (max{" "}
        {money(summary.maxAmount)}). A 6% service fee applies to the increase.
      </p>

      {open ? (
        <div className="space-y-2">
          <p className="text-sm">
            Proposed new job amount: <strong>{money(open.proposedAmount)}</strong>{" "}
            (+{money(open.deltaAmount)}, service fee {money(open.serviceFee)}; client
            pays +{money(open.deltaAmount + open.serviceFee)}).
          </p>
          {open.note ? <p className="ras-muted text-sm">{open.note}</p> : null}
          {actor === "client" ? (
            <div className="flex gap-2">
              <button
                type="button"
                className="ras-btn"
                disabled={busy}
                onClick={() =>
                  call(`${base}/${bookingId}/change-orders/${open.id}`, "PATCH", {
                    action: "accept",
                  })
                }
              >
                Accept
              </button>
              <button
                type="button"
                className="ras-btn ras-btn--secondary"
                disabled={busy}
                onClick={() =>
                  call(`${base}/${bookingId}/change-orders/${open.id}`, "PATCH", {
                    action: "reject",
                  })
                }
              >
                Decline
              </button>
            </div>
          ) : (
            <p className="ras-muted text-sm">Awaiting client response.</p>
          )}
        </div>
      ) : null}

      {actor === "pilot" && active && !open ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void call(`${base}/${bookingId}/change-orders`, "POST", {
              proposedAmount: Number(amount),
              note,
            });
          }}
        >
          <label className="block text-sm">
            New total job amount ({summary.currency})
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded border border-border bg-transparent px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            Reason (optional)
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 block w-full rounded border border-border bg-transparent px-3 py-2"
            />
          </label>
          {showPreview ? (
            <p className="ras-help">
              Increase {money(previewDelta)} + 6% fee{" "}
              {money(calculateServiceFee(previewDelta))}.
            </p>
          ) : null}
          <button type="submit" className="ras-btn" disabled={busy}>
            Propose change order
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {summary.changeOrders.filter((c) => c.status !== "proposed").length > 0 ? (
        <ul className="ras-muted space-y-1 text-sm">
          {summary.changeOrders
            .filter((c) => c.status !== "proposed")
            .map((c) => (
              <li key={c.id}>
                {money(c.proposedAmount)} — <span className="capitalize">{c.status}</span>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
