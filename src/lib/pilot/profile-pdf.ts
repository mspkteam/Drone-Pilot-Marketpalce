import path from "node:path";
import fs from "node:fs";
import PDFDocument from "pdfkit";
import { formatDisplayDateShort } from "@/lib/format/date";
import {
  formatPilotLocation,
  formatPilotRateRange,
  formatServiceRadius,
} from "@/lib/pilot/format";
import type { PublicPilotProfileDto } from "@/types/public-pilot";

const FONT_NAME = "ProfileSans";
const FONT_BOLD = "ProfileSans-Bold";

function resolveSansFontPath(): string | null {
  const fileNames = ["colchester.ttf", "engravers-mt.ttf", "harrowgate.ttf"];
  const roots = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src", "assets", "fonts"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "fonts"),
  ];
  for (const root of roots) {
    for (const fileName of fileNames) {
      const candidate = path.join(root, fileName);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function registerProfileFonts(doc: PDFKit.PDFDocument): void {
  const fontPath = resolveSansFontPath();
  if (!fontPath) {
    throw new Error("No embedded fonts available for profile PDF generation.");
  }
  doc.registerFont(FONT_NAME, fontPath);
  doc.registerFont(FONT_BOLD, fontPath);
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.85);
  doc.font(FONT_BOLD).fontSize(11).fillColor("#8a6d1a").text(title.toUpperCase());
  doc
    .moveTo(doc.page.margins.left, doc.y + 2)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
    .strokeColor("#d8b339")
    .lineWidth(0.8)
    .stroke();
  doc.moveDown(0.55);
  doc.font(FONT_NAME).fontSize(10).fillColor("#1a1a1a");
}

function bulletList(doc: PDFKit.PDFDocument, items: string[]): void {
  if (items.length === 0) {
    doc.fillColor("#666666").text("—");
    return;
  }
  for (const item of items) {
    doc.fillColor("#1a1a1a").text(`•  ${item}`, {
      indent: 4,
      paragraphGap: 2,
    });
  }
}

function ensureSpace(doc: PDFKit.PDFDocument, needed = 72): void {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

/**
 * Render a downloadable PDF that mirrors the public pilot profile content.
 */
export function renderPublicPilotProfilePdf(
  pilot: PublicPilotProfileDto,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
      info: {
        Title: `${pilot.displayName} — Pilot Profile`,
        Author: "Remote Air Service",
        Subject: "Public pilot profile export",
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      registerProfileFonts(doc);
    } catch (error) {
      reject(error);
      return;
    }

    const location = formatPilotLocation(
      pilot.locationCity,
      pilot.locationRegion,
      pilot.locationCountry,
    );
    const rate =
      formatPilotRateRange(pilot.hourlyRateMin, pilot.hourlyRateMax) ?? "—";
    const radius = formatServiceRadius(pilot.serviceRadiusKm) ?? "—";

    doc.font(FONT_NAME).fontSize(9).fillColor("#8a6d1a");
    doc.text("REMOTE AIR SERVICE", { align: "left" });
    doc.fontSize(8).fillColor("#666666").text("Public Pilot Profile", {
      align: "left",
    });
    doc.moveDown(0.8);

    doc.font(FONT_BOLD).fontSize(22).fillColor("#111111").text(pilot.displayName);
    if (pilot.callSign) {
      doc
        .moveDown(0.2)
        .font(FONT_NAME)
        .fontSize(11)
        .fillColor("#8a6d1a")
        .text(pilot.callSign.toUpperCase());
    }
    doc
      .moveDown(0.35)
      .font(FONT_NAME)
      .fontSize(10)
      .fillColor("#444444")
      .text(
        [
          pilot.instructorListed ? "Remote Pilot Instructor" : "Licensed pilot",
          pilot.licenseCountry ? `Licensed in ${pilot.licenseCountry}` : null,
          location,
        ]
          .filter(Boolean)
          .join("  ·  "),
      );

    if (pilot.bio) {
      doc.moveDown(0.7).fontSize(10).fillColor("#1a1a1a").text(pilot.bio, {
        lineGap: 3,
      });
    }
    if (pilot.languages.length > 0) {
      doc
        .moveDown(0.4)
        .fillColor("#444444")
        .text(`Languages: ${pilot.languages.join(" · ")}`);
    }

    ensureSpace(doc);
    sectionTitle(doc, "At a glance");
    doc.text(`Hourly rate: ${rate}`);
    doc.text(`Service radius: ${radius}`);
    if (pilot.averageRating != null && pilot.reviewCount > 0) {
      doc.text(
        `Rating: ${pilot.averageRating.toFixed(1)} / 5 (${pilot.reviewCount} review${
          pilot.reviewCount === 1 ? "" : "s"
        })`,
      );
    }
    if (pilot.membership) {
      doc.text(
        `Membership: ${pilot.membership.tierName} (${pilot.membership.tierCode})`,
      );
    }
    if (pilot.highestWing) {
      doc.text(`Highest wing: ${pilot.highestWing.title}`);
    }

    if (pilot.serviceLabels.length > 0) {
      ensureSpace(doc);
      sectionTitle(doc, "Services");
      bulletList(doc, pilot.serviceLabels);
    }

    if (pilot.wings.length > 0) {
      ensureSpace(doc);
      sectionTitle(doc, "Digital wings");
      bulletList(
        doc,
        pilot.wings.map((w) => w.title),
      );
    }

    if (pilot.approvedCredentials.length > 0) {
      ensureSpace(doc);
      sectionTitle(doc, "Verifications");
      bulletList(
        doc,
        pilot.approvedCredentials.map((c) => c.title),
      );
    }

    if (pilot.certificates.length > 0) {
      ensureSpace(doc);
      sectionTitle(doc, "Certificates");
      bulletList(
        doc,
        pilot.certificates.map(
          (c) =>
            `${c.templateName} — ${c.certificateNumber} (${formatDisplayDateShort(
              c.issuedAt,
            )})`,
        ),
      );
    }

    if (pilot.mainDrones.length > 0 || pilot.payloads.length > 0) {
      ensureSpace(doc);
      sectionTitle(doc, "Equipment");
      if (pilot.mainDrones.length > 0) {
        doc.font(FONT_BOLD).text("Drones");
        doc.font(FONT_NAME);
        bulletList(doc, pilot.mainDrones);
        doc.moveDown(0.3);
      }
      if (pilot.payloads.length > 0) {
        doc.font(FONT_BOLD).text("Payloads");
        doc.font(FONT_NAME);
        bulletList(doc, pilot.payloads);
      }
    }

    if (pilot.recentReviews.length > 0) {
      ensureSpace(doc, 100);
      sectionTitle(doc, "Recent reviews");
      for (const review of pilot.recentReviews) {
        ensureSpace(doc, 64);
        doc
          .font(FONT_BOLD)
          .fillColor("#1a1a1a")
          .text(
            `${review.rating}/5 · ${review.authorLabel} · ${formatDisplayDateShort(
              review.createdAt,
            )}`,
          );
        if (review.comment) {
          doc
            .font(FONT_NAME)
            .fillColor("#333333")
            .text(review.comment, { lineGap: 2 });
        }
        doc.moveDown(0.45);
      }
    }

    doc.moveDown(1.2);
    doc
      .font(FONT_NAME)
      .fontSize(8)
      .fillColor("#888888")
      .text(
        `Generated ${new Date().toLocaleString("en-US", {
          timeZone: "America/Chicago",
        })} CST · Remote Air Service public pilot profile`,
        { align: "center" },
      );

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
