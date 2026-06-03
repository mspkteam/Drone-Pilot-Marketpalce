"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import type { AdminPaymentDto } from "@/types/admin";

export function AdminPaymentsPanel() {
  const [payments, setPayments] = useState<AdminPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load payments.");
        setPayments([]);
      } else {
        setPayments(data.payments ?? []);
      }
    } catch {
      setError("Failed to load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalCommission = payments.reduce(
    (sum, p) => sum + (p.commission?.amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Phase 1 commission rate: {(DEFAULT_COMMISSION_RATE * 100).toFixed(0)}%
        (internal records on booking completion).
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading payments…</p>
      ) : payments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No payment records yet. Complete a booking to generate payment and
          commission entries.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium">
            Total commission recorded: USD {totalCommission.toLocaleString()}
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {payments.map((p) => (
              <li key={p.id} className="p-4">
                <p className="font-medium">{p.jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Gross {p.currency} {p.amountGross.toLocaleString()} · Net{" "}
                  {p.amountNet.toLocaleString()} · {p.status}
                </p>
                {p.commission ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Commission {(p.commission.rate * 100).toFixed(0)}%:{" "}
                    {p.currency} {p.commission.amount.toLocaleString()} (
                    {p.commission.status})
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
