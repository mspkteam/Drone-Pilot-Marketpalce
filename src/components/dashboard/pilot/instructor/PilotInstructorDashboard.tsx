"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  INSTRUCTOR_AWARDABLE_WING_CODES,
  INSTRUCTOR_WING_LABELS,
} from "@/lib/instructor/constants";
import type { InstructorDashboardDto } from "@/lib/instructor/dashboard";
import type { InstructorStudentDto } from "@/lib/instructor/students";
import type { InstructorWingRequestDto } from "@/lib/instructor/wing-requests";
import {
  formatMembershipUsd,
  PILOT_INSTRUCTOR_DASHBOARD_BENEFITS,
} from "@/lib/membership/pilot-membership-catalog";

type TabId = "overview" | "students" | "awards";

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
  const [tab, setTab] = useState<TabId>("overview");
  const [inviteQuery, setInviteQuery] = useState("");
  const [awardWingByStudent, setAwardWingByStudent] = useState<
    Record<string, string>
  >({});

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

  useEffect(() => {
    if (data?.status === "active" && tab === "overview") {
      // After activation, prefer Students so the unlocked tab is obvious.
    }
  }, [data?.status, tab]);

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
      if (active) {
        setTab("students");
        setSuccess(
          "Instructor add-on activated. Your Students tab is unlocked — share your code or invite members.",
        );
      } else {
        setTab("overview");
        setSuccess(
          "Instructor add-on cancelled. Listing and student awards are paused.",
        );
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

  async function inviteStudent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setActionLoading("invite");
    try {
      const res = await fetch("/api/pilot/instructor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inviteQuery }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to send invite.");
        return;
      }
      setInviteQuery("");
      await load();
      setSuccess(
        `Invite sent to ${json.invite?.inviteeName ?? "pilot"}. They must accept before joining your roster.`,
      );
    } catch {
      setError("Failed to send invite.");
    } finally {
      setActionLoading(null);
    }
  }

  async function awardDirect(student: InstructorStudentDto) {
    const wingCode =
      awardWingByStudent[student.profileId] ??
      INSTRUCTOR_AWARDABLE_WING_CODES[0];
    setError(null);
    setSuccess(null);
    setActionLoading(`award-${student.profileId}`);
    try {
      const res = await fetch("/api/pilot/instructor/students/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: student.profileId,
          wingCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to award wings.");
        return;
      }
      await load();
      setSuccess(`${json.wingLabel} awarded to ${student.displayName}.`);
    } catch {
      setError("Failed to award wings.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <p className="pilot-instructor-loading">Loading instructor dashboard…</p>;
  }

  const locked = data?.status === "locked";
  const active = data?.status === "active";
  const students = data?.students ?? [];
  const outgoingInvites = data?.outgoingInvites ?? [];
  const pendingOutgoing = outgoingInvites.filter((i) => i.status === "pending");

  return (
    <div className="pilot-instructor-page">
      <header className="pilot-instructor-header pilot-instructor-bracket">
        <p className="pilot-instructor-eyebrow">PILOT / INSTRUCTOR</p>
        <h1 className="pilot-instructor-title">Instructor Membership Dashboard</h1>
        {active ? (
          <nav className="pilot-instructor-tabs" aria-label="Instructor sections">
            {(
              [
                ["overview", "Overview"],
                ["students", `Students (${students.length})`],
                ["awards", "Wing requests"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={
                  tab === id
                    ? "pilot-instructor-tab pilot-instructor-tab--active"
                    : "pilot-instructor-tab"
                }
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        ) : null}
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

      {tab === "overview" || !active ? (
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
                  Students tab: roster, invites, and wing awards
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
                  Anyone who applies it appears automatically on your Students tab.
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
                <p className="pilot-instructor-code-hint">
                  <img
                    src="/icons/pilot-dashboard/instructor-clock.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                  Students can use this code at checkout or on Membership.
                </p>
              </section>
            ) : null}
          </div>

          <section className="pilot-instructor-card" aria-label="Quick tip">
            <h2 className="pilot-instructor-card-title">How students join</h2>
            <ol className="pilot-instructor-benefits" style={{ listStyle: "decimal" }}>
              <li style={{ display: "list-item" }}>
                Share your instructor code — they link automatically.
              </li>
              <li style={{ display: "list-item" }}>
                Or invite an existing member from the Students tab (they must accept).
              </li>
              <li style={{ display: "list-item" }}>
                Award Silver or Gold Basic Wings from the roster or wing requests.
              </li>
            </ol>
            {active ? (
              <button
                type="button"
                className="pilot-instructor-activate"
                onClick={() => setTab("students")}
              >
                Open Students tab
              </button>
            ) : (
              <p className="pilot-instructor-empty">
                Activate Instructor Membership to unlock the Students tab.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {active && tab === "students" ? (
        <div className="pilot-instructor-grid">
          <section className="pilot-instructor-card" aria-label="Invite student">
            <h2 className="pilot-instructor-card-title">Invite existing member</h2>
            <p className="pilot-instructor-code-copy">
              Search by email or member number. They must accept before appearing on
              your roster.
            </p>
            <form
              onSubmit={(e) => void inviteStudent(e)}
              className="pilot-instructor-invite-form"
            >
              <input
                className="pilot-instructor-invite-input"
                value={inviteQuery}
                onChange={(e) => setInviteQuery(e.target.value)}
                placeholder="pilot@email.com or member number"
                required
              />
              <button
                type="submit"
                className="pilot-instructor-award"
                disabled={actionLoading !== null || !inviteQuery.trim()}
              >
                {actionLoading === "invite" ? "Sending…" : "Send invite"}
              </button>
            </form>
            {pendingOutgoing.length > 0 ? (
              <div className="pilot-instructor-pending-list">
                <p className="pilot-instructor-awards-lead">
                  Pending invites ({pendingOutgoing.length})
                </p>
                <ul>
                  {pendingOutgoing.map((inv) => (
                    <li key={inv.id}>
                      {inv.inviteeName} · {inv.inviteeEmail}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="pilot-instructor-card" aria-label="Student roster">
            <h2 className="pilot-instructor-card-title">
              Your students ({students.length})
            </h2>
            <p className="pilot-instructor-awards-lead">
              Linked via instructor code or accepted invite. Award wings from here.
            </p>

            {students.length === 0 ? (
              <p className="pilot-instructor-empty">
                No students yet. Share your discount code or invite a member above.
              </p>
            ) : (
              <div className="pilot-instructor-table-wrap">
                <table className="pilot-instructor-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Linked</th>
                      <th>Award wings</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.profileId}>
                        <td>
                          <span className="pilot-instructor-student">
                            <span className="pilot-instructor-avatar">
                              {student.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={student.avatarUrl} alt="" />
                              ) : (
                                initialsFromName(student.displayName)
                              )}
                            </span>
                            <span>
                              {student.displayName}
                              <span className="pilot-instructor-status-date">
                                {student.email}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td>
                          {student.linkedVia === "invite" ? "Invite" : "Code"}
                        </td>
                        <td>
                          <div className="pilot-instructor-row-actions">
                            <select
                              className="pilot-instructor-wing-select"
                              value={
                                awardWingByStudent[student.profileId] ??
                                INSTRUCTOR_AWARDABLE_WING_CODES[0]
                              }
                              onChange={(e) =>
                                setAwardWingByStudent((prev) => ({
                                  ...prev,
                                  [student.profileId]: e.target.value,
                                }))
                              }
                            >
                              {INSTRUCTOR_AWARDABLE_WING_CODES.map((code) => (
                                <option key={code} value={code}>
                                  {INSTRUCTOR_WING_LABELS[code]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="pilot-instructor-award"
                              disabled={actionLoading !== null}
                              onClick={() => void awardDirect(student)}
                            >
                              {actionLoading === `award-${student.profileId}`
                                ? "…"
                                : "Award"}
                            </button>
                          </div>
                        </td>
                        <td>
                          <Link
                            href={student.publicHref}
                            className="pilot-instructor-view"
                          >
                            View profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pilot-instructor-note">
              <span className="pilot-instructor-note-icon" aria-hidden>
                i
              </span>
              <p>
                Instructors can only award Silver Pilot Wings or Gold Basic Wings.
                <br />
                Rank promotions (A-x grades) are managed by the system / admin.
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {active && tab === "awards" ? (
        <section className="pilot-instructor-card" aria-label="Student wing awards">
          <h2 className="pilot-instructor-card-title">Student Wing Awards</h2>
          <p className="pilot-instructor-awards-lead">
            Requests from students. You can also award directly from the Students tab.
          </p>

          {!data || data.requests.length === 0 ? (
            <p className="pilot-instructor-empty">
              No student requests yet. Students on your roster can request Silver Pilot
              Wings or Gold Basic Wings, or you can award them from Students.
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
