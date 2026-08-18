"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PilotVerificationTabs } from "@/components/dashboard/pilot/verifications/PilotVerificationTabs";
import type {
  AviatorWingRequestDto,
  PilotWingRequestPageDto,
} from "@/lib/wings/aviator-wing-requests";
import {
  REQUESTABLE_WING_OPTIONS,
  WING_REQUEST_ELIGIBILITY,
  WING_REQUEST_RULES,
  WING_REQUEST_STEPS,
  getRequestableWingOption,
  type RequestableWingCode,
  type WingRequestFileMeta,
  type WingRequestFileSlot,
} from "@/lib/wings/request-wings";

type DropProps = {
  slot: WingRequestFileSlot;
  large?: boolean;
  file: WingRequestFileMeta | null;
  extraCount?: number;
  requestId: string | null;
  uploading: boolean;
  onUpload: (slot: WingRequestFileSlot, file: File) => Promise<void>;
};

function FileDrop({
  slot,
  large,
  file,
  extraCount = 0,
  requestId,
  uploading,
  onUpload,
}: DropProps) {
  const [drag, setDrag] = useState(false);
  const icon = large ? "/wings/request/icon-upload-lg.svg" : "/wings/request/icon-upload.svg";

  async function takeFiles(list: FileList | null) {
    if (!list?.length) return;
    for (const next of Array.from(list)) {
      await onUpload(slot, next);
    }
  }

  return (
    <label
      className={`prw-drop${large ? " prw-drop--lg" : ""}${drag ? " is-drag" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDrag(false);
        void takeFiles(event.dataTransfer.files);
      }}
    >
      <span className="prw-drop-icon">
        <img src={icon} alt="" width={large ? 21 : 17} height={large ? 21 : 17} />
      </span>
      <p className="prw-drop-main">
        {large ? (
          <strong>Drag &amp; drop files here or click to upload</strong>
        ) : (
          <>
            <strong>Choose File </strong>
            or Drag &amp; Drop
          </>
        )}
      </p>
      <p className="prw-drop-sub">
        {uploading ? "Uploading…" : "PDF, JPG, PNG up to 25MB"}
      </p>
      <input
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        multiple={slot === "logbook"}
        hidden
        onChange={(event) => {
          void takeFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      {file ? (
        <p className="prw-file">
          {requestId ? (
            <a
              href={`/api/pilot/wing-requests/${requestId}/document?file=${encodeURIComponent(file.storedFileName)}`}
              target="_blank"
              rel="noreferrer"
            >
              {file.originalFileName}
            </a>
          ) : (
            file.originalFileName
          )}
          {extraCount > 0 ? ` +${extraCount} more` : ""}
        </p>
      ) : null}
    </label>
  );
}

export function PilotRequestWingsView() {
  const [page, setPage] = useState<PilotWingRequestPageDto | null>(null);
  const [wingCode, setWingCode] = useState<RequestableWingCode>("aviator-wings-senior");
  const [legalName, setLegalName] = useState("");
  const [ftn, setFtn] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [uploading, setUploading] = useState<WingRequestFileSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hydrate = useCallback((data: PilotWingRequestPageDto) => {
    setPage(data);
    const source = data.draft;
    if (source) {
      setWingCode(source.wingCode);
      setLegalName(source.legalName || data.displayName);
      setFtn(source.ftn);
      setTotalHours(source.totalHours != null ? String(source.totalHours) : "");
      setNotes(source.notes);
      setConfirmation(source.confirmation);
      return;
    }
    setLegalName(data.displayName);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/pilot/wing-requests");
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load wings request.");
    }
    hydrate(json as PilotWingRequestPageDto);
  }, [hydrate]);

  useEffect(() => {
    load()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => setLoading(false));
  }, [load]);

  const option = getRequestableWingOption(wingCode);
  const awarded = useMemo(
    () => new Set(page?.awardedWingCodes ?? []),
    [page?.awardedWingCodes],
  );
  const request = page?.draft ?? null;
  const evidenceName = legalName.trim() || page?.displayName || "your";

  async function save(action: "draft" | "submit") {
    setError(null);
    setSuccess(null);
    setSaving(action);
    try {
      const res = await fetch("/api/pilot/wing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          wingCode,
          legalName,
          ftn,
          totalHours: totalHours === "" ? null : Number(totalHours),
          notes,
          confirmation,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not save the request.");
        return;
      }
      await load();
      setSuccess(
        action === "submit"
          ? "Request submitted for administrator review."
          : "Draft saved.",
      );
    } catch {
      setError("Could not save the request.");
    } finally {
      setSaving(null);
    }
  }

  async function upload(slot: WingRequestFileSlot, file: File) {
    setError(null);
    setSuccess(null);
    setUploading(slot);
    try {
      const form = new FormData();
      form.set("slot", slot);
      form.set("file", file);
      const res = await fetch("/api/pilot/wing-requests/documents", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed.");
        return;
      }
      const next = json.request as AviatorWingRequestDto;
      setPage((prev) =>
        prev
          ? {
              ...prev,
              draft: next,
              requests: [
                next,
                ...prev.requests.filter((row) => row.id !== next.id),
              ],
            }
          : prev,
      );
      setSuccess(`${file.name} attached.`);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  const history = (page?.requests ?? []).filter((row) => row.status !== "draft");

  return (
    <div className="prw-page">
      <header className="prw-header prw-bracket">
        <p className="prw-eyebrow">PILOT / VERIFICATION</p>
        <h1 className="prw-title">Request Wings</h1>
        <p className="prw-subtitle">
          Request additional aviator wings and upload the required documentation for review.
        </p>
        <PilotVerificationTabs active="request-wings" />
        <p className="prw-success-note">
          <strong>✓</strong>
          Remote Aircrew Wings are automatically awarded after membership approval. Recreational Pilot Wings may be requested immediately.
        </p>
      </header>

      {error ? (
        <p className="prw-banner prw-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="prw-banner prw-banner--ok" role="status">
          {success}
        </p>
      ) : null}
      {request?.rejectionReason ? (
        <p className="prw-banner prw-banner--error" role="status">
          Previous review: {request.rejectionReason}
        </p>
      ) : null}

      {loading ? (
        <p className="prw-subtitle">Loading wings request…</p>
      ) : (
        <div className="prw-grid">
          <form
            className="prw-card prw-form"
            onSubmit={(event) => {
              event.preventDefault();
              void save("submit");
            }}
          >
            <h2 className="prw-form-title">Your Wings Request</h2>
            <p className="prw-form-note">
              You may submit your EASA equivalent documents to substitute for FAA Part 107 for any portion of this request to receive credit for the same wing progression. If you hold both licenses, you may combine all accumulated flight hours for both the FAA and EASA.
            </p>

            <div>
              <p className="prw-label">1. Wing Type *</p>
              <div className="prw-options" role="radiogroup" aria-label="Wing type">
                {REQUESTABLE_WING_OPTIONS.map((item) => {
                  const selected = item.code === wingCode;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`prw-option${selected ? " is-selected" : ""}`}
                      onClick={() => setWingCode(item.code)}
                    >
                      <span className="prw-option-img">
                        <img src={item.imageSrc} alt="" width={70} height={26} />
                      </span>
                      <span className="prw-option-label">
                        {item.labelLines[0]}
                        {item.labelLines[1] ? (
                          <>
                            <br />
                            {item.labelLines[1]}
                          </>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="prw-status-row">
              <div className="prw-status-box">
                <p className="prw-status-title">Selected Request Summary</p>
                <p className="prw-status-line">
                  <span className="prw-dot" />
                  <span>
                    Selected wing: <strong>{option?.label}</strong>
                  </span>
                </p>
                <p className="prw-status-line">
                  <span className="prw-dot prw-dot--ok" />
                  <span>
                    Current prerequisite:{" "}
                    <strong>{option?.prerequisiteLabel}</strong>
                  </span>
                </p>
                <p className="prw-status-line">
                  <span className="prw-dot" />
                  <span>
                    Minimum requirement:{" "}
                    <strong>{option?.minimumRequirement}</strong>
                  </span>
                </p>
              </div>
              <div className="prw-status-box">
                <p className="prw-status-title">Required Evidence for This Request</p>
                {(option?.evidence ?? []).map((line) => (
                  <p key={line} className="prw-status-line">
                    <span className={`prw-dot${line.includes("Multiple") ? " prw-dot--ok" : ""}`} />
                    <span>
                      {line.includes("pilot profile")
                        ? `Logbooks must match ${evidenceName}’s pilot profile.`
                        : line}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <div className="prw-fields">
              <div className="prw-field">
                <label className="prw-label" htmlFor="prw-name">
                  2. Pilot Name
                </label>
                <input
                  id="prw-name"
                  className="prw-input"
                  value={legalName}
                  onChange={(event) => setLegalName(event.target.value)}
                />
              </div>
              <div className={`prw-field${option?.studentOnly ? "" : " is-dim"}`}>
                <label className="prw-label" htmlFor="prw-ftn">
                  3. FAA Tracking Number (FTN)
                  <span className="prw-tag">Student only</span>
                </label>
                <input
                  id="prw-ftn"
                  className="prw-input"
                  placeholder="Enter your FTN"
                  value={ftn}
                  onChange={(event) => setFtn(event.target.value)}
                  disabled={!option?.studentOnly}
                />
                <p className="prw-help">Required only when Student Aviator Wings is selected.</p>
              </div>

              <div className={`prw-field${option?.studentOnly ? "" : " is-dim"}`}>
                <p className="prw-label">
                  4. IACRA Profile / Proof Upload
                  <span className="prw-tag">Student only</span>
                </p>
                <FileDrop
                  slot="iacra"
                  file={request?.documents.iacra ?? null}
                  requestId={request?.id ?? null}
                  uploading={uploading === "iacra"}
                  onUpload={upload}
                />
              </div>
              <div className={`prw-field${option?.studentOnly ? "" : " is-dim"}`}>
                <p className="prw-label">
                  5. FAA Part 107 Knowledge Test Score Form
                  <span className="prw-tag">Student only</span>
                </p>
                <FileDrop
                  slot="testScore"
                  file={request?.documents.testScore ?? null}
                  requestId={request?.id ?? null}
                  uploading={uploading === "testScore"}
                  onUpload={upload}
                />
                <p className="prw-help">
                  Required for Student Aviator Wings: passing FAA Part 107 Knowledge Test “Unmanned Aircraft General – Small (UAG)” score form.
                </p>
              </div>
              <div className={`prw-field${option?.aviatorPlus ? "" : " is-dim"}`}>
                <p className="prw-label">
                  6. Part 107 Remote Pilot Certificate
                  <span className="prw-tag prw-tag--gold">Aviator+</span>
                </p>
                <FileDrop
                  slot="certificate"
                  file={request?.documents.certificate ?? null}
                  requestId={request?.id ?? null}
                  uploading={uploading === "certificate"}
                  onUpload={upload}
                />
                <p className="prw-help">
                  Permanent card only — temporary certificates are not accepted. Admin may verify this through the FAA Airmen Registry.
                </p>
              </div>

              <div className={`prw-field${option?.seniorMaster ? "" : " is-dim"}`}>
                <label className="prw-label" htmlFor="prw-hours">
                  7. Total Remote Flight Hours
                  <span className="prw-tag prw-tag--gold">Senior/Master</span>
                </label>
                <input
                  id="prw-hours"
                  className="prw-input"
                  inputMode="decimal"
                  placeholder="e.g., 650"
                  value={totalHours}
                  onChange={(event) => setTotalHours(event.target.value)}
                  disabled={!option?.seniorMaster}
                />
                <p className="prw-help">
                  Required for Senior (500+) and Master (1,000+) Aviator Wings. Hours must be accumulated while holding a Part 107 Certificate or European equivalent.
                </p>
              </div>
              <div className={`prw-field${option?.seniorMaster ? "" : " is-dim"}`}>
                <p className="prw-label">
                  8. Logbook Uploads *
                  <span className="prw-tag prw-tag--gold">Senior/Master</span>
                </p>
                <FileDrop
                  slot="logbook"
                  large
                  file={request?.documents.logbooks[0] ?? null}
                  extraCount={Math.max(0, (request?.documents.logbooks.length ?? 0) - 1)}
                  requestId={request?.id ?? null}
                  uploading={uploading === "logbook"}
                  onUpload={upload}
                />
                <p className="prw-help">
                  <strong>Preferred records:</strong> DJI Flight Records, AirData UAV, similar reputable digital logbooks, legible handwritten logs, PDFs, and screenshots. Multiple logs from multiple drones may be uploaded.
                  <br />
                  <strong>Multiple logs:</strong> Upload multiple files from multiple drones. Pilot name must match this profile.
                </p>
              </div>

              <div className="prw-field prw-field--wide">
                <label className="prw-label" htmlFor="prw-notes">
                  9. Additional Notes (Optional)
                </label>
                <textarea
                  id="prw-notes"
                  className="prw-textarea"
                  placeholder="Add any additional information that may help with your request..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
              <div className="prw-field prw-field--wide">
                <p className="prw-label">10. Confirmation</p>
                <label className="prw-check">
                  <input
                    type="checkbox"
                    checked={confirmation}
                    onChange={(event) => setConfirmation(event.target.checked)}
                  />
                  I confirm that all uploaded records are accurate, legible, and belong to me.
                </label>
              </div>
            </div>

            <div className="prw-info prw-info--gold">
              <span className="prw-note-icon">
                <img src="/wings/request/icon-logbook.svg" alt="" width={16} height={16} />
              </span>
              <p>
                <strong>Digital Logbook Note:</strong> Digital logbooks are an integral part of being a responsible pilot, whether manned or unmanned. Remote Air Service places high emphasis on verified logbooks for Senior and Master Aviator Wings.
              </p>
            </div>
            <div className="prw-info prw-info--muted">
              <span className="prw-note-icon">
                <img src="/wings/request/icon-approval.svg" alt="" width={15} height={15} />
              </span>
              <p>
                <strong>After approval:</strong> A wings certificate will be auto-generated with the pilot name and award date, then delivered to the member profile and inbox.
              </p>
            </div>
            <div className="prw-info prw-info--warn">
              <span className="prw-note-icon">
                <img src="/wings/request/icon-warning.svg" alt="" width={15} height={15} />
              </span>
              <p>
                <strong>Important Notice:</strong> Requests may be denied if records are illegible, manipulated, altered, or not reputable. You may resubmit with additional evidence if denied.
              </p>
            </div>

            <div className="prw-actions">
              <button
                type="submit"
                className="prw-btn prw-btn--primary"
                disabled={saving != null || awarded.has(wingCode)}
              >
                {saving === "submit" ? "Submitting…" : "Submit Request"}
              </button>
              <button
                type="button"
                className="prw-btn prw-btn--ghost"
                disabled={saving != null}
                onClick={() => void save("draft")}
              >
                {saving === "draft" ? "Saving…" : "Save as Draft"}
              </button>
            </div>
            {awarded.has(wingCode) ? (
              <p className="prw-help">You already hold these wings.</p>
            ) : null}
            {history.length > 0 ? (
              <ul className="prw-history">
                {history.slice(0, 4).map((row) => (
                  <li key={row.id}>
                    {row.wingLabel} — {row.status}
                    {row.submittedAt
                      ? ` · ${new Date(row.submittedAt).toLocaleDateString()}`
                      : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </form>

          <aside className="prw-side">
            <section className="prw-card prw-side-card">
              <h2 className="prw-side-title">
                <span className="prw-side-icon">
                  <img src="/wings/request/icon-eligibility.svg" alt="" width={18} height={18} />
                </span>
                Eligibility by Wing
              </h2>
              {WING_REQUEST_ELIGIBILITY.map((line) => (
                <p key={line} className="prw-elig-row">
                  <span className="prw-check-dot" aria-hidden>
                    ✓
                  </span>
                  {line}
                </p>
              ))}
            </section>
            <section className="prw-card prw-side-card">
              <h2 className="prw-side-title">
                <span className="prw-side-icon">
                  <img src="/wings/request/icon-rules.svg" alt="" width={18} height={18} />
                </span>
                Verification Rules
              </h2>
              {WING_REQUEST_RULES.map((line) => (
                <p key={line} className="prw-rule-row">
                  <span className="prw-rule-mark" />
                  {line}
                </p>
              ))}
            </section>
            <section className="prw-card prw-side-card">
              <h2 className="prw-side-title">
                <span className="prw-side-icon">
                  <img src="/wings/request/icon-how.svg" alt="" width={18} height={18} />
                </span>
                How It Works
              </h2>
              {WING_REQUEST_STEPS.map((line, index) => (
                <div key={line} className="prw-step">
                  <span className="prw-step-num">{index + 1}</span>
                  <p>{line}</p>
                </div>
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
