"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AvatarFrameEditorProps = {
  /** Object URL or data URL of the image being adjusted. */
  src: string;
  /** Output size of the cropped square image in px. */
  outputSize?: number;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
};

const FRAME_SIZE = 260;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type Point = { x: number; y: number };

export function AvatarFrameEditor({
  src,
  outputSize = 256,
  onCancel,
  onSave,
}: AvatarFrameEditorProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragState = useRef<{ pointerX: number; pointerY: number; offset: Point } | null>(
    null,
  );

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  // Scale that makes the image fully cover the frame ("cover" behaviour).
  const baseScale = natural
    ? FRAME_SIZE / Math.min(natural.w, natural.h)
    : 1;
  const scale = baseScale * zoom;
  const drawnW = natural ? natural.w * scale : FRAME_SIZE;
  const drawnH = natural ? natural.h * scale : FRAME_SIZE;

  const clampOffset = useCallback(
    (next: Point): Point => {
      const minX = FRAME_SIZE - drawnW;
      const minY = FRAME_SIZE - drawnH;
      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y)),
      };
    },
    [drawnW, drawnH],
  );

  useEffect(() => {
    setOffset((current) => clampOffset(current));
  }, [clampOffset]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const cover = FRAME_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      const w = img.naturalWidth * cover;
      const h = img.naturalHeight * cover;
      // Center the image inside the frame.
      setOffset({ x: (FRAME_SIZE - w) / 2, y: (FRAME_SIZE - h) / 2 });
      setZoom(1);
    };
    img.src = src;
  }, [src]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offset,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.pointerX;
    const dy = event.clientY - dragState.current.pointerY;
    setOffset(
      clampOffset({
        x: dragState.current.offset.x + dx,
        y: dragState.current.offset.y + dy,
      }),
    );
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  }

  function handleSave() {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const k = outputSize / FRAME_SIZE;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      offset.x * k,
      offset.y * k,
      drawnW * k,
      drawnH * k,
    );

    onSave(canvas.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div
      className="avatar-editor-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="avatar-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adjust image"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="avatar-editor-title">Adjust image</h3>
        <p className="avatar-editor-hint">Drag to reposition and use the slider to zoom.</p>

        <div
          className="avatar-editor-frame"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className="avatar-editor-image"
            style={{
              width: drawnW,
              height: drawnH,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
          <div className="avatar-editor-mask" aria-hidden />
        </div>

        <div className="avatar-editor-zoom">
          <span aria-hidden>−</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
          <span aria-hidden>+</span>
        </div>

        <div className="avatar-editor-actions">
          <button
            type="button"
            className="profile-onboarding-btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="profile-onboarding-btn-gold"
            onClick={handleSave}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
