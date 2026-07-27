"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PilotRateDetail,
  PilotRateSearchResult,
} from "@/types/admin-configuration";

type AdminCustomPilotRatesProps = {
  canManage: boolean;
};

export function AdminCustomPilotRates({ canManage }: AdminCustomPilotRatesProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PilotRateSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detail, setDetail] = useState<PilotRateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [ratePercent, setRatePercent] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (value: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/configuration/pilot-rates?q=${encodeURIComponent(value)}`,
      );
      const json = (await res.json()) as {
        results?: PilotRateSearchResult[];
      };
      if (res.ok) {
        setResults(json.results ?? []);
      }
    } catch {
      /* ignore transient search errors */
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!showResults) return;
    const timer = setTimeout(() => void runSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, showResults, runSearch]);

  function applyDetail(next: PilotRateDetail) {
    setDetail(next);
    setQuery(next.displayName);
    setOverrideEnabled(next.manualOverrideEnabled);
    setRatePercent(
      next.customCommissionPercent != null
        ? String(next.customCommissionPercent)
        : "",
    );
    setReason(next.reason);
    setEffectiveDate(next.effectiveDate);
  }

  async function selectPilot(pilotProfileId: string) {
    setShowResults(false);
    setLoadingDetail(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/configuration/pilot-rates?pilotProfileId=${pilotProfileId}`,
      );
      const json = (await res.json()) as {
        detail?: PilotRateDetail;
        error?: string;
      };
      if (res.ok && json.detail) {
        applyDetail(json.detail);
      } else {
        setError(json.error ?? "Failed to load pilot.");
      }
    } catch {
      setError("Failed to load pilot.");
    } finally {
      setLoadingDetail(false);
    }
  }

  const selectPilotRef = useRef(selectPilot);
  selectPilotRef.current = selectPilot;

  useEffect(() => {
    const pilotId = searchParams.get("pilot");
    if (pilotId) {
      void selectPilotRef.current(pilotId);
    }
  }, [searchParams]);

  async function handleSave() {
    if (!detail || !canManage) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/configuration/pilot-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotProfileId: detail.pilotProfileId,
          manualOverrideEnabled: overrideEnabled,
          customCommissionPercent: ratePercent === "" ? null : Number(ratePercent),
          reason,
          effectiveDate,
        }),
      });
      const json = (await res.json()) as {
        detail?: PilotRateDetail;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.detail) {
        setError(json.error ?? "Failed to save override.");
        return;
      }
      applyDetail(json.detail);
      setMessage(json.message ?? "Override saved.");
    } catch {
      setError("Failed to save override.");
    } finally {
      setSaving(false);
    }
  }

  function handleInputFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setShowResults(true);
    if (results.length === 0) void runSearch(query);
  }

  function handleInputBlur() {
    blurTimer.current = setTimeout(() => setShowResults(false), 150);
  }

  return (
    <>
      <h3 className="admin-config-section-title">Custom pilot rates</h3>

      <div className="admin-config-pilot-search">
        <div className="admin-config-pilot-search-field">
          <span className="sr-only" id="pilot-rate-search-label">
            Search pilot by name or email
          </span>
          <input
            type="search"
            className="admin-config-pilot-search-input"
            placeholder="Search a pilot by name or email"
            aria-labelledby="pilot-rate-search-label"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowResults(true);
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {showResults ? (
            <ul className="admin-config-pilot-results" role="listbox">
              {searching && results.length === 0 ? (
                <li className="admin-config-pilot-result admin-config-pilot-result--muted">
                  Searching…
                </li>
              ) : null}
              {!searching && results.length === 0 ? (
                <li className="admin-config-pilot-result admin-config-pilot-result--muted">
                  No pilots found
                </li>
              ) : null}
              {results.map((pilot) => (
                <li key={pilot.pilotProfileId}>
                  <button
                    type="button"
                    className="admin-config-pilot-result"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectPilot(pilot.pilotProfileId)}
                  >
                    <span className="admin-config-pilot-result-name">
                      {pilot.displayName}
                    </span>
                    <span className="admin-config-pilot-result-meta">
                      {pilot.rank}
                      {pilot.hasOverride ? " · custom rate" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          className="admin-config-pilot-search-btn"
          onClick={() => {
            setShowResults(true);
            void runSearch(query);
          }}
        >
          Search
        </button>
      </div>

      {error ? (
        <p className="admin-config-banner admin-config-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="admin-config-banner admin-config-banner--info" role="status">
          {message}
        </p>
      ) : null}

      {loadingDetail ? (
        <p className="admin-config-pilot-empty">Loading pilot…</p>
      ) : detail ? (
        <>
          <div className="admin-config-override-panel">
            <div className="admin-config-override-field">
              <p className="admin-config-override-label">PILOT</p>
              <p className="admin-config-override-value admin-config-override-value--gold">
                {detail.displayName}
              </p>
            </div>
            <div className="admin-config-override-field">
              <p className="admin-config-override-label">RANK</p>
              <p className="admin-config-override-value">{detail.rank}</p>
            </div>
            <div className="admin-config-override-field">
              <p className="admin-config-override-label">DEFAULT COMMISSION</p>
              <p className="admin-config-override-value">
                {detail.defaultCommissionPercent}%
              </p>
            </div>

            <div className="admin-config-override-field admin-config-override-field--row">
              <p className="admin-config-override-label">MANUAL OVERRIDE</p>
              <label
                className={`admin-config-toggle${canManage ? " admin-config-toggle--editable" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={overrideEnabled}
                  disabled={!canManage}
                  onChange={(event) => setOverrideEnabled(event.target.checked)}
                  aria-label="Manual override enabled"
                />
                <span className="admin-config-toggle-track" aria-hidden />
              </label>
            </div>

            <div className="admin-config-override-field">
              <label className="admin-config-override-label" htmlFor="pilot-rate-input">
                CUSTOM COMMISSION RATE
              </label>
              <div className="admin-config-rate-input-wrap">
                <input
                  id="pilot-rate-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  inputMode="decimal"
                  className="admin-config-override-input"
                  value={ratePercent}
                  disabled={!canManage || !overrideEnabled}
                  placeholder="e.g. 7.5"
                  onChange={(event) => setRatePercent(event.target.value)}
                />
                <span className="admin-config-rate-suffix" aria-hidden>
                  %
                </span>
              </div>
            </div>

            <div className="admin-config-override-field">
              <label className="admin-config-override-label" htmlFor="pilot-rate-reason">
                REASON
              </label>
              <input
                id="pilot-rate-reason"
                type="text"
                className="admin-config-override-input"
                value={reason}
                disabled={!canManage}
                placeholder="Reason for this custom rate"
                onChange={(event) => setReason(event.target.value)}
              />
            </div>

            <div className="admin-config-override-field">
              <label className="admin-config-override-label" htmlFor="pilot-rate-effective">
                EFFECTIVE DATE
              </label>
              <input
                id="pilot-rate-effective"
                type="text"
                className="admin-config-override-input"
                value={effectiveDate}
                disabled={!canManage}
                placeholder="e.g. Next completed contract"
                onChange={(event) => setEffectiveDate(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-config-override-actions">
            {canManage ? (
              <button
                type="button"
                className="admin-config-btn-gold admin-config-btn-save-override"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Override"}
              </button>
            ) : null}
            <Link
              href="/dashboard/admin/users?role=pilot"
              className="admin-config-btn-outline admin-config-btn-all-pilots"
            >
              See All Pilots
            </Link>
          </div>
        </>
      ) : (
        <div className="admin-config-override-actions">
          <p className="admin-config-pilot-empty">
            Search and select a pilot to view or set a custom commission rate.
          </p>
          <Link
            href="/dashboard/admin/users?role=pilot"
            className="admin-config-btn-outline admin-config-btn-all-pilots"
          >
            See All Pilots
          </Link>
        </div>
      )}
    </>
  );
}
