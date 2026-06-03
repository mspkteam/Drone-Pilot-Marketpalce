import PDFDocument from "pdfkit";

export type CertificatePdfData = {
  title: string;
  body: string;
  pilotDisplayName: string;
  certificateNumber: string;
  issuedAt: Date;
};

export function renderCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 72 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(10)
      .fillColor("#666666")
      .text("Drone Pilot Marketplace", { align: "center" });
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
        "This certificate is issued by Drone Pilot Marketplace for platform recognition. " +
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
