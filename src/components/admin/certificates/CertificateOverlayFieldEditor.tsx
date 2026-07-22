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
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function CertificateOverlayFieldEditor({
  layout,
  overrides,
  selectedField,
  onSelectField,
  onChange,
  disabled = false,
}: CertificateOverlayFieldEditorProps) {
  const effective = getEffectiveFieldOverrides(layout, overrides);
  const active =
    effective.find((f) => f.field === selectedField) ?? effective[0] ?? null;

  function patch(partial: Partial<Omit<OverlayFieldOverride, "field">>) {
    if (!active) return;
    onChange(
      updateFieldOverride(layout, overrides, active.field, partial),
    );
  }

  if (!effective.length) {
    return (
      <p className="admin-cert-builder-hint">
        Upload certificate artwork to configure overlay fields.
      </p>
    );
  }

  return (
    <section className="admin-cert-overlay-editor" aria-label="Field alignment">
      <p className="admin-cert-builder-section-title">Field alignment</p>
      <p className="admin-cert-builder-hint">
        Select a field, drag on the preview, or fine-tune position and typography
        below.
      </p>

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
          <div className="admin-cert-overlay-row admin-cert-overlay-row--quick">
            <button
              type="button"
              className="admin-cert-builder-token"
              disabled={disabled}
              onClick={() => patch({ x: 50 })}
            >
              Center H
            </button>
            <button
              type="button"
              className="admin-cert-builder-token"
              disabled={disabled}
              onClick={() => patch({ y: 50 })}
            >
              Center V
            </button>
            <button
              type="button"
              className="admin-cert-builder-token"
              disabled={disabled}
              onClick={() => patch({ x: 50, y: 50 })}
            >
              Center both
            </button>
          </div>

          <div className="admin-cert-overlay-grid">
            <label className="admin-certificates-field admin-certificates-field--compact">
              <span>X position (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={round1(active.x)}
                disabled={disabled}
                onChange={(e) =>
                  patch({ x: Number(e.target.value) })
                }
              />
            </label>
            <label className="admin-certificates-field admin-certificates-field--compact">
              <span>Y position (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={round1(active.y)}
                disabled={disabled}
                onChange={(e) =>
                  patch({ y: Number(e.target.value) })
                }
              />
            </label>
            <label className="admin-certificates-field admin-certificates-field--compact">
              <span>Font size (px)</span>
              <input
                type="number"
                min={6}
                max={200}
                step={1}
                value={Math.round(active.fontSize ?? 24)}
                disabled={disabled}
                onChange={(e) =>
                  patch({ fontSize: Number(e.target.value) })
                }
              />
            </label>
            <label className="admin-certificates-field admin-certificates-field--compact">
              <span>Max width (%)</span>
              <input
                type="number"
                min={5}
                max={100}
                step={1}
                value={Math.round(active.maxWidth ?? 70)}
                disabled={disabled}
                onChange={(e) =>
                  patch({ maxWidth: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <div className="admin-cert-overlay-row">
            <span className="admin-cert-overlay-label">Text align</span>
            <div className="admin-cert-overlay-align-group">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`admin-cert-builder-token${
                    (active.align ?? "center") === align
                      ? " admin-cert-builder-token--active"
                      : ""
                  }`}
                  disabled={disabled}
                  onClick={() => patch({ align })}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-cert-overlay-row">
            <span className="admin-cert-overlay-label">Font style</span>
            <select
              className="admin-cert-overlay-select"
              value={active.font ?? "sans"}
              disabled={disabled}
              onChange={(e) =>
                patch({
                  font: e.target.value as OverlayFieldOverride["font"],
                })
              }
            >
              <option value="blackletter">Blackletter</option>
              <option value="serif">Serif</option>
              <option value="sans">Sans</option>
              <option value="script">Script</option>
            </select>
            <label className="admin-certificates-check-row admin-certificates-check-row--inline">
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
      ) : null}
    </section>
  );
}
