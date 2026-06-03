import fs from "fs/promises";
import path from "path";

const CERT_DIR = path.join(process.cwd(), "storage", "certificates");

export function getCertificateStorageDir() {
  return CERT_DIR;
}

export function resolveCertificatePath(pdfFileName: string) {
  const safe = path.basename(pdfFileName);
  return path.join(CERT_DIR, safe);
}

export async function ensureCertificateStorageDir() {
  await fs.mkdir(CERT_DIR, { recursive: true });
}

export async function writeCertificatePdf(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  await ensureCertificateStorageDir();
  const fullPath = resolveCertificatePath(fileName);
  await fs.writeFile(fullPath, buffer);
  return fileName;
}

export async function readCertificatePdf(pdfFileName: string): Promise<Buffer> {
  const fullPath = resolveCertificatePath(pdfFileName);
  return fs.readFile(fullPath);
}
