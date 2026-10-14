"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { InstructorDashboardDto } from "@/lib/instructor/dashboard";
import type { InstructorWingRequestDto } from "@/lib/instructor/wing-requests";
import {
  formatMembershipUsd,
  PILOT_INSTRUCTOR_DASHBOARD_BENEFITS,
} from "@/lib/membership/pilot-membership-catalog";

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "ST"
  );
}

function formatRequestDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function statusClass(status: InstructorWingRequestDto["status"]): string {
  return `pilot-instructor-status pilot-instructor-status--${status}`;
}

function statusLabel(status: InstructorWingRequestDto["status"]): string {
  if (status === "needs_info") return "Needs info";
  if (status === "awarded") return "Awarded";
  return "Pending review";
}

export function PilotInstructorDashboard() {
  const [data, setData] = useState<InstructorDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/pilot/instructor");
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load instructor dashboard.");
    }
    setData(json as InstructorDashboardDto);
  }, []);

  useEffect(() => {
    load()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => setLoading(false));
  }, [load]);

  async function handleActivate(active: boolean) {
    setError(null);
    setSuccess(null);
    setActionLoading(active ? "on" : "off");
    try {
      const res = await fetch("/api/pilot/subscription/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to update instructor add-on.");
        return;
      }
      await load();
      setSuccess(
        active
          ? "Instructor add-on activated. Open Students in the sidebar to manage your roster."
          : "Instructor add-on cancelled. Listing and student awards are paused.",
      );
      if (active) {
        // Refresh shell nav so Students appears in the sidebar.
        window.location.assign("/dashboard/pilot/students");
      }
    } catch {
      setError("Failed to update instructor add-on.");
    } finally {
      setActionLoading(null);
    }
  }

  async function copyCode() {
    if (!data?.discountCode) return;
    try {
      await navigator.clipboard.writeText(data.discountCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the code.");
    }
  }

  async function reviewRequest(
    requestId: string,
    action: "award" | "needs_info",
  ) {
    setError(null);
    setSuccess(null);
    setActionLoading(`${action}-${requestId}`);
    try {
      const res = await fetch(`/api/pilot/instructor/wing-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to update request.");
        return;
      }
      await load();
      setSuccess(
        action === "award"
          ? "Wings awarded to the student."
          : "Marked as needs info.",
      );
    } catch {
      setError("Failed to update request.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <p className="pilot-instructor-loading">Loading instructor dashboard…</p>;
  }

  const locked = data?.status === "locked";
  const active = data?.status === "active";

  return (
    <div className="pilot-instructor-page">
      <header className="pilot-instructor-header pilot-instructor-bracket">
        <p className="pilot-instructor-eyebrow">PILOT / INSTRUCTOR</p>
        <h1 className="pilot-instructor-title">Instructor Membership Dashboard</h1>
      </header>

      {error ? (
        <p className="pilot-instructor-banner pilot-instructor-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="pilot-instructor-banner" role="status">
          {success}
        </p>
      ) : null}

      <div className="pilot-instructor-grid">
        <div className="pilot-instructor-col">
          <section
            className="pilot-instructor-card pilot-instructor-card--gold"
            aria-label="Remote Pilot Instructor Membership"
          >
            <h2 className="pilot-instructor-card-title">
              Remote Pilot Instructor Membership
            </h2>

            <div className="pilot-instructor-stats">
              <div className="pilot-instructor-stat">
                <p className="pilot-instructor-stat-value">
                  {formatMembershipUsd(data?.feeUsd ?? 199.99)}
                </p>
                <p className="pilot-instructor-stat-label">Annual add-on</p>
              </div>
              <div className="pilot-instructor-stat">
                <p className="pilot-instructor-stat-value pilot-instructor-stat-value--plain">
                  A-4+
                </p>
                <p className="pilot-instructor-stat-label">Minimum grade required</p>
              </div>
            </div>

            <span
              className={
                locked
                  ? "pilot-instructor-badge pilot-instructor-badge--locked"
                  : active
                    ? "pilot-instructor-badge pilot-instructor-badge--active"
                    : "pilot-instructor-badge"
              }
            >
              {data?.eligibleLabel ?? "ELIGIBLE: A-4 SENIOR FLIGHT OFFICER"}
            </span>

            <ul className="pilot-instructor-benefits">
              {PILOT_INSTRUCTOR_DASHBOARD_BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <img
                    src="/icons/pilot-dashboard/instructor-check.svg"
                    alt=""
                    width={8}
                    height={12}
                  />
                  {benefit}
                </li>
              ))}
              <li>
                <img
                  src="/icons/pilot-dashboard/instructor-check.svg"
                  alt=""
                  width={8}
                  height={12}
                />
                Students appears in the sidebar when this add-on is active
              </li>
            </ul>

            {active ? (
              <>
                <button type="button" className="pilot-instructor-activate" disabled>
                  Instructor add-on active
                </button>
                <button
                  type="button"
                  className="pilot-instructor-cancel"
                  disabled={actionLoading !== null}
                  onClick={() => void handleActivate(false)}
                >
                  {actionLoading === "off" ? "Updating…" : "Cancel instructor add-on"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="pilot-instructor-activate"
                disabled={locked || actionLoading !== null}
                onClick={() => void handleActivate(true)}
              >
                {actionLoading === "on"
                  ? "Activating…"
                  : locked
                    ? "Requires A-4+"
                    : "Activate instructor add-on"}
              </button>
            )}
          </section>

          {active && data?.discountCode ? (
            <section
              className="pilot-instructor-card"
              aria-label="Instructor discount code"
            >
              <h2 className="pilot-instructor-card-title">
                Your Instructor Discount Code
              </h2>
              <p className="pilot-instructor-code-copy">
                Share this code with students to give them 20% off basic membership.
                Anyone who applies it appears automatically on Students.
              </p>
              <div className="pilot-instructor-code-box">
                <span className="pilot-instructor-code-value">{data.discountCode}</span>
                <button
                  type="button"
                  className="pilot-instructor-code-btn"
                  onClick={() => void copyCode()}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          ) : null}
        </div>

        {active ? (
          <section className="pilot-instructor-card" aria-label="How students join">
            <h2 className="pilot-instructor-card-title">How students join</h2>
            <ol className="pilot-instructor-benefits" style={{ listStyle: "decimal" }}>
              <li style={{ display: "list-item" }}>
                Share your instructor code — they link automatically.
              </li>
              <li style={{ display: "list-item" }}>
                Or invite an existing member from Students (they must accept).
              </li>
              <li style={{ display: "list-item" }}>
                Award Silver or Gold Basic Wings from the Students roster.
              </li>
            </ol>
            <Link href="/dashboard/pilot/students" className="pilot-instructor-activate">
              Go to Students
            </Link>
          </section>
        ) : null}
      </div>

      {active ? (
        <section className="pilot-instructor-card" aria-label="Student wing awards">
          <h2 className="pilot-instructor-card-title">Student Wing Requests</h2>
          <p className="pilot-instructor-awards-lead">
            Requests from students. You can also award wings directly from{" "}
            <Link href="/dashboard/pilot/students" className="pilot-instructor-view">
              Students
            </Link>
            .
          </p>

          {!data || data.requests.length === 0 ? (
            <p className="pilot-instructor-empty">
              No student requests yet.
            </p>
          ) : (
            <div className="pilot-instructor-table-wrap">
              <table className="pilot-instructor-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Requested wings</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <span className="pilot-instructor-student">
                          <span className="pilot-instructor-avatar">
                            {request.studentAvatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={request.studentAvatarUrl} alt="" />
                            ) : (
                              initialsFromName(request.studentName)
                            )}
                          </span>
                          {request.studentName}
                        </span>
                      </td>
                      <td>
                        <span className="pilot-instructor-wing">{request.wingLabel}</span>
                      </td>
                      <td>
                        <span className={statusClass(request.status)}>
                          {statusLabel(request.status)}
                        </span>
                        <span className="pilot-instructor-status-date">
                          {formatRequestDate(request.resolvedAt ?? request.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="pilot-instructor-row-actions">
                          {request.status !== "awarded" ? (
                            <>
                              <button
                                type="button"
                                className="pilot-instructor-award"
                                disabled={actionLoading !== null}
                                onClick={() => void reviewRequest(request.id, "award")}
                              >
                                Award
                              </button>
                              <button
                                type="button"
                                className="pilot-instructor-info"
                                disabled={actionLoading !== null}
                                onClick={() =>
                                  void reviewRequest(request.id, "needs_info")
                                }
                              >
                                Needs info
                              </button>
                            </>
                          ) : null}
                          <Link
                            href={request.studentPublicHref}
                            className="pilot-instructor-view"
                          >
                            View profile
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
