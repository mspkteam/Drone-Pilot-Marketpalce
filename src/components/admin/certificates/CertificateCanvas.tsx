"use client";

import { useCallback, useRef, useState } from "react";
import {
  applyOverlayPositionOverrides,
  formatShortAwardDate,
  getCertificateLayout,
  OVERLAY_FIELD_LABELS,
  overridesFromLayoutFields,
  resolveOverlayText,
  updateFieldOverride,
  type CertificateFieldStyle,
  type CertificateOverlayField,
  type CertificateOverlayValues,
  type OverlayFieldOverride,
} from "@/lib/certificates/layouts";

type CertificateCanvasProps = {
  titleLines: string[];
  mission: string;
  memberName?: string;
  issuedDate?: string;
  verificationId?: string;
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
  switch (style) {
    case "blackletter":
      return '"Old English Text", "Cloister Black", "UnifrakturCook", "Times New Roman", serif';
    case "script":
      return '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';
    case "serif":
      return '"Times New Roman", Times, Georgia, serif';
    case "sans":
    default:
      return '"Helvetica Neue", Helvetica, Arial, sans-serif';
  }
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function snapToCenter(value: number): number {
  if (Math.abs(value - 50) <= SNAP_THRESHOLD) return 50;
  return value;
}

export function CertificateCanvas({
  titleLines,
  mission,
  memberName = "[MEMBER NAME]",
  issuedDate = "2023-11-24",
  verificationId = "#MQ0KSWS7",
  backgroundImageUrl,
  layoutKey,
  gradeOrTitle,
  certificateNumber,
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
      const next = updateFieldOverride(
        baseLayout,
        overridesRef.current,
        field,
        { x: snappedX, y: snappedY },
      );
      overridesRef.current = next;
      onOverlayPositionsChange(next);
    },
    [baseLayout, onOverlayPositionsChange],
  );

  function handlePointerDown(
    event: React.PointerEvent<HTMLSpanElement>,
    field: CertificateOverlayField,
  ) {
    if (!editable || !canvasRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    onFieldSelect?.(field);
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    setDraggingField(field);
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLSpanElement>,
    field: CertificateOverlayField,
  ) {
    if (!editable || draggingField !== field || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    updateFieldPosition(field, x, y);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLSpanElement>) {
    if (!editable) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    setDraggingField(null);
    setSnapH(false);
    setSnapV(false);
  }

  if (backgroundImageUrl && layout) {
    const values: CertificateOverlayValues = {
      pilotName: memberName,
      gradeOrTitle: gradeOrTitle ?? mission,
      certificateNumber: certificateNumber ?? verificationId.replace(/^#/, ""),
      issuedAt: issued,
    };

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
          if (field.field === "issuedAt" && issuedDate && !issuedAt) {
            text = issuedDate.toUpperCase();
          }
          if (field.uppercase) text = text.toUpperCase();
          const isDragging = draggingField === field.field;
          const isSelected = selectedField === field.field;
          return (
            <span
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
                fontSize: `clamp(0.55rem, ${field.fontSize * 0.045}cqw, ${field.fontSize * 0.35}px)`,
                fontWeight: field.weight === "bold" ? 700 : 400,
                letterSpacing: field.letterSpacing
                  ? `${field.letterSpacing}px`
                  : undefined,
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
              {text}
            </span>
          );
        })}
      </div>
    );
  }

  const [lineOne, lineTwo] = titleLines;

  return (
    <div className="cert-canvas">
      <span className="cert-canvas-bracket cert-canvas-bracket--tl" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--tr" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--bl" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--br" aria-hidden />

      <span className="cert-canvas-watermark" aria-hidden>
        <svg viewBox="0 0 24 24" width="200" height="200" fill="none" aria-hidden>
          <path
            d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div className="cert-canvas-frame">
        <span className="cert-canvas-medal" aria-hidden>
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden>
            <path
              d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.2"
            />
          </svg>
        </span>

        <p className="cert-canvas-brand">REMOTE AIR SERVICE</p>

        <div className="cert-canvas-title">
          {lineOne ? <span>{lineOne}</span> : null}
          {lineTwo ? <span>{lineTwo}</span> : null}
        </div>

        <p className="cert-canvas-copy cert-canvas-copy--italic">
          This certifies that
        </p>
        <p className="cert-canvas-member">{memberName}</p>
        <p className="cert-canvas-copy">has successfully completed</p>
        <p className="cert-canvas-mission">{mission}</p>

        <dl className="cert-canvas-meta">
          <div className="cert-canvas-meta-item">
            <dt>ISSUED DATE</dt>
            <dd>{issuedDate}</dd>
          </div>
          <div className="cert-canvas-meta-item cert-canvas-meta-item--right">
            <dt>VERIFICATION ID</dt>
            <dd>{verificationId}</dd>
          </div>
        </dl>
        {gradeOrTitle ? (
          <p className="cert-canvas-mission" style={{ marginTop: "0.5rem" }}>
            {gradeOrTitle}
          </p>
        ) : null}
        <span className="sr-only">{formatShortAwardDate(issued)}</span>
      </div>
    </div>
  );
}
