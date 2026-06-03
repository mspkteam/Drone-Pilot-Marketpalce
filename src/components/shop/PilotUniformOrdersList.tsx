"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UniformOrderStatusBadge } from "@/components/shop/UniformOrderStatusBadge";
import type { UniformOrderDto } from "@/types/shop";

export function PilotUniformOrdersList() {
  const [orders, setOrders] = useState<UniformOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/shop/orders");
      const data = await res.json();
      setOrders(res.ok ? (data.orders ?? []) : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/pilot/shop"
        className="text-sm text-gold-dark hover:underline"
      >
        ← Back to shop
      </Link>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {orders.map((o) => (
            <li key={o.id} className="p-4 hover:bg-surface/50">
              <Link
                href={`/dashboard/pilot/shop/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    ${o.total.toFixed(2)} ·{" "}
                    {new Date(o.placedAt).toLocaleDateString()}
                  </p>
                </div>
                <UniformOrderStatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
