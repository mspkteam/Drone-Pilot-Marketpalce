import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyWingRequestDocuments,
  getRequestableWingOption,
  isRequestableWingCode,
  parseWingRequestDocuments,
  validateWingRequestSubmit,
  WING_REQUEST_MAX_BYTES,
} from "@/lib/wings/request-wings";

const docs = emptyWingRequestDocuments();
const studentDocs = {
  ...docs,
  iacra: {
    id: "a",
    slot: "iacra" as const,
    storedFileName: "a.pdf",
    originalFileName: "iacra.pdf",
    mimeType: "application/pdf",
    size: 12,
  },
  testScore: {
    id: "b",
    slot: "testScore" as const,
    storedFileName: "b.pdf",
    originalFileName: "score.pdf",
    mimeType: "application/pdf",
    size: 12,
  },
};
const aviatorDocs = {
  ...studentDocs,
  certificate: {
    id: "c",
    slot: "certificate" as const,
    storedFileName: "c.pdf",
    originalFileName: "cert.pdf",
    mimeType: "application/pdf",
    size: 12,
  },
};
const seniorDocs = {
  ...aviatorDocs,
  logbooks: [
    {
      id: "d",
      slot: "logbook" as const,
      storedFileName: "d.pdf",
      originalFileName: "log.pdf",
      mimeType: "application/pdf",
      size: 12,
    },
  ],
};

describe("request wings catalog", () => {
  it("maps Figma wing types to canonical codes", () => {
    assert.equal(isRequestableWingCode("aviator-wings-senior"), true);
    assert.equal(getRequestableWingOption("aviator-wings-master")?.minHours, 1000);
    assert.equal(
      getRequestableWingOption("recreational-aviator-gold")?.seniorMaster,
      false,
    );
  });

  it("parses empty documents JSON", () => {
    const parsed = parseWingRequestDocuments("{}");
    assert.equal(parsed.logbooks.length, 0);
    assert.equal(parsed.iacra, null);
  });
});

describe("request wings submit validation", () => {
  it("allows recreational with name and confirmation only", () => {
    assert.equal(
      validateWingRequestSubmit({
        wingCode: "recreational-aviator-gold",
        legalName: "James Sterling",
        ftn: "",
        totalHours: null,
        notes: "",
        confirmation: true,
        documents: docs,
        awardedWingCodes: new Set(),
      }),
      null,
    );
  });

  it("requires FTN and student evidence", () => {
    const error = validateWingRequestSubmit({
      wingCode: "aviator-wings-basic-silver",
      legalName: "James Sterling",
      ftn: "",
      totalHours: null,
      notes: "",
      confirmation: true,
      documents: docs,
      awardedWingCodes: new Set(),
    });
    assert.match(error ?? "", /FTN/);
  });

  it("requires Aviator Wings before Senior", () => {
    const error = validateWingRequestSubmit({
      wingCode: "aviator-wings-senior",
      legalName: "James Sterling",
      ftn: "",
      totalHours: 650,
      notes: "",
      confirmation: true,
      documents: seniorDocs,
      awardedWingCodes: new Set(),
    });
    assert.match(error ?? "", /Aviator Wings/);
  });

  it("requires 500 hours and logbooks for Senior when Aviator is held", () => {
    assert.equal(
      validateWingRequestSubmit({
        wingCode: "aviator-wings-senior",
        legalName: "James Sterling",
        ftn: "",
        totalHours: 650,
        notes: "",
        confirmation: true,
        documents: seniorDocs,
        awardedWingCodes: new Set(["aviator-wings-basic-gold"]),
      }),
      null,
    );

    const hoursError = validateWingRequestSubmit({
      wingCode: "aviator-wings-senior",
      legalName: "James Sterling",
      ftn: "",
      totalHours: 120,
      notes: "",
      confirmation: true,
      documents: seniorDocs,
      awardedWingCodes: new Set(["aviator-wings-basic-gold"]),
    });
    assert.match(hoursError ?? "", /500/);
  });

  it("keeps the Figma 25 MB upload cap", () => {
    assert.equal(WING_REQUEST_MAX_BYTES, 25 * 1024 * 1024);
  });
});
