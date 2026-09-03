import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PILOT_VERIFICATION_DOCUMENTS,
  approvedProfileCredentials,
  catalogTag,
} from "./verification-documents-catalog";
import type { VerificationDto } from "@/types/verification";

function verification(
  partial: Pick<VerificationDto, "type" | "status"> & {
    catalogId?: string;
    notes?: string | null;
  },
): VerificationDto {
  const notes = partial.catalogId
    ? catalogTag(partial.catalogId)
    : (partial.notes ?? null);
  return {
    id: "v1",
    pilotProfileId: "p1",
    type: partial.type,
    documentUrl: null,
    documentFileName: "doc.pdf",
    documentMimeType: "application/pdf",
    originalFileName: "doc.pdf",
    hasUploadedDocument: true,
    notes,
    status: partial.status,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedByUserId: null,
    rejectionReason: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("verification documents catalog", () => {
  it("includes the client license classes for profile display", () => {
    const ids = PILOT_VERIFICATION_DOCUMENTS.filter((d) => d.showOnProfile).map(
      (d) => d.catalogId,
    );
    assert.deepEqual(ids, [
      "faa_part_107",
      "faa_aircraft_registration",
      "easa_c1",
      "easa_c2",
      "easa_c3",
      "easa_sts",
      "easa_lpc",
      "insurance",
      "business_registration",
    ]);
  });

  it("only lists approved profile credentials", () => {
    const creds = approvedProfileCredentials([
      verification({
        type: "license",
        status: "approved",
        catalogId: "faa_part_107",
      }),
      verification({
        type: "other",
        status: "pending",
        catalogId: "easa_c1",
      }),
      verification({
        type: "identity",
        status: "approved",
        catalogId: "government_id",
      }),
    ]);
    assert.deepEqual(
      creds.map((c) => c.title),
      ["FAA Part 107"],
    );
  });
});
