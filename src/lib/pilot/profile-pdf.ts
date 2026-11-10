import PDFDocument from "pdfkit";
import {
  formatPilotLocation,
  formatPilotRateRange,
  formatServiceRadius,
} from "@/lib/pilot/format";
import type { PublicPilotProfileDto } from "@/types/public-pilot";

/** Letter usable band with 40pt side margins. */
const PAGE = {
  left: 40,
  right: 572,
  width: 532,
} as const;

const GOLD = "#b8962e";
const INK = "#141414";
const MUTED = "#5c5c5c";
const RULE = "#d8b339";
const PANEL = "#f6f3e8";
const HEADER = "#111111";

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function joinLimited(items: string[], maxItems: number, maxChars: number): string {
  if (items.length === 0) return "—";
  const limited = items.slice(0, maxItems).map((item) => truncate(item, 44));
  let line = limited.join(" · ");
  if (items.length > maxItems) line += ` · +${items.length - maxItems} more`;
  return truncate(line, maxChars);
}

function drawLabel(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
): number {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(text.toUpperCase(), x, y, {
    width,
    lineBreak: false,
  });
  return y + 13;
}

function drawBody(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  opts?: { size?: number; color?: string; height?: number },
): number {
  doc.font("Helvetica").fontSize(opts?.size ?? 9).fillColor(opts?.color ?? INK);
  doc.text(text, x, y, {
    width,
    height: opts?.height,
    ellipsis: true,
    lineGap: 1.25,
  });
  return doc.y;
}

/**
 * Single-page public pilot profile PDF (Letter only).
 * Content is height-capped and never adds a second page.
 */
export function renderPublicPilotProfilePdf(
  pilot: PublicPilotProfileDto,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      info: {
        Title: `${pilot.displayName} — Pilot Profile`,
        Author: "Remote Air Service",
        Subject: "Public pilot profile (single page)",
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Guard: never create another page (single-page export).
    const originalAddPage = doc.addPage.bind(doc);
    doc.addPage = ((..._args: unknown[]) => {
      console.warn("Profile PDF refused to add a second page.");
      return doc;
    }) as typeof doc.addPage;

    const location = formatPilotLocation(
      pilot.locationCity,
      pilot.locationRegion,
      pilot.locationCountry,
    );
    const rate =
      formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax) ?? "—";
    const radius = formatServiceRadius(pilot.serviceRadiusKm) ?? "—";
    const role = pilot.instructorListed
      ? "Remote Pilot Instructor"
      : "Licensed Pilot";
    const ratingLine =
      pilot.averageRating != null && pilot.reviewCount > 0
        ? `${pilot.averageRating.toFixed(1)} / 5 · ${pilot.reviewCount} review${
            pilot.reviewCount === 1 ? "" : "s"
          }`
        : "No public reviews yet";

    // Canvas
    doc.rect(0, 0, 612, 792).fill("#ffffff");
    doc.rect(0, 0, 612, 98).fill(HEADER);
    doc.rect(PAGE.left, 114, PAGE.width, 58).fill(PANEL);

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(GOLD)
      .text("REMOTE AIR SERVICE", PAGE.left, 26, {
        width: PAGE.width,
        lineBreak: false,
      });
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#cfcfcf")
      .text("PUBLIC PILOT PROFILE  ·  SINGLE PAGE", PAGE.left, 40, {
        width: PAGE.width,
        lineBreak: false,
      });
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#ffffff")
      .text(truncate(pilot.displayName, 36), PAGE.left, 56, {
        width: 340,
        lineBreak: false,
      });

    const headerMeta = [
      role,
      pilot.callSign ? truncate(pilot.callSign, 24) : null,
      pilot.licenseCountry ? `Licensed in ${pilot.licenseCountry}` : null,
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#d0d0d0")
      .text(headerMeta, PAGE.right - 210, 64, {
        width: 210,
        align: "right",
        lineBreak: false,
      });

    // Snapshot strip
    const snapY = 126;
    const snapCols = [
      { label: "Location", value: truncate(location, 34) },
      { label: "Hourly rate", value: truncate(rate, 26) },
      { label: "Service radius", value: truncate(radius, 26) },
      { label: "Rating", value: truncate(ratingLine, 30) },
    ];
    const snapW = PAGE.width / snapCols.length;
    snapCols.forEach((col, i) => {
      const x = PAGE.left + i * snapW + 8;
      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(GOLD)
        .text(col.label.toUpperCase(), x, snapY, {
          width: snapW - 16,
          lineBreak: false,
        });
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(INK)
        .text(col.value, x, snapY + 15, {
          width: snapW - 16,
          lineBreak: false,
        });
    });

    // Two-column body
    const colGap = 28;
    const colW = (PAGE.width - colGap) / 2;
    const leftX = PAGE.left;
    const rightX = PAGE.left + colW + colGap;
    let leftY = 192;
    let rightY = 192;

    leftY = drawLabel(doc, "About", leftX, leftY, colW);
    leftY =
      drawBody(
        doc,
        pilot.bio ? truncate(pilot.bio, 280) : "No biography provided.",
        leftX,
        leftY,
        colW,
        { height: 52 },
      ) + 12;

    if (pilot.languages.length > 0) {
      leftY = drawLabel(doc, "Languages", leftX, leftY, colW);
      leftY =
        drawBody(doc, joinLimited(pilot.languages, 8, 140), leftX, leftY, colW, {
          height: 22,
        }) + 12;
    }

    if (pilot.membership) {
      leftY = drawLabel(doc, "Membership", leftX, leftY, colW);
      leftY =
        drawBody(
          doc,
          truncate(
            `${pilot.membership.tierName} (${pilot.membership.tierCode})`,
            58,
          ),
          leftX,
          leftY,
          colW,
          { height: 18 },
        ) + 12;
    }

    if (pilot.highestWing) {
      leftY = drawLabel(doc, "Highest wing", leftX, leftY, colW);
      leftY =
        drawBody(doc, truncate(pilot.highestWing.title, 64), leftX, leftY, colW, {
          height: 18,
        }) + 12;
    }

    leftY = drawLabel(doc, "Services", leftX, leftY, colW);
    leftY =
      drawBody(doc, joinLimited(pilot.serviceLabels, 8, 200), leftX, leftY, colW, {
        height: 44,
      }) + 12;

    leftY = drawLabel(doc, "Equipment", leftX, leftY, colW);
    leftY = drawBody(
      doc,
      `Drones: ${joinLimited(pilot.mainDrones, 5, 150)}`,
      leftX,
      leftY,
      colW,
      { height: 26 },
    );
    leftY = drawBody(
      doc,
      `Payloads: ${joinLimited(pilot.payloads, 5, 150)}`,
      leftX,
      leftY + 2,
      colW,
      { height: 26 },
    );

    rightY = drawLabel(doc, "Digital wings", rightX, rightY, colW);
    rightY =
      drawBody(
        doc,
        joinLimited(
          pilot.wings.map((w) => w.title),
          7,
          240,
        ),
        rightX,
        rightY,
        colW,
        { height: 64 },
      ) + 14;

    rightY = drawLabel(doc, "Verifications", rightX, rightY, colW);
    rightY =
      drawBody(
        doc,
        joinLimited(
          pilot.approvedCredentials.map((c) => c.title),
          7,
          240,
        ),
        rightX,
        rightY,
        colW,
        { height: 52 },
      ) + 14;

    rightY = drawLabel(doc, "Certificates", rightX, rightY, colW);
    rightY =
      drawBody(
        doc,
        joinLimited(
          pilot.certificates.map((c) => c.templateName),
          7,
          240,
        ),
        rightX,
        rightY,
        colW,
        { height: 52 },
      ) + 14;

    if (pilot.recentReviews[0]?.comment) {
      const review = pilot.recentReviews[0];
      rightY = drawLabel(doc, "Featured review", rightX, rightY, colW);
      drawBody(
        doc,
        truncate(
          `${review.rating}/5 · ${review.authorLabel}: ${review.comment}`,
          200,
        ),
        rightX,
        rightY,
        colW,
        { height: 44, color: MUTED },
      );
    }

    // Footer locked to page bottom
    doc
      .moveTo(PAGE.left, 742)
      .lineTo(PAGE.right, 742)
      .strokeColor(RULE)
      .lineWidth(1)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(
        `Single-page profile · Generated ${new Date().toLocaleString("en-US", {
          timeZone: "America/Chicago",
        })} CST · Remote Air Service`,
        PAGE.left,
        752,
        { width: PAGE.width, align: "center", lineBreak: false },
      );

    // Restore and finish (one page only).
    doc.addPage = originalAddPage;
    doc.end();
  });
}

export function publicPilotProfilePdfFileName(displayName: string): string {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${slug || "pilot-profile"}-profile.pdf`;
}
