"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  INSTRUCTOR_AWARDABLE_WING_CODES,
  INSTRUCTOR_WING_LABELS,
} from "@/lib/instructor/constants";
import type {
  InstructorStudentDto,
  InstructorStudentInviteDto,
} from "@/lib/instructor/students";

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

export function PilotInstructorStudentsView() {
  const [students, setStudents] = useState<InstructorStudentDto[]>([]);
  const [invites, setInvites] = useState<InstructorStudentInviteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState("");
  const [awardWingByStudent, setAwardWingByStudent] = useState<
    Record<string, string>
  >({});

  const load = useCallback(async () => {
    const res = await fetch("/api/pilot/instructor/students");
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load students.");
    }
    setStudents(json.students ?? []);
    setInvites(json.invites ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => setLoading(false));
  }, [load]);

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
    return <p className="pilot-instructor-loading">Loading students…</p>;
  }

  const pendingOutgoing = invites.filter((i) => i.status === "pending");

  return (
    <div className="pilot-instructor-page">
      <header className="pilot-instructor-header pilot-instructor-bracket">
        <p className="pilot-instructor-eyebrow">PILOT / STUDENTS</p>
        <h1 className="pilot-instructor-title">Students</h1>
        <p className="pilot-instructor-code-copy" style={{ marginTop: "0.75rem" }}>
          Roster of pilots linked by your instructor code or an accepted invite.
          Award Silver or Gold Basic Wings from here.
        </p>
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
            Linked via instructor code or accepted invite.
          </p>

          {students.length === 0 ? (
            <p className="pilot-instructor-empty">
              No students yet. Share your discount code on Instructor, or invite a
              member above.
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
    </div>
  );
}
