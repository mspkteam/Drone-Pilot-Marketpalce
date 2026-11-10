"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";

type PublicPilotProfilePdfButtonProps = {
  displayName: string;
  className?: string;
};

const CAPTURE_CLASS = "figma-pilot-public--pdf-capture";
const PAGE_BG = "#f5f1e6";

function slugifyName(displayName: string): string {
  return (
    displayName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "pilot"
  );
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not encode profile image."));
    img.src = dataUrl;
  });
}

function waitForCloneImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

/**
 * Capture an off-screen clone so the live page never flashes light theme.
 */
async function captureProfileOffscreen(source: HTMLElement): Promise<string> {
  const width = Math.ceil(source.getBoundingClientRect().width);
  const clone = source.cloneNode(true) as HTMLElement;
  clone.classList.add(CAPTURE_CLASS);
  clone.querySelectorAll("[data-pdf-exclude]").forEach((el) => el.remove());

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-14000px",
    "top:0",
    `width:${width}px`,
    "pointer-events:none",
    "opacity:0",
    "z-index:-1",
  ].join(";");
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await waitForCloneImages(clone);
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    return await toPng(clone, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: PAGE_BG,
      width,
      style: {
        width: `${width}px`,
        transform: "none",
      },
    });
  } finally {
    host.remove();
  }
}

/**
 * Pack content top-to-bottom across pages at full width — no per-page
 * vertical centering (that caused large cream gaps).
 */
async function savePdfFromImage(
  dataUrl: string,
  displayName: string,
): Promise<void> {
  const img = await loadImage(dataUrl);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const scale = usableWidth / img.naturalWidth;
  const scaledHeight = img.naturalHeight * scale;
  const pageCount = Math.max(1, Math.ceil(scaledHeight / usableHeight - 1e-6));
  const srcPageHeight = usableHeight / scale;

  const sliceCanvas = document.createElement("canvas");
  const sliceCtx = sliceCanvas.getContext("2d");
  if (!sliceCtx) {
    throw new Error("Could not prepare PDF pages.");
  }

  for (let page = 0; page < pageCount; page += 1) {
    if (page > 0) pdf.addPage();

    const srcY = Math.floor(page * srcPageHeight);
    const srcH = Math.max(
      1,
      Math.min(
        Math.ceil(srcPageHeight),
        img.naturalHeight - srcY,
      ),
    );

    sliceCanvas.width = img.naturalWidth;
    sliceCanvas.height = srcH;
    sliceCtx.fillStyle = PAGE_BG;
    sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceCtx.drawImage(
      img,
      0,
      srcY,
      img.naturalWidth,
      srcH,
      0,
      0,
      img.naturalWidth,
      srcH,
    );

    const sliceData = sliceCanvas.toDataURL("image/png");
    const drawW = usableWidth;
    const drawH = srcH * scale;

    pdf.setFillColor(245, 241, 230);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    // Top-aligned — fill from the top so leftover space (if any) stays at the bottom only.
    pdf.addImage(
      sliceData,
      "PNG",
      margin,
      margin,
      drawW,
      drawH,
      undefined,
      "FAST",
    );
  }

  pdf.save(`${slugifyName(displayName)}-profile.pdf`);
}

export function PublicPilotProfilePdfButton({
  displayName,
  className,
}: PublicPilotProfilePdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    const root = document.querySelector<HTMLElement>(
      "[data-public-pilot-profile]",
    );
    if (!root) {
      setError("Profile content was not found on the page.");
      setLoading(false);
      return;
    }

    try {
      const dataUrl = await captureProfileOffscreen(root);
      await savePdfFromImage(dataUrl, displayName);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not download the profile PDF.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-[0.875rem] border border-[rgba(216,179,57,0.45)] bg-[rgba(216,179,57,0.1)] px-4 text-sm font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-[rgba(216,179,57,0.16)] hover:text-gold-light disabled:opacity-60"
      >
        <DownloadIcon className="h-4 w-4" />
        {loading ? "Capturing profile…" : "Download PDF"}
      </button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3"
      />
    </svg>
  );
}
