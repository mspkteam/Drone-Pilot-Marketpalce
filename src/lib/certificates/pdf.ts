import path from "node:path";
import fs from "node:fs";
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
  arial: "Helvetica",
};

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
        // Fall back to Helvetica if register fails
      }
    }
  }
}

function pdfFontFor(key: CertificateFontKey, weight?: "normal" | "bold"): string {
  if (key === "arial") {
    return weight === "bold" ? "Helvetica-Bold" : "Helvetica";
  }
  return PDF_FONT_NAMES[key];
}

function resolvePublicPngPath(backgroundImageUrl: string): string | null {
  const cleaned = backgroundImageUrl.replace(/^\//, "");
  const absolute = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    cleaned,
  );
  return fs.existsSync(absolute) ? absolute : null;
}

function pageSizeFor(
  orientation: "landscape" | "portrait",
): [number, number] {
  return orientation === "landscape" ? [792, 612] : [612, 792];
}

export function renderCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const base = getCertificateLayout(data.layoutKey);
  const layout = base
    ? applyOverlayPositionOverrides(base, data.overlayPositions)
    : null;
  const pngPath =
    data.backgroundImageUrl && layout
      ? resolvePublicPngPath(data.backgroundImageUrl)
      : null;

  if (pngPath && layout) {
    return renderPngCertificatePdf(data, pngPath, layout);
  }

  return renderPlainCertificatePdf(data);
}

function renderPngCertificatePdf(
  data: CertificatePdfData,
  pngPath: string,
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
    doc.image(pngPath, 0, 0, { width: pageW, height: pageH });

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

      let fontName = pdfFontFor(field.font, field.weight);
      try {
        doc.font(fontName);
      } catch {
        fontName = field.weight === "bold" ? "Helvetica-Bold" : "Helvetica";
        doc.font(fontName);
      }

      doc
        .fontSize(fontSize)
        .fillColor("#111111")
        .text(text, x, yCenter - fontSize / 2, {
          width: maxW,
          align,
          lineBreak: false,
        });
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
