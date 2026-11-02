import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PILOT_VERIFICATION_DOCUMENTS,
  approvedProfileCredentials,
  catalogTag,
  computeVerificationProgress,
  isCatalogVisibleForPath,
  mapVerificationsToDocumentCards,
  matchesCatalog,
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

  it("splits government ID into front and back slots", () => {
    const ids = PILOT_VERIFICATION_DOCUMENTS.filter((d) =>
      d.catalogId.startsWith("government_id"),
    ).map((d) => d.catalogId);
    assert.deepEqual(ids, ["government_id_front", "government_id_back"]);
  });

  it("keeps FAA Part 107 on the FAA path and EASA on the EASA path", () => {
    const faa = PILOT_VERIFICATION_DOCUMENTS.find(
      (d) => d.catalogId === "faa_part_107",
    );
    const easa = PILOT_VERIFICATION_DOCUMENTS.find(
      (d) => d.catalogId === "easa_c1",
    );
    assert.equal(faa?.licensePath, "faa");
    assert.equal(easa?.licensePath, "easa");
    assert.equal(isCatalogVisibleForPath(faa!, "faa"), true);
    assert.equal(isCatalogVisibleForPath(faa!, "easa"), false);
    assert.equal(isCatalogVisibleForPath(easa!, "easa"), true);
    assert.equal(isCatalogVisibleForPath(easa!, "faa"), false);
  });

  it("maps front and back identity uploads independently", () => {
    const front = verification({
      type: "identity",
      status: "pending",
      catalogId: "government_id_front",
    });
    const back = verification({
      type: "identity",
      status: "pending",
      catalogId: "government_id_back",
    });
    assert.equal(matchesCatalog(front, "government_id_front", "identity"), true);
    assert.equal(matchesCatalog(front, "government_id_back", "identity"), false);
    assert.equal(matchesCatalog(back, "government_id_back", "identity"), true);
    assert.equal(matchesCatalog(back, "government_id_front", "identity"), false);
  });

  it("treats legacy untagged identity as government ID front only", () => {
    const legacy = verification({
      type: "identity",
      status: "pending",
      notes: "Driver license scan",
    });
    assert.equal(
      matchesCatalog(legacy, "government_id_front", "identity"),
      true,
    );
    assert.equal(
      matchesCatalog(legacy, "government_id_back", "identity"),
      false,
    );
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
        catalogId: "government_id_front",
      }),
    ]);
    assert.deepEqual(
      creds.map((c) => c.title),
      ["FAA Part 107"],
    );
  });

  it("A-4+ progress counts only ID, pilot cert, and aircraft registration", () => {
    const cards = mapVerificationsToDocumentCards([]);
    const faaEmpty = computeVerificationProgress(cards, "faa");
    assert.equal(faaEmpty.requiredUnitCount, 4);
    assert.equal(faaEmpty.pendingActionCount, 4);
    assert.equal(faaEmpty.completePct, 0);

    const withFront = mapVerificationsToDocumentCards([
      verification({
        type: "identity",
        status: "pending",
        catalogId: "government_id_front",
      }),
    ]);
    const mid = computeVerificationProgress(withFront, "faa");
    assert.equal(mid.pendingActionCount, 3);
    assert.equal(mid.completePct, 13);

    const withEasa = mapVerificationsToDocumentCards([
      verification({
        type: "identity",
        status: "approved",
        catalogId: "government_id_front",
      }),
      verification({
        type: "identity",
        status: "approved",
        catalogId: "government_id_back",
      }),
      verification({
        type: "other",
        status: "pending",
        catalogId: "easa_c2",
      }),
      verification({
        type: "other",
        status: "approved",
        catalogId: "faa_aircraft_registration",
      }),
      verification({
        type: "insurance",
        status: "approved",
        catalogId: "insurance",
      }),
    ]);
    const easaProgress = computeVerificationProgress(withEasa, "easa");
    assert.equal(easaProgress.pendingActionCount, 0);
    assert.equal(easaProgress.completePct, 88);

    const faaIgnoresEasa = computeVerificationProgress(withEasa, "faa");
    assert.equal(faaIgnoresEasa.pendingActionCount, 1);
  });
});
