"use client";

import { AdminVerificationsPanel } from "@/components/admin/AdminVerificationsPanel";

type AdminVerificationPortalProps = {
  pendingCount: number;
};

export function AdminVerificationPortal({ pendingCount }: AdminVerificationPortalProps) {
  return (
    <div className="admin-verifications-page">
      <section
        className="admin-verifications-hero admin-ops-bracket-card"
        aria-label="Pilot verification"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-verifications-hero-copy">
          <p className="admin-ops-eyebrow">REMOTE AVIATOR VERIFICATION</p>
          <h1 className="admin-verifications-hero-title">Pilot Verification</h1>
          <p className="admin-verifications-hero-desc">
            Review officer licenses, insurance, and certification documents before
            they enter the marketplace.
          </p>
        </div>
      </section>

      {pendingCount > 0 ? (
        <p className="admin-verifications-alert" role="status">
          {pendingCount} verification{pendingCount === 1 ? "" : "s"} awaiting review.
        </p>
      ) : null}

      <section
        className="admin-verifications-panel admin-ops-bracket-card"
        aria-label="Verification queue"
      >
        <div className="admin-verifications-panel-head">
          <div>
            <h2 className="admin-verifications-panel-title">VERIFICATION QUEUE</h2>
            <p className="admin-verifications-panel-sub">
              Approve or reject submitted officer documents
            </p>
          </div>
        </div>
        <AdminVerificationsPanel />
      </section>
    </div>
  );
}
