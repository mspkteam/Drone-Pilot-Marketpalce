"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WingDefinitionDto } from "@/types/wing";
import { PilotStatusBadge } from "@/components/pilot/PilotStatusBadge";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import type { AdminMemberDetailDto } from "@/lib/admin/member-detail";
import type { PilotProfileStatus } from "@/types/pilot";

type PilotDetail = NonNullable<AdminMemberDetailDto["pilotDetail"]>;

type AdminPilotMemberProfileProps = {
  userId: string;
  pilot: PilotDetail;
  canEdit: boolean;
  canAssignBadges?: boolean;
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

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

export function AdminPilotMemberProfile({
  userId,
  pilot,
  canEdit,
  canAssignBadges = false,
}: AdminPilotMemberProfileProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(pilot.displayName);
  const [licenseNumber, setLicenseNumber] = useState(pilot.licenseNumber);
  const [licenseCountry, setLicenseCountry] = useState(
    pilot.licenseCountry ?? "",
  );
  const [bio, setBio] = useState(pilot.bio ?? "");
  const [locationCity, setLocationCity] = useState(pilot.locationCity ?? "");
  const [locationRegion, setLocationRegion] = useState(
    pilot.locationRegion ?? "",
  );
  const [locationCountry, setLocationCountry] = useState(
    pilot.locationCountry ?? "",
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    pilot.serviceRadiusKm != null ? String(pilot.serviceRadiusKm) : "",
  );
  const [hourlyRateMin, setHourlyRateMin] = useState(
    pilot.hourlyRateMin != null ? String(pilot.hourlyRateMin) : "",
  );
  const [hourlyRateMax, setHourlyRateMax] = useState(
    pilot.hourlyRateMax != null ? String(pilot.hourlyRateMax) : "",
  );
  const [status, setStatus] = useState(pilot.status);
  const [isPublic, setIsPublic] = useState(pilot.isPublic);

  const [wingDefinitions, setWingDefinitions] = useState<WingDefinitionDto[]>(
    [],
  );
  const [loadingWings, setLoadingWings] = useState(false);
  const [assignWingId, setAssignWingId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [assigningWing, setAssigningWing] = useState(false);

  const earnedWingDefinitionIds = useMemo(
    () => new Set(pilot.wings.map((wing) => wing.code)),
    [pilot.wings],
  );

  const assignableWings = useMemo(
    () =>
      wingDefinitions.filter(
        (def) => def.isActive && !earnedWingDefinitionIds.has(def.code),
      ),
    [wingDefinitions, earnedWingDefinitionIds],
  );

  const loadWingDefinitions = useCallback(async () => {
    if (!canAssignBadges) return;
    setLoadingWings(true);
    try {
      const res = await fetch("/api/admin/wings");
      const json = (await res.json()) as {
        definitions?: WingDefinitionDto[];
      };
      if (res.ok) {
        setWingDefinitions(json.definitions ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingWings(false);
    }
  }, [canAssignBadges]);

  useEffect(() => {
    void loadWingDefinitions();
  }, [loadWingDefinitions]);

  const statusBlocksPublic =
    status === "pending_review" ||
    status === "suspended" ||
    status === "rejected";

  useEffect(() => {
    setDisplayName(pilot.displayName);
    setLicenseNumber(pilot.licenseNumber);
    setLicenseCountry(pilot.licenseCountry ?? "");
    setBio(pilot.bio ?? "");
    setLocationCity(pilot.locationCity ?? "");
    setLocationRegion(pilot.locationRegion ?? "");
    setLocationCountry(pilot.locationCountry ?? "");
    setServiceRadiusKm(
      pilot.serviceRadiusKm != null ? String(pilot.serviceRadiusKm) : "",
    );
    setHourlyRateMin(
      pilot.hourlyRateMin != null ? String(pilot.hourlyRateMin) : "",
    );
    setHourlyRateMax(
      pilot.hourlyRateMax != null ? String(pilot.hourlyRateMax) : "",
    );
    setStatus(pilot.status);
    setIsPublic(pilot.isPublic);
  }, [pilot]);

  function resetForm() {
    setDisplayName(pilot.displayName);
    setLicenseNumber(pilot.licenseNumber);
    setLicenseCountry(pilot.licenseCountry ?? "");
    setBio(pilot.bio ?? "");
    setLocationCity(pilot.locationCity ?? "");
    setLocationRegion(pilot.locationRegion ?? "");
    setLocationCountry(pilot.locationCountry ?? "");
    setServiceRadiusKm(
      pilot.serviceRadiusKm != null ? String(pilot.serviceRadiusKm) : "",
    );
    setHourlyRateMin(
      pilot.hourlyRateMin != null ? String(pilot.hourlyRateMin) : "",
    );
    setHourlyRateMax(
      pilot.hourlyRateMax != null ? String(pilot.hourlyRateMax) : "",
    );
    setStatus(pilot.status);
    setIsPublic(pilot.isPublic);
    setError(null);
    setMessage(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const radiusRaw = serviceRadiusKm.trim();
      const radius = radiusRaw ? parseOptionalNumber(serviceRadiusKm) : null;
      if (radiusRaw && (radius == null || radius < 0)) {
        setError("Service radius must be a whole number ≥ 0.");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilot: {
            displayName,
            licenseNumber,
            licenseCountry: licenseCountry.trim() || null,
            bio: bio.trim() || null,
            locationCity: locationCity.trim() || null,
            locationRegion: locationRegion.trim() || null,
            locationCountry: locationCountry.trim() || null,
            serviceRadiusKm: radius != null ? Math.round(radius) : null,
            hourlyRateMin: parseOptionalNumber(hourlyRateMin),
            hourlyRateMax: parseOptionalNumber(hourlyRateMax),
            status,
            isPublic: statusBlocksPublic ? false : isPublic,
          },
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Save failed.");
        return;
      }
      setMessage("Pilot profile saved.");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function moderate(action: "approve" | "reject") {
    setModerating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/pilots/${pilot.profileId}/${action}`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Action failed.");
        return;
      }
      setMessage(
        action === "approve"
          ? "Pilot profile approved."
          : "Pilot profile rejected.",
      );
      router.refresh();
    } catch {
      setError("Action failed.");
    } finally {
      setModerating(false);
    }
  }

  async function handleAssignWing(event: React.FormEvent) {
    event.preventDefault();
    if (!assignWingId) return;
    setAssigningWing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/wings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotProfileId: pilot.profileId,
          wingDefinitionId: assignWingId,
          note: assignNote.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; created?: boolean };
      if (!res.ok) {
        setError(json.error ?? "Failed to assign wing.");
        return;
      }
      setMessage(
        json.created === false
          ? "Pilot already has this wing."
          : "Wing / badge assigned.",
      );
      setAssignWingId("");
      setAssignNote("");
      router.refresh();
    } catch {
      setError("Failed to assign wing.");
    } finally {
      setAssigningWing(false);
    }
  }

  const effectiveCommission =
    pilot.commission?.overrideEnabled && pilot.commission.overridePercent != null
      ? pilot.commission.overridePercent
      : pilot.commission?.defaultPercent ?? null;

  return (
    <>
      <section
        className="admin-member-section admin-ops-bracket-card admin-pilot-profile-actions"
        aria-label="Pilot moderation"
      >
        <div className="admin-pilot-profile-actions-row">
          <PilotStatusBadge status={status as PilotProfileStatus} />
          {pilot.pendingVerifications > 0 ? (
            <Link
              href="/dashboard/admin/verifications"
              className="admin-member-chip admin-member-chip--link"
            >
              {pilot.pendingVerifications} verification
              {pilot.pendingVerifications === 1 ? "" : "s"} pending
            </Link>
          ) : null}
        </div>
        <div className="admin-pilot-profile-actions-row">
          {pilot.status === "pending_review" && canEdit ? (
            <>
              <button
                type="button"
                className="admin-personnel-edit-save"
                disabled={moderating}
                onClick={() => void moderate("approve")}
              >
                Approve profile
              </button>
              <button
                type="button"
                className="admin-personnel-btn-outline"
                disabled={moderating}
                onClick={() => void moderate("reject")}
              >
                Reject
              </button>
            </>
          ) : null}
          {canEdit && !editing ? (
            <button
              type="button"
              className="admin-personnel-btn-outline"
              onClick={() => {
                resetForm();
                setEditing(true);
              }}
            >
              Edit pilot profile
            </button>
          ) : null}
          {pilot.isPublic && isPublicPilotProfileEnabled() ? (
            <Link
              href={`/pilots/${pilot.profileId}`}
              className="admin-personnel-action"
              target="_blank"
              rel="noreferrer"
            >
              Public listing ↗
            </Link>
          ) : null}
          {pilot.commission ? (
            <Link
              href={`/dashboard/admin/settings?pilot=${pilot.profileId}#custom-pilot-rates`}
              className="admin-personnel-action"
            >
              Commission settings
            </Link>
          ) : null}
          <Link
            href={`/dashboard/admin/certificates?pilot=${pilot.profileId}`}
            className="admin-personnel-action"
          >
            Issue certificate
          </Link>
          <Link
            href={`/dashboard/admin/achievements?pilot=${pilot.profileId}`}
            className="admin-personnel-action"
          >
            Badge catalog
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

      {editing ? (
        <section className="admin-member-section admin-ops-bracket-card">
          <h2 className="admin-member-section-title">Edit pilot profile</h2>
          <form className="admin-pilot-profile-form" onSubmit={handleSave}>
            <div className="admin-pilot-profile-form-grid">
              <label className="admin-personnel-edit-field">
                <span>Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>License number</span>
                <input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>License country</span>
                <input
                  value={licenseCountry}
                  onChange={(e) => setLicenseCountry(e.target.value)}
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
                  <option value="draft">draft</option>
                  <option value="pending_review">pending_review</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="suspended">suspended</option>
                </select>
              </label>
              <label className="admin-personnel-edit-field">
                <span>City</span>
                <input
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Region / state</span>
                <input
                  value={locationRegion}
                  onChange={(e) => setLocationRegion(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Country</span>
                <input
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Service radius (km)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Hourly rate min ($)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={hourlyRateMin}
                  onChange={(e) => setHourlyRateMin(e.target.value)}
                  disabled={saving}
                />
              </label>
              <label className="admin-personnel-edit-field">
                <span>Hourly rate max ($)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={hourlyRateMax}
                  onChange={(e) => setHourlyRateMax(e.target.value)}
                  disabled={saving}
                />
              </label>
            </div>
            <label className="admin-personnel-edit-field admin-pilot-profile-bio">
              <span>Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                disabled={saving}
              />
            </label>
            <label className="admin-personnel-edit-check">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={saving || statusBlocksPublic}
              />
              Public directory listing
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
                {saving ? "Saving…" : "Save pilot profile"}
              </button>
            </footer>
          </form>
        </section>
      ) : (
        <section className="admin-member-section admin-ops-bracket-card">
          <h2 className="admin-member-section-title">Pilot profile</h2>
          <dl className="admin-member-grid">
            <Field label="Display name" value={pilot.displayName} />
            <Field label="License #" value={pilot.licenseNumber} />
            <Field label="License country" value={pilot.licenseCountry} />
            <Field
              label="Public listing"
              value={pilot.isPublic ? "Yes" : "No"}
            />
            <Field
              label="Location"
              value={[pilot.locationCity, pilot.locationRegion, pilot.locationCountry]
                .filter(Boolean)
                .join(", ")}
            />
            <Field
              label="Service radius"
              value={
                pilot.serviceRadiusKm != null
                  ? `${pilot.serviceRadiusKm} km`
                  : null
              }
            />
            <Field
              label="Hourly rate"
              value={
                pilot.hourlyRateMin != null || pilot.hourlyRateMax != null
                  ? `$${pilot.hourlyRateMin ?? "—"} – $${pilot.hourlyRateMax ?? "—"}`
                  : null
              }
            />
            <Field
              label="Onboarding"
              value={formatDate(pilot.onboardingCompletedAt)}
            />
            {pilot.servicesOffered.length ? (
              <Field
                label="Services"
                value={pilot.servicesOffered.join(", ")}
              />
            ) : null}
            {effectiveCommission != null ? (
              <Field
                label="Commission"
                value={
                  pilot.commission?.overrideEnabled
                    ? `${effectiveCommission}% (custom override)`
                    : `${effectiveCommission}% (grade default)`
                }
              />
            ) : null}
          </dl>
          {pilot.bio ? <p className="admin-member-bio">{pilot.bio}</p> : null}
        </section>
      )}

      <section className="admin-member-section admin-ops-bracket-card">
        <h2 className="admin-member-section-title">Membership</h2>
        {pilot.membership ? (
          <dl className="admin-member-grid">
            <Field
              label="Grade"
              value={`${pilot.membership.tierName} (${pilot.membership.tierCode})`}
            />
            <Field label="Subscription" value={pilot.membership.status} />
            <Field
              label="Can bid"
              value={pilot.membership.canApply ? "Yes" : "No"}
            />
            <Field
              label="Instructor"
              value={pilot.membership.instructorEligible ? "Eligible" : "No"}
            />
            <Field
              label="Job visibility delay"
              value={`${pilot.membership.jobVisibilityDelayHours}h`}
            />
            <Field
              label="Period ends"
              value={formatDate(pilot.membership.periodEnd)}
            />
          </dl>
        ) : (
          <p className="admin-member-empty">No active membership.</p>
        )}
      </section>

      <section className="admin-member-stats-row" aria-label="Pilot activity">
        {[
          ["Applications", pilot.counts.applications],
          ["Bookings", pilot.counts.bookings],
          ["Certificates", pilot.counts.certificates],
          ["Reviews", pilot.counts.reviews],
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

      <div className="admin-member-split">
        <section className="admin-member-section admin-ops-bracket-card">
          <h2 className="admin-member-section-title">Wings &amp; badges</h2>
          {pilot.wings.length ? (
            <ul className="admin-member-list">
              {pilot.wings.map((wing) => (
                <li key={wing.id}>
                  <strong>{wing.title}</strong>
                  <span>
                    {wing.code} · {formatDate(wing.earnedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-member-empty">No wings or badges awarded yet.</p>
          )}

          {canAssignBadges ? (
            <form
              className="admin-pilot-wing-assign"
              onSubmit={handleAssignWing}
            >
              <p className="admin-personnel-edit-hint">
                Assign a wing or badge from the catalog to this pilot.
              </p>
              <div className="admin-pilot-wing-assign-fields">
                <label className="admin-personnel-edit-field">
                  <span>Wing / badge</span>
                  <select
                    value={assignWingId}
                    onChange={(e) => setAssignWingId(e.target.value)}
                    disabled={assigningWing || loadingWings}
                    required
                  >
                    <option value="">
                      {loadingWings ? "Loading…" : "Select wing or badge…"}
                    </option>
                    {assignableWings.map((def) => (
                      <option key={def.id} value={def.id}>
                        {def.title} ({def.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-personnel-edit-field">
                  <span>Note (optional)</span>
                  <input
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                    placeholder="Reason for manual award"
                    disabled={assigningWing}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="admin-personnel-edit-save"
                disabled={assigningWing || !assignWingId}
              >
                {assigningWing ? "Assigning…" : "Assign wing / badge"}
              </button>
            </form>
          ) : null}
        </section>

        <section className="admin-member-section admin-ops-bracket-card">
          <h2 className="admin-member-section-title">Recent proposals</h2>
          {pilot.recentApplications.length ? (
            <ul className="admin-member-list">
              {pilot.recentApplications.map((app) => (
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
      </div>
    </>
  );
}
