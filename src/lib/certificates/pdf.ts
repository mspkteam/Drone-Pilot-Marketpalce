import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import PDFDocument from "pdfkit";
import {
  CERTIFICATE_FONT_FILE_NAMES,
  type CertificateFontKey,
} from "@/lib/certificates/fonts";
import {
  applyOverlayPositionOverrides,
  getCertificateLayout,
  resolveOverlayText,
  type CertificateLayout,
  type CertificateOverlayValues,
  type OverlayPositionOverride,
} from "@/lib/certificates/layouts";
import { loadCertificateBackground } from "@/lib/certificates/background";

export type CertificatePdfData = {
  title: string;
  body: string;
  pilotDisplayName: string;
  certificateNumber: string;
  issuedAt: Date;
  backgroundImageUrl?: string | null;
  layoutKey?: string | null;
  gradeOrTitle?: string | null;
  memberNumber?: string | null;
  overlayPositions?: OverlayPositionOverride[] | null;
};

const PDF_FONT_NAMES: Record<CertificateFontKey, string> = {
  engravers: "CertEngravers",
  harrowgate: "CertHarrowgate",
  colchester: "CertColchester",
  arial: "CertArial",
};

const PDF_FALLBACK_FONT = "CertArial";
const PDF_FALLBACK_FONT_BOLD = "CertArial-Bold";

function resolveCertificateFontPath(
  key: Exclude<CertificateFontKey, "arial">,
): string | null {
  const fileName = CERTIFICATE_FONT_FILE_NAMES[key];
  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src", "assets", "fonts", fileName),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "fonts", fileName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function registerCertificateFonts(doc: PDFKit.PDFDocument): void {
  const engraversPath = resolveCertificateFontPath("engravers");
  const pairs: Array<[Exclude<CertificateFontKey, "arial">, string]> = [
    ["engravers", "CertEngravers"],
    ["harrowgate", "CertHarrowgate"],
    ["colchester", "CertColchester"],
  ];
  for (const [key, name] of pairs) {
    const fontPath = resolveCertificateFontPath(key);
    if (fontPath) {
      try {
        doc.registerFont(name, fontPath);
      } catch {
        // Skip missing font files.
      }
    }
  }

  // Never use PDFKit built-in Helvetica (requires .afm files missing in Next bundles).
  const sansPath = engraversPath ?? resolveCertificateFontPath("colchester");
  if (sansPath) {
    try {
      doc.registerFont("CertArial", sansPath);
      doc.registerFont("CertArial-Bold", sansPath);
    } catch {
      // registerFont throws if path invalid.
    }
  }
}

function pdfFontFor(key: CertificateFontKey, weight?: "normal" | "bold"): string {
  if (key === "arial") {
    return weight === "bold" ? PDF_FALLBACK_FONT_BOLD : PDF_FALLBACK_FONT;
  }
  return PDF_FONT_NAMES[key];
}

function applyPdfFont(
  doc: PDFKit.PDFDocument,
  key: CertificateFontKey,
  weight?: "normal" | "bold",
): void {
  const candidates = [
    pdfFontFor(key, weight),
    weight === "bold" ? PDF_FALLBACK_FONT_BOLD : PDF_FALLBACK_FONT,
    "CertEngravers",
    "CertColchester",
  ];
  for (const fontName of candidates) {
    try {
      doc.font(fontName);
      return;
    } catch {
      // Try next embedded font.
    }
  }
  throw new Error("No certificate fonts could be loaded for PDF generation.");
}

function imageFormatFromUrl(
  backgroundImageUrl: string,
): "png" | "jpeg" | "webp" {
  const lower = backgroundImageUrl.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpeg";
  if (lower.endsWith(".webp")) return "webp";
  return "png";
}

type ResolvedBackground = {
  data: Buffer;
  format: "png" | "jpeg" | "webp";
};

function resolvePublicPngPath(backgroundImageUrl: string): string | null {
  const cleaned = backgroundImageUrl.replace(/^\//, "");
  const absolute = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    cleaned,
  );
  return fs.existsSync(absolute) ? absolute : null;
}

async function resolveBackgroundForPdf(
  backgroundImageUrl: string | null | undefined,
  layout: CertificateLayout | null,
): Promise<ResolvedBackground | null> {
  if (!backgroundImageUrl || !layout) return null;

  const format = imageFormatFromUrl(backgroundImageUrl);
  const localPath = resolvePublicPngPath(backgroundImageUrl);
  if (localPath) {
    try {
      const data = await fsPromises.readFile(localPath);
      return { data, format };
    } catch {
      // Fall through to HTTP fetch (Vercel CDN).
    }
  }

  const buffer = await loadCertificateBackground(backgroundImageUrl);
  if (!buffer) return null;
  return { data: buffer, format };
}

function pageSizeFor(
  orientation: "landscape" | "portrait",
): [number, number] {
  return orientation === "landscape" ? [792, 612] : [612, 792];
}

export async function renderCertificatePdf(
  data: CertificatePdfData,
): Promise<Buffer> {
  const base = getCertificateLayout(data.layoutKey);
  const layout = base
    ? applyOverlayPositionOverrides(base, data.overlayPositions)
    : null;
  const background = await resolveBackgroundForPdf(
    data.backgroundImageUrl,
    layout,
  );

  if (background && layout) {
    return renderPngCertificatePdf(data, background, layout);
  }

  if (layout && data.backgroundImageUrl) {
    throw new Error(
      `Certificate background could not be loaded: ${data.backgroundImageUrl}`,
    );
  }

  return renderPlainCertificatePdf(data);
}

function renderPngCertificatePdf(
  data: CertificatePdfData,
  background: ResolvedBackground,
  layout: CertificateLayout,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const size = pageSizeFor(layout.orientation);
    const doc = new PDFDocument({ size, margin: 0 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    registerCertificateFonts(doc);

    const pageW = size[0];
    const pageH = size[1];

    try {
      // PDFKit requires `format` when the image source is a Buffer (Vercel / fetch path).
      if (background.format === "webp") {
        reject(
          new Error(
            "WebP certificate backgrounds are not supported for PDF export. Re-upload as PNG.",
          ),
        );
        return;
      }
      doc.image(
        background.data,
        0,
        0,
        {
          width: pageW,
          height: pageH,
          format: background.format,
        } as PDFKit.Mixins.ImageOption,
      );
    } catch (error) {
      reject(error);
      return;
    }

    const values: CertificateOverlayValues = {
      pilotName: data.pilotDisplayName,
      gradeOrTitle: data.gradeOrTitle ?? undefined,
      certificateNumber: data.certificateNumber,
      memberNumber: data.memberNumber ?? undefined,
      issuedAt: data.issuedAt,
    };

    const scale = pageW / layout.width;

    for (const field of layout.fields) {
      let text = resolveOverlayText(field.field, values);
      if (field.uppercase) text = text.toUpperCase();

      const fontSize = Math.max(6, field.fontSize * scale);
      const xCenter = (field.x / 100) * pageW;
      const yCenter = (field.y / 100) * pageH;
      const maxW = field.maxWidth
        ? (field.maxWidth / 100) * pageW
        : pageW * 0.7;

      let x = xCenter;
      const align = field.align ?? "center";
      if (align === "center") x = xCenter - maxW / 2;
      else if (align === "right") x = xCenter - maxW;
      else x = xCenter;

      applyPdfFont(doc, field.font, field.weight);

      doc.fontSize(fontSize).fillColor("#111111");

      const textOpts: PDFKit.Mixins.TextOptions = {
        width: maxW,
        align,
        lineBreak: false,
        ...(field.letterSpacing
          ? { characterSpacing: field.letterSpacing }
          : {}),
      };
      // Match CSS translateY(-50%): center the text block on the saved Y%.
      const textHeight = doc.heightOfString(text, textOpts);
      doc.text(text, x, yCenter - textHeight / 2, textOpts);
    }

    doc.end();
  });
}

function renderPlainCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 72 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    registerCertificateFonts(doc);
    applyPdfFont(doc, "arial");

    doc
      .fontSize(10)
      .fillColor("#666666")
      .text("Remote Air Service", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(26).fillColor("#1a1a1a").text(data.title, { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#333333")
      .text(`Certificate No. ${data.certificateNumber}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).fillColor("#1a1a1a").text(data.body, {
      align: "left",
      lineGap: 6,
    });
    doc.moveDown(2);

    doc
      .fontSize(11)
      .fillColor("#666666")
      .text(
        `Issued to: ${data.pilotDisplayName}\nDate: ${data.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        { align: "center" },
      );

    doc.moveDown(3);
    doc
      .fontSize(9)
      .fillColor("#999999")
      .text(
        "This certificate is issued by Remote Air Service for platform recognition. " +
          "It does not replace government licensing requirements.",
        { align: "center" },
      );

    doc.end();
  });
}

export function applyTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
