"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminPersonnelEditModal } from "@/components/dashboard/admin/personnel/AdminPersonnelEditModal";
import type { AdminMemberDetailDto } from "@/lib/admin/member-detail";

type AdminMemberDetailViewProps = {
  member: AdminMemberDetailDto;
  canEdit: boolean;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="admin-member-field">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export function AdminMemberDetailView({
  member,
  canEdit,
}: AdminMemberDetailViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const { account, pilotDetail, clientDetail } = member;

  return (
    <div className="admin-member-detail">
      <div className="admin-member-detail-nav">
        <Link href="/dashboard/admin/users" className="admin-personnel-action">
          ← Back to directory
        </Link>
        {canEdit ? (
          <button
            type="button"
            className="admin-personnel-edit-save"
            onClick={() => setEditOpen(true)}
          >
            Edit account
          </button>
        ) : null}
      </div>

      <header className="admin-member-detail-hero admin-ops-bracket-card">
        <div className="admin-ops-hero-glow" aria-hidden />
        <p className="admin-ops-eyebrow">{member.roleLabel.toUpperCase()}</p>
        <h1 className="admin-member-detail-title">{member.displayName}</h1>
        <p className="admin-member-detail-sub">{account.email}</p>
        <div className="admin-member-detail-badges">
          <span className="admin-member-chip">Login: {account.status}</span>
          {pilotDetail ? (
            <span className="admin-member-chip">
              Profile: {pilotDetail.status}
            </span>
          ) : null}
          {clientDetail ? (
            <span className="admin-member-chip">
              Client: {clientDetail.status}
            </span>
          ) : null}
          <span className="admin-member-chip">
            Joined {formatDate(account.createdAt)}
          </span>
        </div>
        {account.moderationNote ? (
          <p className="admin-member-moderation" role="note">
            Moderation note: {account.moderationNote}
          </p>
        ) : null}
      </header>

      {pilotDetail ? (
        <>
          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Pilot profile</h2>
            <dl className="admin-member-grid">
              <Field label="Display name" value={pilotDetail.displayName} />
              <Field label="License #" value={pilotDetail.licenseNumber} />
              <Field
                label="License country"
                value={pilotDetail.licenseCountry}
              />
              <Field
                label="Public listing"
                value={pilotDetail.isPublic ? "Yes" : "No"}
              />
              <Field
                label="Location"
                value={[
                  pilotDetail.locationCity,
                  pilotDetail.locationRegion,
                  pilotDetail.locationCountry,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Field
                label="Service radius"
                value={
                  pilotDetail.serviceRadiusKm != null
                    ? `${pilotDetail.serviceRadiusKm} km`
                    : null
                }
              />
              <Field
                label="Hourly rate"
                value={
                  pilotDetail.hourlyRateMin != null ||
                  pilotDetail.hourlyRateMax != null
                    ? `$${pilotDetail.hourlyRateMin ?? "—"} – $${pilotDetail.hourlyRateMax ?? "—"}`
                    : null
                }
              />
              <Field
                label="Onboarding"
                value={formatDate(pilotDetail.onboardingCompletedAt)}
              />
            </dl>
            {pilotDetail.bio ? (
              <p className="admin-member-bio">{pilotDetail.bio}</p>
            ) : null}
            {pilotDetail.isPublic ? (
              <Link
                href={`/pilots/${pilotDetail.profileId}`}
                className="admin-personnel-action"
                target="_blank"
                rel="noreferrer"
              >
                Open public profile ↗
              </Link>
            ) : null}
          </section>

          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Membership</h2>
            {pilotDetail.membership ? (
              <dl className="admin-member-grid">
                <Field
                  label="Grade"
                  value={`${pilotDetail.membership.tierName} (${pilotDetail.membership.tierCode})`}
                />
                <Field
                  label="Subscription"
                  value={pilotDetail.membership.status}
                />
                <Field
                  label="Can bid"
                  value={pilotDetail.membership.canApply ? "Yes" : "No"}
                />
                <Field
                  label="Instructor"
                  value={
                    pilotDetail.membership.instructorEligible ? "Eligible" : "No"
                  }
                />
                <Field
                  label="Job visibility delay"
                  value={`${pilotDetail.membership.jobVisibilityDelayHours}h`}
                />
                <Field
                  label="Period ends"
                  value={formatDate(pilotDetail.membership.periodEnd)}
                />
              </dl>
            ) : (
              <p className="admin-member-empty">No active membership.</p>
            )}
          </section>

          <section className="admin-member-stats-row" aria-label="Pilot activity">
            {[
              ["Applications", pilotDetail.counts.applications],
              ["Bookings", pilotDetail.counts.bookings],
              ["Certificates", pilotDetail.counts.certificates],
              ["Reviews", pilotDetail.counts.reviews],
            ].map(([label, value]) => (
              <article key={label as string} className="admin-member-stat">
                <p className="admin-member-stat-value">{value}</p>
                <p className="admin-member-stat-label">{label}</p>
              </article>
            ))}
          </section>

          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Wings</h2>
            {pilotDetail.wings.length ? (
              <ul className="admin-member-list">
                {pilotDetail.wings.map((wing) => (
                  <li key={wing.id}>
                    <strong>{wing.title}</strong>
                    <span>
                      {wing.code} · {formatDate(wing.earnedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-member-empty">No wings awarded yet.</p>
            )}
          </section>

          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Recent proposals</h2>
            {pilotDetail.recentApplications.length ? (
              <ul className="admin-member-list">
                {pilotDetail.recentApplications.map((app) => (
                  <li key={app.id}>
                    <strong>{app.jobTitle}</strong>
                    <span>
                      {app.status} · {app.currency}{" "}
                      {app.proposedAmount.toLocaleString()} ·{" "}
                      {formatDate(app.submittedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-member-empty">No proposals yet.</p>
            )}
          </section>
        </>
      ) : null}

      {clientDetail ? (
        <>
          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Client profile</h2>
            <dl className="admin-member-grid">
              <Field label="Contact" value={clientDetail.contactName} />
              <Field label="Company" value={clientDetail.companyName} />
              <Field label="Phone" value={clientDetail.phone} />
              <Field label="Status" value={clientDetail.status} />
              <Field
                label="Billing address"
                value={clientDetail.billingAddress}
              />
              <Field
                label="Onboarding"
                value={formatDate(clientDetail.onboardingCompletedAt)}
              />
            </dl>
          </section>

          <section className="admin-member-stats-row" aria-label="Client activity">
            {[
              ["Jobs posted", clientDetail.counts.jobs],
              ["Bookings", clientDetail.counts.bookings],
              ["Reviews", clientDetail.counts.reviews],
            ].map(([label, value]) => (
              <article key={label as string} className="admin-member-stat">
                <p className="admin-member-stat-value">{value}</p>
                <p className="admin-member-stat-label">{label}</p>
              </article>
            ))}
          </section>

          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Recent jobs</h2>
            {clientDetail.recentJobs.length ? (
              <ul className="admin-member-list">
                {clientDetail.recentJobs.map((job) => (
                  <li key={job.id}>
                    <Link href={`/dashboard/admin/jobs/${job.id}`}>
                      <strong>{job.title}</strong>
                    </Link>
                    <span>
                      {job.status} · {job.locationLabel} ·{" "}
                      {formatDate(job.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-member-empty">No jobs posted yet.</p>
            )}
          </section>
        </>
      ) : null}

      {!pilotDetail && !clientDetail ? (
        <p className="admin-member-empty">
          This account has no pilot or client profile yet.
        </p>
      ) : null}

      <AdminPersonnelEditModal
        open={editOpen}
        userId={account.id}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
