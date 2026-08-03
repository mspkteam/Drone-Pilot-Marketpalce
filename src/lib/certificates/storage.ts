import {
  readPrivateAsset,
  writePrivateAsset,
} from "@/lib/storage/private-asset";

const FOLDER = "certificates";

export async function writeCertificatePdf(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  return writePrivateAsset({
    folder: FOLDER,
    fileName,
    buffer,
    contentType: "application/pdf",
  });
}

export async function readCertificatePdf(pdfFileName: string): Promise<Buffer> {
  return readPrivateAsset(FOLDER, pdfFileName);
}
