"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CERTIFICATE_FONT_CSS,
  type CertificateFontKey,
} from "@/lib/certificates/fonts";
import {
  applyOverlayPositionOverrides,
  getCertificateLayout,
  getEffectiveFieldOverrides,
  OVERLAY_FIELD_LABELS,
  resolveOverlayText,
  setActiveOverlayFields,
  updateFieldOverride,
  type CertificateFieldStyle,
  type CertificateOverlayField,
  type CertificateOverlayValues,
  type OverlayFieldOverride,
} from "@/lib/certificates/layouts";

type CertificateCanvasProps = {
  memberName?: string;
  memberNumber?: string | null;
  backgroundImageUrl?: string | null;
  layoutKey?: string | null;
  gradeOrTitle?: string | null;
  certificateNumber?: string | null;
  issuedAt?: Date | string | null;
  overlayPositions?: OverlayFieldOverride[] | null;
  editable?: boolean;
  selectedField?: CertificateOverlayField | null;
  onFieldSelect?: (field: CertificateOverlayField) => void;
  onOverlayPositionsChange?: (positions: OverlayFieldOverride[]) => void;
};

const SNAP_THRESHOLD = 1.5;

function fontFamilyFor(style: CertificateFieldStyle["font"]): string {
  return (
    CERTIFICATE_FONT_CSS[style as CertificateFontKey] ?? CERTIFICATE_FONT_CSS.arial
  );
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function snapToCenter(value: number): number {
  if (Math.abs(value - 50) <= SNAP_THRESHOLD) return 50;
  return value;
}

/**
 * Font size as % of canvas width — matches PDFKit:
 * pdfFontSize = field.fontSize * (pageWidth / layout.width)
 */
function fontSizeCqw(fontSize: number, layoutWidth: number): string {
  const pct = (fontSize / layoutWidth) * 100;
  return `${pct}cqw`;
}

function letterSpacingCqw(
  letterSpacing: number | undefined,
  layoutWidth: number,
): string | undefined {
  if (letterSpacing == null || letterSpacing === 0) return undefined;
  return `${(letterSpacing / layoutWidth) * 100}cqw`;
}

export function CertificateCanvas({
  memberName = "Jonathan Doe",
  memberNumber = "001000",
  backgroundImageUrl,
  layoutKey,
  gradeOrTitle = "First Officer",
  certificateNumber = "DPM-2026-000001",
  issuedAt,
  overlayPositions,
  editable = false,
  selectedField = null,
  onFieldSelect,
  onOverlayPositionsChange,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const overridesRef = useRef<OverlayFieldOverride[] | null>(
    overlayPositions ?? null,
  );
  /** Pointer offset from field anchor so grab does not jump on first move. */
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);
  /** Skip position writes until the pointer actually moves (avoids snap-on-click). */
  const dragMovedRef = useRef(false);
  const [draggingField, setDraggingField] = useState<CertificateOverlayField | null>(
    null,
  );
  const [snapH, setSnapH] = useState(false);
  const [snapV, setSnapV] = useState(false);

  overridesRef.current = overlayPositions ?? null;

  const baseLayout =
    getCertificateLayout(layoutKey) ??
    (backgroundImageUrl ? getCertificateLayout("custom") : null);
  const layout = baseLayout
    ? applyOverlayPositionOverrides(baseLayout, overlayPositions)
    : null;

  const issued =
    issuedAt instanceof Date
      ? issuedAt
      : issuedAt
        ? new Date(issuedAt)
        : new Date();

  const updateFieldPosition = useCallback(
    (field: CertificateOverlayField, x: number, y: number) => {
      if (!baseLayout || !onOverlayPositionsChange) return;
      const snappedX = snapToCenter(clampPercent(x));
      const snappedY = snapToCenter(clampPercent(y));
      setSnapH(Math.abs(snappedX - 50) < 0.01);
      setSnapV(Math.abs(snappedY - 50) < 0.01);
      const next = updateFieldOverride(baseLayout, overridesRef.current, field, {
        x: snappedX,
        y: snappedY,
      });
      overridesRef.current = next;
      onOverlayPositionsChange(next);
    },
    [baseLayout, onOverlayPositionsChange],
  );

  // Arrow-key nudge for the selected field (Shift = fine step).
  useEffect(() => {
    if (!editable || !selectedField || !baseLayout || !onOverlayPositionsChange) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.tagName === "SELECT" ||
          event.target.isContentEditable)
      ) {
        return;
      }

      const step = event.shiftKey ? 0.2 : 1;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -step;
      else if (event.key === "ArrowRight") dx = step;
      else if (event.key === "ArrowUp") dy = -step;
      else if (event.key === "ArrowDown") dy = step;
      else return;

      event.preventDefault();
      const current =
        overridesRef.current?.find((o) => o.field === selectedField) ??
        baseLayout!.fields.find((f) => f.field === selectedField);
      if (!current) return;
      updateFieldPosition(selectedField!, current.x + dx, current.y + dy);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    editable,
    selectedField,
    baseLayout,
    onOverlayPositionsChange,
    updateFieldPosition,
  ]);

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!editable) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    dragOffsetRef.current = null;
    dragMovedRef.current = false;
    setDraggingField(null);
    setSnapH(false);
    setSnapV(false);
  }

  function handleRemoveField(
    event: React.MouseEvent<HTMLButtonElement>,
    field: CertificateOverlayField,
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (!editable || !baseLayout || !onOverlayPositionsChange) return;
    const current = getEffectiveFieldOverrides(baseLayout, overridesRef.current);
    const nextFields = current.map((item) => item.field).filter((f) => f !== field);
    if (!nextFields.length) return;
    const next = setActiveOverlayFields(
      baseLayout,
      overridesRef.current,
      nextFields,
    );
    overridesRef.current = next;
    onOverlayPositionsChange(next);
    if (selectedField === field) {
      onFieldSelect?.(nextFields[0]!);
    }
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLElement>,
    field: CertificateOverlayField,
  ) {
    if (!editable || !canvasRef.current || !baseLayout) return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onFieldSelect?.(field);

    const rect = canvasRef.current.getBoundingClientRect();
    const current =
      getEffectiveFieldOverrides(baseLayout, overridesRef.current).find(
        (o) => o.field === field,
      ) ?? baseLayout.fields.find((f) => f.field === field);

    if (current && rect.width > 0 && rect.height > 0) {
      const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
      const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
      dragOffsetRef.current = {
        dx: pointerX - current.x,
        dy: pointerY - current.y,
      };
    } else {
      dragOffsetRef.current = { dx: 0, dy: 0 };
    }
    dragMovedRef.current = false;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingField(field);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLElement>,
    field: CertificateOverlayField,
  ) {
    if (!editable || draggingField !== field || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const offset = dragOffsetRef.current ?? { dx: 0, dy: 0 };
    const x = ((event.clientX - rect.left) / rect.width) * 100 - offset.dx;
    const y = ((event.clientY - rect.top) / rect.height) * 100 - offset.dy;

    // Require a tiny move before writing so click/select never snaps the field.
    if (!dragMovedRef.current) {
      const current =
        getEffectiveFieldOverrides(baseLayout!, overridesRef.current).find(
          (o) => o.field === field,
        ) ?? baseLayout!.fields.find((f) => f.field === field);
      if (
        current &&
        Math.abs(x - current.x) < 0.25 &&
        Math.abs(y - current.y) < 0.25
      ) {
        return;
      }
      dragMovedRef.current = true;
    }

    updateFieldPosition(field, x, y);
  }

  if (!backgroundImageUrl || !layout) {
    return (
      <div className="cert-png-canvas cert-png-canvas--empty">
        <p>Upload a fillable certificate image to preview overlays.</p>
      </div>
    );
  }

  const values: CertificateOverlayValues = {
    pilotName: memberName,
    gradeOrTitle: gradeOrTitle ?? undefined,
    certificateNumber: certificateNumber ?? "DPM-2026-000001",
    memberNumber: memberNumber ?? "001000",
    issuedAt: issued,
  };

  const canRemoveField = editable && (layout?.fields.length ?? 0) > 1;

  return (
    <div
      ref={canvasRef}
      className={`cert-png-canvas cert-png-canvas--${layout.orientation}${
        editable ? " cert-png-canvas--editable" : ""
      }`}
      style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundImageUrl}
        alt=""
        className="cert-png-canvas-bg"
        draggable={false}
      />
      {editable ? (
        <>
          <span
            className={`cert-png-guide cert-png-guide--v${
              snapV ? " cert-png-guide--active" : ""
            }`}
            aria-hidden
          />
          <span
            className={`cert-png-guide cert-png-guide--h${
              snapH ? " cert-png-guide--active" : ""
            }`}
            aria-hidden
          />
        </>
      ) : null}
      {layout.fields.map((field) => {
        let text = resolveOverlayText(field.field, values);
        if (field.uppercase) text = text.toUpperCase();
        const isDragging = draggingField === field.field;
        const isSelected = selectedField === field.field;
        return (
          <div
            key={field.field}
            className={`cert-png-overlay${
              editable ? " cert-png-overlay--draggable" : ""
            }${isDragging ? " cert-png-overlay--dragging" : ""}${
              isSelected ? " cert-png-overlay--selected" : ""
            }`}
            style={{
              left: `${field.x}%`,
              top: `${field.y}%`,
              width: field.maxWidth ? `${field.maxWidth}%` : undefined,
              transform:
                field.align === "left"
                  ? "translate(0, -50%)"
                  : field.align === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(-50%, -50%)",
              textAlign: field.align ?? "center",
              fontFamily: fontFamilyFor(field.font),
              fontSize: fontSizeCqw(field.fontSize, layout.width),
              fontWeight: field.weight === "bold" ? 700 : 400,
              letterSpacing: letterSpacingCqw(
                field.letterSpacing,
                layout.width,
              ),
              touchAction: editable ? "none" : undefined,
            }}
            title={
              editable
                ? `Drag to move · ${OVERLAY_FIELD_LABELS[field.field]}`
                : undefined
            }
            data-field-label={
              editable ? OVERLAY_FIELD_LABELS[field.field] : undefined
            }
            onPointerDown={(e) => handlePointerDown(e, field.field)}
            onPointerMove={(e) => handlePointerMove(e, field.field)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {canRemoveField ? (
              <button
                type="button"
                className="cert-png-overlay-remove"
                aria-label={`Remove ${OVERLAY_FIELD_LABELS[field.field]}`}
                title="Remove field"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => handleRemoveField(e, field.field)}
              >
                <span aria-hidden="true">X</span>
              </button>
            ) : null}
            <span className="cert-png-overlay-text">{text}</span>
          </div>
        );
      })}
    </div>
  );
}
