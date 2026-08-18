"use client";

import { useState } from "react";
import {
  INSTRUCTOR_AWARDABLE_WING_CODES,
  INSTRUCTOR_WING_LABELS,
} from "@/lib/instructor/constants";
import type { InstructorWingRequestDto } from "@/lib/instructor/wing-requests";
import { formatMembershipUsd } from "@/lib/membership/pilot-membership-catalog";
import { PILOT_ANNUAL_MEMBERSHIP_FEE_USD } from "@/lib/membership/pilot-membership-catalog";
import { instructorMembershipDiscountUsd } from "@/lib/instructor/constants";

type PilotInstructorStudentSectionProps = {
  instructorName: string | null;
  instructorActive: boolean;
  myRequests: InstructorWingRequestDto[];
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
    } catch {
      setError("Could not apply that code.");
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

      {instructorName ? (
        <p className="pilot-subscription-instructor-price-note">
          Linked instructor: {instructorName}
          {instructorActive ? "" : " (add-on currently inactive)"}
        </p>
      ) : (
        <form onSubmit={(e) => void applyCode(e)} className="pilot-instructor-student-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="INSTRUCTOR-JD20"
            aria-label="Instructor discount code"
            className="pilot-instructor-student-input"
            autoCapitalize="characters"
          />
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

      {error ? (
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
