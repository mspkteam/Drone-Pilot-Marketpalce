"use client";

import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import type { AdminSubscriptionRowDto } from "@/types/admin";
import type { SubscriptionStatus } from "@/types/subscription";

type AdminTierEnrollmentsProps = {
  subscriptions: AdminSubscriptionRowDto[];
};

export function AdminTierEnrollments({ subscriptions }: AdminTierEnrollmentsProps) {
  return (
    <section className="admin-subscriptions-enrollments" aria-label="Pilot enrollments">
      <h2 className="admin-subscriptions-enrollments-title">Pilot enrollments</h2>
      <p className="admin-subscriptions-enrollments-sub">
        Active and historical pilot membership records (demo/internal billing).
      </p>

      {subscriptions.length === 0 ? (
        <p className="admin-subscriptions-loading">No pilot memberships yet.</p>
      ) : (
        <ul className="admin-subscriptions-enrollment-list">
          {subscriptions.map((row) => (
            <li key={row.id} className="admin-subscriptions-enrollment-row">
              <div>
                <p className="admin-subscriptions-enrollment-name">{row.pilotName}</p>
                <p className="admin-subscriptions-enrollment-meta">
                  {row.pilotEmail} · {row.planName} ({row.tierCode}) · ends{" "}
                  {new Date(row.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <SubscriptionStatusBadge status={row.status as SubscriptionStatus} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
