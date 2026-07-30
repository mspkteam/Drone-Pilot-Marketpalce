"use client";

import {
  getEffectiveFieldOverrides,
  OVERLAY_FIELD_LABELS,
  updateFieldOverride,
  type CertificateOverlayField,
  type OverlayFieldOverride,
} from "@/lib/certificates/layouts";
import type { CertificateLayout } from "@/lib/certificates/layouts";

type CertificateOverlayFieldEditorProps = {
  layout: CertificateLayout;
  overrides: OverlayFieldOverride[] | null;
  selectedField: CertificateOverlayField | null;
  onSelectField: (field: CertificateOverlayField) => void;
  onChange: (overrides: OverlayFieldOverride[]) => void;
  disabled?: boolean;
  /** Compact instrument-panel layout for expand workspace sidebar */
  variant?: "default" | "rail";
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const ALIGN_GLYPH: Record<"left" | "center" | "right", string> = {
  left: "⫷",
  center: "☰",
  right: "⫸",
};

export function CertificateOverlayFieldEditor({
  layout,
  overrides,
  selectedField,
  onSelectField,
  onChange,
  disabled = false,
  variant = "default",
}: CertificateOverlayFieldEditorProps) {
  const effective = getEffectiveFieldOverrides(layout, overrides);
  const active =
    effective.find((f) => f.field === selectedField) ?? effective[0] ?? null;
  const isRail = variant === "rail";

  function patch(partial: Partial<Omit<OverlayFieldOverride, "field">>) {
    if (!active) return;
    onChange(updateFieldOverride(layout, overrides, active.field, partial));
  }

  function nudge(axis: "x" | "y", delta: number) {
    if (!active) return;
    patch({ [axis]: clamp(round1(active[axis] + delta), 0, 100) });
  }

  function nudgeSize(delta: number) {
    if (!active) return;
    patch({ fontSize: clamp(Math.round((active.fontSize ?? 24) + delta), 6, 200) });
  }

  if (!effective.length) {
    return (
      <p className="admin-cert-builder-hint">
        Turn on at least one field above, then drag it on the certificate.
      </p>
    );
  }

  return (
    <section
      className={`admin-cert-overlay-editor${
        isRail ? " admin-cert-overlay-editor--rail" : ""
      }`}
      aria-label="Field settings"
    >
      <header className="admin-cert-overlay-editor-head">
        <div>
          <p className="admin-cert-overlay-kicker">
            {isRail ? "Placement tools" : "Field controls"}
          </p>
          <h3 className="admin-cert-overlay-heading">
            {isRail ? "Move & style" : "Adjust selected field"}
          </h3>
        </div>
        {active ? (
          <span className="admin-cert-overlay-active-chip">
            {OVERLAY_FIELD_LABELS[active.field]}
          </span>
        ) : null}
      </header>

      {!isRail ? (
        <p className="admin-cert-overlay-lead">
          Select a field, drag it on the certificate, or use the pad.{" "}
          <kbd>Shift</kbd> + nudge = fine move.
        </p>
      ) : (
        <p className="admin-cert-overlay-lead admin-cert-overlay-lead--compact">
          Drag on certificate · arrows nudge · <kbd>Shift</kbd> fine
        </p>
      )}

      <div className="admin-cert-overlay-field-tabs" role="tablist">
        {effective.map((field) => (
          <button
            key={field.field}
            type="button"
            role="tab"
            aria-selected={active?.field === field.field}
            className={`admin-cert-overlay-field-tab${
              active?.field === field.field
                ? " admin-cert-overlay-field-tab--active"
                : ""
            }`}
            onClick={() => onSelectField(field.field)}
            disabled={disabled}
          >
            {OVERLAY_FIELD_LABELS[field.field]}
          </button>
        ))}
      </div>

      {active ? (
        <div className="admin-cert-overlay-controls">
          <div className="admin-cert-control-deck">
            <div className="admin-cert-nudge-panel">
              <p className="admin-cert-panel-label">Position</p>
              <div className="admin-cert-nudge-pad" aria-label="Nudge position">
                <span aria-hidden />
                <button
                  type="button"
                  className="admin-cert-nudge-btn"
                  disabled={disabled}
                  onClick={(e) => nudge("y", e.shiftKey ? -0.2 : -1)}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <span aria-hidden />
                <button
                  type="button"
                  className="admin-cert-nudge-btn"
                  disabled={disabled}
                  onClick={(e) => nudge("x", e.shiftKey ? -0.2 : -1)}
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="admin-cert-nudge-btn admin-cert-nudge-btn--center"
                  disabled={disabled}
                  onClick={() => patch({ x: 50 })}
                  aria-label="Center horizontally"
                  title="Center horizontally"
                >
                  ◆
                </button>
                <button
                  type="button"
                  className="admin-cert-nudge-btn"
                  disabled={disabled}
                  onClick={(e) => nudge("x", e.shiftKey ? 0.2 : 1)}
                  aria-label="Move right"
                >
                  →
                </button>
                <span aria-hidden />
                <button
                  type="button"
                  className="admin-cert-nudge-btn"
                  disabled={disabled}
                  onClick={(e) => nudge("y", e.shiftKey ? 0.2 : 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <span aria-hidden />
              </div>
              <p className="admin-cert-coord-readout" aria-live="polite">
                <span>
                  X <strong>{round1(active.x)}</strong>
                </span>
                <span>
                  Y <strong>{round1(active.y)}</strong>
                </span>
              </p>
            </div>

            <div className="admin-cert-style-panel">
              <p className="admin-cert-panel-label">Typography</p>

              <div className="admin-cert-style-block">
                <span className="admin-cert-overlay-label">Size</span>
                <div className="admin-cert-size-controls">
                  <button
                    type="button"
                    className="admin-cert-nudge-btn"
                    disabled={disabled}
                    onClick={() => nudgeSize(-2)}
                    aria-label="Smaller text"
                  >
                    A−
                  </button>
                  <span className="admin-cert-size-value">
                    {Math.round(active.fontSize ?? 24)}
                  </span>
                  <button
                    type="button"
                    className="admin-cert-nudge-btn"
                    disabled={disabled}
                    onClick={() => nudgeSize(2)}
                    aria-label="Larger text"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="admin-cert-style-block">
                <span className="admin-cert-overlay-label">Align</span>
                <div className="admin-cert-overlay-align-group" role="group">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      className={`admin-cert-align-btn${
                        (active.align ?? "center") === align
                          ? " admin-cert-align-btn--active"
                          : ""
                      }`}
                      disabled={disabled}
                      onClick={() => patch({ align })}
                      aria-pressed={(active.align ?? "center") === align}
                      title={align}
                    >
                      <span aria-hidden>{ALIGN_GLYPH[align]}</span>
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-cert-style-block">
                <span className="admin-cert-overlay-label">Font</span>
                <div className="admin-cert-font-row">
                  <select
                    className="admin-cert-overlay-select"
                    value={active.font ?? "arial"}
                    disabled={disabled}
                    onChange={(e) =>
                      patch({
                        font: e.target.value as OverlayFieldOverride["font"],
                      })
                    }
                  >
                    <option value="engravers">Engravers MT</option>
                    <option value="harrowgate">Harrowgate</option>
                    <option value="colchester">Colchester</option>
                    <option value="arial">Arial</option>
                  </select>
                  <label
                    className={`admin-cert-bold-toggle${
                      active.weight === "bold" ? " admin-cert-bold-toggle--on" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active.weight === "bold"}
                      disabled={disabled}
                      onChange={(e) =>
                        patch({ weight: e.target.checked ? "bold" : "normal" })
                      }
                    />
                    Bold
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-cert-snap-row" aria-label="Quick placement">
            <span className="admin-cert-overlay-label">Snap</span>
            <button
              type="button"
              className="admin-cert-snap-chip"
              disabled={disabled}
              onClick={() => patch({ x: 50, y: 50, align: "center" })}
            >
              Center page
            </button>
            <button
              type="button"
              className="admin-cert-snap-chip"
              disabled={disabled}
              onClick={() => patch({ x: 18, y: 92, align: "left" })}
            >
              Bottom left
            </button>
            <button
              type="button"
              className="admin-cert-snap-chip"
              disabled={disabled}
              onClick={() => patch({ x: 84, y: 92, align: "center" })}
            >
              Bottom right
            </button>
          </div>

          <details className="admin-cert-advanced">
            <summary>Fine-tune numbers</summary>
            <div className="admin-cert-overlay-grid">
              <label className="admin-certificates-field admin-certificates-field--compact">
                <span>X (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={round1(active.x)}
                  disabled={disabled}
                  onChange={(e) => patch({ x: Number(e.target.value) })}
                />
              </label>
              <label className="admin-certificates-field admin-certificates-field--compact">
                <span>Y (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={round1(active.y)}
                  disabled={disabled}
                  onChange={(e) => patch({ y: Number(e.target.value) })}
                />
              </label>
              <label className="admin-certificates-field admin-certificates-field--compact">
                <span>Font size</span>
                <input
                  type="number"
                  min={6}
                  max={200}
                  step={1}
                  value={Math.round(active.fontSize ?? 24)}
                  disabled={disabled}
                  onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                />
              </label>
              <label className="admin-certificates-field admin-certificates-field--compact">
                <span>Width (%)</span>
                <input
                  type="number"
                  min={5}
                  max={100}
                  step={1}
                  value={Math.round(active.maxWidth ?? 70)}
                  disabled={disabled}
                  onChange={(e) => patch({ maxWidth: Number(e.target.value) })}
                />
              </label>
            </div>
          </details>
        </div>
      ) : null}
    </section>
  );
}
