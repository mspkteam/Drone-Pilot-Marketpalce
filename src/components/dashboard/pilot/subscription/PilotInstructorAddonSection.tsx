"use client";

import Link from "next/link";
import {
  formatMembershipUsd,
  PILOT_INSTRUCTOR_ADDON_BENEFITS,
  PILOT_INSTRUCTOR_ADDON_FEE_USD,
} from "@/lib/membership/pilot-membership-catalog";
import type { InstructorAddonStatus } from "@/lib/membership/instructor-addon";
import { cn } from "@/lib/utils";

export type InstructorProfilePreview = {
  displayName: string;
  bio: string | null;
  flightSchool: string | null;
  trainingLocation: string | null;
  averageRating: number | null;
};

type PilotInstructorAddonSectionProps = {
  status: InstructorAddonStatus;
  preview: InstructorProfilePreview;
  periodEnd: string | null;
  actionLoading: boolean;
  onActivate: () => void;
  onCancel: () => void;
};

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "PI"
  );
}

function displayOrFallback(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function PilotInstructorAddonSection({
  status,
  preview,
  periodEnd,
  actionLoading,
  onActivate,
  onCancel,
}: PilotInstructorAddonSectionProps) {
  const locked = status === "locked";
  const active = status === "active";
  const displayName = displayOrFallback(preview.displayName, "Pilot");
  const bio = displayOrFallback(
    preview.bio,
    "Add a bio on your profile to preview instructor listing copy.",
  );
  const flightSchool = displayOrFallback(preview.flightSchool, "Not set");
  const trainingLocation = displayOrFallback(
    preview.trainingLocation,
    "Add location on your profile",
  );

  return (
    <section
      className="pilot-subscription-instructor pilot-subscription-bracket-card"
      aria-label="Remote Pilot Instructor upgrade"
    >
      <div className="pilot-subscription-instructor-main">
        <h2 className="pilot-subscription-instructor-title">
          Remote Pilot <span>Instructor Upgrade</span>
        </h2>
        <p className="pilot-subscription-instructor-eligibility">
          Only A-4 and above may upgrade to Instructor Membership.
        </p>

        <div className="pilot-subscription-instructor-price">
          <div className="pilot-subscription-instructor-price-row">
            <p className="pilot-subscription-instructor-price-label">
              Annual add-on
            </p>
            <p className="pilot-subscription-instructor-price-value">
              {formatMembershipUsd(PILOT_INSTRUCTOR_ADDON_FEE_USD)}{" "}
              <span>/ year</span>
            </p>
          </div>
          <p className="pilot-subscription-instructor-price-note">
            Unlocked at A-4 Senior Flight Officer
          </p>
          <div
            className={cn(
              "pilot-subscription-instructor-progress",
              locked && "pilot-subscription-instructor-progress--locked",
              active && "pilot-subscription-instructor-progress--active",
            )}
            role="status"
          >
            {locked
              ? "Locked Until A-4"
              : active
                ? "Instructor membership active"
                : "Eligible — add Instructor to your membership"}
          </div>
          <p className="pilot-subscription-instructor-price-foot">
            {locked
              ? "Reach Senior Flight Officer to unlock instructor clearance."
              : active
                ? periodEnd
                  ? `Renews ${new Date(periodEnd).toLocaleDateString()}`
                  : "Instructor add-on active (demo)"
                : "You meet the grade requirement for Instructor Membership."}
          </p>
        </div>

        <ul className="pilot-subscription-instructor-benefits">
          {PILOT_INSTRUCTOR_ADDON_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

        {active ? (
          <div className="pilot-subscription-instructor-actions">
            <button
              type="button"
              className="pilot-subscription-btn-outline"
              disabled={actionLoading}
              onClick={onCancel}
            >
              {actionLoading ? "Updating…" : "Cancel instructor add-on"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="pilot-subscription-plan-btn pilot-subscription-plan-btn--select"
            disabled={locked || actionLoading}
            onClick={onActivate}
          >
            {actionLoading
              ? "Processing…"
              : locked
                ? "Requires A-4+"
                : `Add Instructor — ${formatMembershipUsd(PILOT_INSTRUCTOR_ADDON_FEE_USD)}/year`}
          </button>
        )}

        <Link
          href="/dashboard/pilot/instructor"
          className="pilot-subscription-btn-outline"
          style={{ marginTop: "0.75rem", display: "inline-flex" }}
        >
          Open Instructor Dashboard
        </Link>
      </div>

      <aside
        className="pilot-subscription-instructor-preview"
        aria-label="Instructor listing preview"
      >
        <p className="pilot-subscription-instructor-preview-eyebrow">
          Instructor profile preview
        </p>

        <dl className="pilot-subscription-instructor-preview-fields">
          <div>
            <dt>Bio</dt>
            <dd>{bio}</dd>
          </div>
          <div>
            <dt>Flight School</dt>
            <dd>{flightSchool}</dd>
          </div>
          <div>
            <dt>Training Location</dt>
            <dd>{trainingLocation}</dd>
          </div>
        </dl>

        <div className="pilot-subscription-instructor-preview-status">
          <p className="pilot-subscription-instructor-preview-status-label">
            Public Listing
          </p>
          <span
            className={cn(
              "pilot-subscription-instructor-listed",
              active
                ? "pilot-subscription-instructor-listed--on"
                : "pilot-subscription-instructor-listed--off",
            )}
          >
            {active ? (
              <img
                src="/icons/pilot-dashboard/listed-check.svg"
                alt=""
                className="pilot-subscription-instructor-listed-icon"
                width={12}
                height={12}
              />
            ) : null}
            {active ? "Listed as instructor" : "Not listed"}
          </span>
        </div>

        <div className="pilot-subscription-instructor-card">
          <span className="pilot-subscription-instructor-avatar" aria-hidden>
            {initialsFromName(displayName)}
          </span>
          <div>
            <p className="pilot-subscription-instructor-card-name">{displayName}</p>
            <p className="pilot-subscription-instructor-card-role">
              Remote Pilot Instructor
            </p>
            <img
              src="/icons/pilot-dashboard/instructor-stars.svg"
              alt={
                preview.averageRating != null
                  ? `${preview.averageRating.toFixed(1)} out of 5`
                  : "Instructor rating"
              }
              className="pilot-subscription-instructor-card-stars"
              width={83}
              height={15}
            />
          </div>
        </div>
      </aside>
    </section>
  );
}
