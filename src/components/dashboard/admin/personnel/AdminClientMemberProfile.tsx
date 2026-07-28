"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminMemberDetailDto } from "@/lib/admin/member-detail";
import type { ClientPreferredContact } from "@/lib/client/preferences";
import { CLIENT_PROFILE_STATUSES } from "@/types/client";

type ClientDetail = NonNullable<AdminMemberDetailDto["clientDetail"]>;

type AdminClientMemberProfileProps = {
  userId: string;
  client: ClientDetail;
  canEdit: boolean;
  accountStatus: string;
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

export function AdminClientMemberProfile({
  userId,
  client,
  canEdit,
  accountStatus,
}: AdminClientMemberProfileProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accountActing, setAccountActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [contactName, setContactName] = useState(client.contactName);
  const [companyName, setCompanyName] = useState(client.companyName ?? "");
  const [phone, setPhone] = useState(client.phone ?? "");
  const [billingAddress, setBillingAddress] = useState(
    client.billingAddress ?? "",
  );
  const [status, setStatus] = useState(client.status);
  const [roleTitle, setRoleTitle] = useState(
    client.preferences.roleTitle ?? "",
  );
  const [preferredContact, setPreferredContact] =
    useState<ClientPreferredContact>(
      client.preferences.preferredContact ?? "Email",
    );
  const [typicalProjectArea, setTypicalProjectArea] = useState(
    client.preferences.typicalProjectArea ?? "",
  );
  const [defaultBudgetRange, setDefaultBudgetRange] = useState(
    client.preferences.defaultBudgetRange ?? "",
  );
  const [approvalContact, setApprovalContact] = useState(
    client.preferences.approvalContact ?? "",
  );
  const [billingEmail, setBillingEmail] = useState(
    client.preferences.billingEmail ?? "",
  );
  const [projectTypes, setProjectTypes] = useState(
    (client.preferences.projectTypes ?? []).join(", "),
  );

  useEffect(() => {
    setContactName(client.contactName);
    setCompanyName(client.companyName ?? "");
    setPhone(client.phone ?? "");
    setBillingAddress(client.billingAddress ?? "");
    setStatus(client.status);
    setRoleTitle(client.preferences.roleTitle ?? "");
    setPreferredContact(client.preferences.preferredContact ?? "Email");
    setTypicalProjectArea(client.preferences.typicalProjectArea ?? "");
    setDefaultBudgetRange(client.preferences.defaultBudgetRange ?? "");
    setApprovalContact(client.preferences.approvalContact ?? "");
    setBillingEmail(client.preferences.billingEmail ?? "");
    setProjectTypes((client.preferences.projectTypes ?? []).join(", "));
  }, [client]);

  function resetForm() {
    setContactName(client.contactName);
    setCompanyName(client.companyName ?? "");
    setPhone(client.phone ?? "");
    setBillingAddress(client.billingAddress ?? "");
    setStatus(client.status);
    setRoleTitle(client.preferences.roleTitle ?? "");
    setPreferredContact(client.preferences.preferredContact ?? "Email");
    setTypicalProjectArea(client.preferences.typicalProjectArea ?? "");
    setDefaultBudgetRange(client.preferences.defaultBudgetRange ?? "");
    setApprovalContact(client.preferences.approvalContact ?? "");
    setBillingEmail(client.preferences.billingEmail ?? "");
    setProjectTypes((client.preferences.projectTypes ?? []).join(", "));
    setError(null);
    setMessage(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            contactName,
            companyName: companyName.trim() || null,
            phone: phone.trim() || null,
            billingAddress: billingAddress.trim() || null,
            status,
            preferences: {
              roleTitle,
              preferredContact,
              typicalProjectArea,
              defaultBudgetRange,
              approvalContact,
              billingEmail,
              projectTypes: projectTypes
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          },
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Save failed.");
        return;
      }
      setMessage("Client profile saved.");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function setLoginStatus(nextStatus: "active" | "suspended") {
    setAccountActing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Account update failed.");
        return;
      }
      setMessage(
        nextStatus === "suspended"
          ? "Client login suspended."
          : "Client login reactivated.",
      );
      router.refresh();
    } catch {
      setError("Account update failed.");
    } finally {
      setAccountActing(false);
    }
  }

  const prefs = client.preferences;

  return (
    <>
      <section
        className="admin-member-section admin-ops-bracket-card admin-member-command"
        aria-label="Client actions"
      >
        <div className="admin-member-command-head">
          <div>
            <p className="admin-ops-eyebrow">COMMAND</p>
            <h2 className="admin-member-section-title admin-member-section-title--inline">
              Client controls
            </h2>
          </div>
          <div className="admin-pilot-profile-actions-row">
            <span className="admin-member-chip">Profile: {client.status}</span>
            <span className="admin-member-chip">Login: {accountStatus}</span>
          {client.companyName?.trim() ? (
            <span className="admin-member-chip">Enterprise</span>
          ) : (
            <span className="admin-member-chip">Individual</span>
          )}
          {client.status === "draft" ? (
            <span className="admin-member-chip">Onboarding incomplete</span>
          ) : null}
            {client.counts.openDisputes > 0 ? (
              <Link
                href="/dashboard/admin/disputes"
                className="admin-member-chip admin-member-chip--link"
              >
                {client.counts.openDisputes} open dispute
                {client.counts.openDisputes === 1 ? "" : "s"}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="admin-pilot-profile-actions-row">
          {canEdit && !editing ? (
            <button
              type="button"
              className="admin-personnel-edit-save"
              onClick={() => {
                resetForm();
                setEditing(true);
              }}
            >
              Edit client profile
            </button>
          ) : null}
          {canEdit && accountStatus !== "suspended" ? (
            <button
              type="button"
              className="admin-personnel-btn-outline"
              disabled={accountActing}
              onClick={() => void setLoginStatus("suspended")}
            >
              Suspend login
            </button>
          ) : null}
          {canEdit && accountStatus === "suspended" ? (
            <button
              type="button"
              className="admin-personnel-edit-save"
              disabled={accountActing}
              onClick={() => void setLoginStatus("active")}
            >
              Reactivate login
            </button>
          ) : null}
          <Link
            href="/dashboard/admin/jobs"
            className="admin-personnel-action"
          >
            Jobs queue
          </Link>
          <Link
            href="/dashboard/admin/bookings"
            className="admin-personnel-action"
          >
            Bookings
          </Link>
          <Link
            href="/dashboard/admin/disputes"
            className="admin-personnel-action"
          >
            Disputes
          </Link>
          <Link
            href="/dashboard/admin/messages"
            className="admin-personnel-action"
          >
            Messages
          </Link>
          <Link
            href="/dashboard/admin/payments"
            className="admin-personnel-action"
          >
            Payments
          </Link>
        </div>

        {error ? (
          <p className="admin-personnel-edit-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="admin-pilot-profile-message" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section
        className="admin-member-stats-row"
        aria-label="Client activity"
      >
        {[
          ["Jobs posted", client.counts.jobs],
          ["Bookings", client.counts.bookings],
          ["Messages", client.counts.conversations],
          ["Open disputes", client.counts.openDisputes],
          ["Reviews", client.counts.reviews],
        ].map(([label, value]) => (
          <article
            key={label as string}
            className="admin-member-stat admin-ops-bracket-card"
          >
            <span className="admin-member-stat-accent" aria-hidden />
            <p className="admin-member-stat-label">{label}</p>
            <p className="admin-member-stat-value">{value}</p>
          </article>
        ))}
      </section>

      {editing ? (
        <section className="admin-member-section admin-ops-bracket-card">
          <h2 className="admin-member-section-title">Edit client profile</h2>
          <form className="admin-pilot-profile-form" onSubmit={handleSave}>
            <div className="admin-pilot-profile-form-grid">
              <label className="admin-personnel-edit-field">
                <span>Contact name</span>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Company</span>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Profile status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                >
                  {CLIENT_PROFILE_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-personnel-edit-field">
                <span>Role / title</span>
                <input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Preferred contact</span>
                <select
                  value={preferredContact}
                  onChange={(e) =>
                    setPreferredContact(e.target.value as ClientPreferredContact)
                  }
                  disabled={saving}
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Messages">Messages</option>
                </select>
              </label>
              <label className="admin-personnel-edit-field">
                <span>Typical project area</span>
                <input
                  value={typicalProjectArea}
                  onChange={(e) => setTypicalProjectArea(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Default budget range</span>
                <input
                  value={defaultBudgetRange}
                  onChange={(e) => setDefaultBudgetRange(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Approval contact</span>
                <input
                  value={approvalContact}
                  onChange={(e) => setApprovalContact(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Billing email</span>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Project types (comma-separated)</span>
                <input
                  value={projectTypes}
                  onChange={(e) => setProjectTypes(e.target.value)}
                  disabled={saving}
                />
              </label>
            </div>
            <label className="admin-personnel-edit-field admin-pilot-profile-bio">
              <span>Billing address</span>
              <textarea
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                rows={3}
                disabled={saving}
              />
            </label>
            <footer className="admin-pilot-profile-form-foot">
              <button
                type="button"
                className="admin-personnel-action"
                onClick={() => {
                  resetForm();
                  setEditing(false);
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-personnel-edit-save"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save client profile"}
              </button>
            </footer>
          </form>
        </section>
      ) : (
        <>
          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Client profile</h2>
            <dl className="admin-member-grid">
              <Field label="Contact" value={client.contactName} />
              <Field label="Company" value={client.companyName} />
              <Field label="Phone" value={client.phone} />
              <Field label="Status" value={client.status} />
              <Field label="Billing address" value={client.billingAddress} />
              <Field
                label="Onboarding"
                value={formatDate(client.onboardingCompletedAt)}
              />
            </dl>
          </section>

          <section className="admin-member-section admin-ops-bracket-card">
            <h2 className="admin-member-section-title">Preferences</h2>
            <dl className="admin-member-grid">
              <Field label="Role / title" value={prefs.roleTitle} />
              <Field label="Preferred contact" value={prefs.preferredContact} />
              <Field
                label="Typical project area"
                value={prefs.typicalProjectArea}
              />
              <Field
                label="Default budget"
                value={prefs.defaultBudgetRange}
              />
              <Field label="Approval contact" value={prefs.approvalContact} />
              <Field label="Billing email" value={prefs.billingEmail} />
              <Field
                label="Project types"
                value={
                  prefs.projectTypes?.length
                    ? prefs.projectTypes.join(", ")
                    : null
                }
              />
            </dl>
          </section>
        </>
      )}

      <section className="admin-member-section admin-ops-bracket-card">
        <div className="admin-member-section-head">
          <h2 className="admin-member-section-title admin-member-section-title--inline">
            Recent jobs
          </h2>
          <Link href="/dashboard/admin/jobs" className="admin-personnel-action">
            View all
          </Link>
        </div>
        {client.recentJobs.length ? (
          <ul className="admin-member-list">
            {client.recentJobs.map((job) => (
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

      <section className="admin-member-section admin-ops-bracket-card">
        <div className="admin-member-section-head">
          <h2 className="admin-member-section-title admin-member-section-title--inline">
            Recent bookings
          </h2>
          <Link
            href="/dashboard/admin/bookings"
            className="admin-personnel-action"
          >
            View all
          </Link>
        </div>
        {client.recentBookings.length ? (
          <ul className="admin-member-list">
            {client.recentBookings.map((booking) => (
              <li key={booking.id}>
                <Link href={`/dashboard/admin/bookings`}>
                  <strong>{booking.jobTitle}</strong>
                </Link>
                <span>
                  {booking.status} · {booking.pilotName} · {booking.currency}{" "}
                  {booking.agreedAmount.toLocaleString()}
                  {booking.paymentStatus
                    ? ` · payment ${booking.paymentStatus}`
                    : ""}{" "}
                  · {formatDate(booking.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-member-empty">No bookings yet.</p>
        )}
      </section>

      <section className="admin-member-section admin-ops-bracket-card">
        <div className="admin-member-section-head">
          <h2 className="admin-member-section-title admin-member-section-title--inline">
            Disputes
          </h2>
          <Link
            href="/dashboard/admin/disputes"
            className="admin-personnel-action"
          >
            Dispute center
          </Link>
        </div>
        {client.recentDisputes.length ? (
          <ul className="admin-member-list">
            {client.recentDisputes.map((dispute) => (
              <li key={dispute.id}>
                <Link href={`/dashboard/admin/disputes/${dispute.id}`}>
                  <strong>{dispute.jobTitle}</strong>
                </Link>
                <span>
                  {dispute.status} · {dispute.reason} ·{" "}
                  {formatDate(dispute.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-member-empty">No disputes for this client.</p>
        )}
      </section>

      <section className="admin-member-section admin-ops-bracket-card">
        <div className="admin-member-section-head">
          <h2 className="admin-member-section-title admin-member-section-title--inline">
            Messages
          </h2>
          <Link
            href="/dashboard/admin/messages"
            className="admin-personnel-action"
          >
            Message tracking
          </Link>
        </div>
        {client.recentConversations.length ? (
          <ul className="admin-member-list">
            {client.recentConversations.map((conversation) => (
              <li key={conversation.id}>
                <Link href={`/dashboard/admin/messages/${conversation.id}`}>
                  <strong>{conversation.jobTitle}</strong>
                </Link>
                <span>
                  with {conversation.pilotName} · last message{" "}
                  {formatDate(conversation.lastMessageAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-member-empty">No conversations yet.</p>
        )}
      </section>

      <section className="admin-member-section admin-ops-bracket-card">
        <h2 className="admin-member-section-title">Reviews received</h2>
        {client.recentReviews.length ? (
          <ul className="admin-member-list">
            {client.recentReviews.map((review) => (
              <li key={review.id}>
                <strong>
                  {review.rating}/5 · {review.status}
                </strong>
                <span>
                  {review.comment?.trim() || "No comment"} ·{" "}
                  {formatDate(review.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-member-empty">No reviews yet.</p>
        )}
      </section>
    </>
  );
}
