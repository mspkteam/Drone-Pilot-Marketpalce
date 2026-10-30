"use client";

import { useState } from "react";
import {
  INSTRUCTOR_AWARDABLE_WING_CODES,
  INSTRUCTOR_WING_LABELS,
  instructorMembershipDiscountUsd,
} from "@/lib/instructor/constants";
import type { InstructorStudentInviteDto } from "@/lib/instructor/students";
import type { InstructorWingRequestDto } from "@/lib/instructor/wing-requests";
import {
  formatMembershipUsd,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";

type PilotInstructorStudentSectionProps = {
  instructorName: string | null;
  instructorActive: boolean;
  myRequests: InstructorWingRequestDto[];
  pendingInvites?: InstructorStudentInviteDto[];
  onLinked: (payload: {
    instructorName: string;
    discountUsd: number;
    membershipDueUsd: number;
  }) => void;
  onChanged?: () => void;
};

export function PilotInstructorStudentSection({
  instructorName,
  instructorActive,
  myRequests,
  pendingInvites = [],
  onLinked,
  onChanged,
}: PilotInstructorStudentSectionProps) {
  const [code, setCode] = useState("");
  const [wingCode, setWingCode] = useState<(typeof INSTRUCTOR_AWARDABLE_WING_CODES)[number]>(
    "aviator-wings-basic-silver",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const discountUsd = instructorMembershipDiscountUsd(
    PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  );

  async function applyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading("code");
    try {
      const res = await fetch("/api/pilot/instructor/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not apply that code.");
        return;
      }
      onLinked({
        instructorName: data.instructorName,
        discountUsd: data.discountUsd,
        membershipDueUsd: data.membershipDueUsd,
      });
      setSuccess(
        `Linked to ${data.instructorName}. Basic membership is ${formatMembershipUsd(data.membershipDueUsd)} (${formatMembershipUsd(data.discountUsd)} off).`,
      );
      onChanged?.();
    } catch {
      setError("Could not apply that code.");
    } finally {
      setLoading(null);
    }
  }

  async function respondInvite(inviteId: string, action: "accept" | "decline") {
    setError(null);
    setSuccess(null);
    setLoading(`${action}-${inviteId}`);
    try {
      const res = await fetch("/api/pilot/instructor/invites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update invite.");
        return;
      }
      if (action === "accept") {
        const due = PILOT_ANNUAL_MEMBERSHIP_FEE_USD - discountUsd;
        onLinked({
          instructorName: data.invite.instructorName,
          discountUsd,
          membershipDueUsd: due,
        });
        setSuccess(`You are now linked to ${data.invite.instructorName}.`);
      } else {
        setSuccess("Invite declined.");
      }
      onChanged?.();
    } catch {
      setError("Could not update invite.");
    } finally {
      setLoading(null);
    }
  }

  async function requestWings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading("wings");
    try {
      const res = await fetch("/api/pilot/instructor/wing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wingCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit wing request.");
        return;
      }
      setSuccess(`Requested ${INSTRUCTOR_WING_LABELS[wingCode]}.`);
      onChanged?.();
    } catch {
      setError("Could not submit wing request.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section
      id="instructor-invites"
      className="pilot-subscription-instructor-student pilot-subscription-bracket-card"
      aria-label="Instructor student benefits"
    >
      <h2 className="pilot-subscription-instructor-title">
        Instructor student code
      </h2>
      <p className="pilot-subscription-instructor-eligibility">
        Students receive 20% off the {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}{" "}
        basic membership only ({formatMembershipUsd(discountUsd)} off). Fast Forward
        upgrades are not discounted.
      </p>

      {pendingInvites.length > 0 ? (
        <div className="pilot-subscription-instructor-invites">
          <p className="pilot-subscription-instructor-price-note">
            Instructor invites awaiting your response
          </p>
          <ul className="pilot-subscription-instructor-benefits">
            {pendingInvites.map((invite) => (
              <li key={invite.id}>
                <span>
                  {invite.instructorName} invited you to join as their student.
                </span>
                <span className="pilot-instructor-row-actions" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="pilot-subscription-plan-btn pilot-subscription-plan-btn--select"
                    disabled={loading !== null}
                    onClick={() => void respondInvite(invite.id, "accept")}
                  >
                    {loading === `accept-${invite.id}` ? "…" : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="pilot-subscription-btn-outline"
                    disabled={loading !== null}
                    onClick={() => void respondInvite(invite.id, "decline")}
                  >
                    {loading === `decline-${invite.id}` ? "…" : "Decline"}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {instructorName ? (
        <p className="pilot-subscription-instructor-price-note">
          Linked instructor: {instructorName}
          {instructorActive ? "" : " (add-on currently inactive)"}
        </p>
      ) : (
        <form onSubmit={(e) => void applyCode(e)} className="pilot-instructor-student-form">
          <div className="pilot-instructor-student-code-field">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="INSTRUCTOR-JD20"
              aria-label="Instructor discount code"
              aria-invalid={Boolean(error)}
              className="pilot-instructor-student-input"
              autoCapitalize="characters"
            />
            {error ? (
              <p className="pilot-instructor-student-field-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="pilot-subscription-instructor-price-note">
                Apply a student code for{" "}
                {formatMembershipUsd(discountUsd)} off basic membership (
                {formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD - discountUsd)}{" "}
                due).
              </p>
            )}
          </div>
          <button
            type="submit"
            className="pilot-subscription-btn-outline"
            disabled={loading !== null || !code.trim()}
          >
            {loading === "code" ? "Applying…" : "Apply code"}
          </button>
        </form>
      )}

      {instructorName && instructorActive ? (
        <form onSubmit={(e) => void requestWings(e)} className="pilot-instructor-student-form">
          <label className="pilot-subscription-instructor-price-label">
            Request wings
            <select
              value={wingCode}
              onChange={(e) =>
                setWingCode(
                  e.target.value as (typeof INSTRUCTOR_AWARDABLE_WING_CODES)[number],
                )
              }
              className="pilot-instructor-student-input"
            >
              {INSTRUCTOR_AWARDABLE_WING_CODES.map((codeOption) => (
                <option key={codeOption} value={codeOption}>
                  {INSTRUCTOR_WING_LABELS[codeOption]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="pilot-subscription-plan-btn pilot-subscription-plan-btn--select"
            disabled={loading !== null}
          >
            {loading === "wings" ? "Submitting…" : "Request wings"}
          </button>
        </form>
      ) : null}

      {myRequests.length > 0 ? (
        <ul className="pilot-subscription-instructor-benefits">
          {myRequests.map((request) => (
            <li key={request.id}>
              {request.wingLabel} — {request.status.replace("_", " ")}
            </li>
          ))}
        </ul>
      ) : null}

      {error && instructorName ? (
        <p className="pilot-subscription-banner pilot-subscription-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="pilot-subscription-banner" role="status">
          {success}
        </p>
      ) : null}
    </section>
  );
}
