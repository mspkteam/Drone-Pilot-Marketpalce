export const REQUESTABLE_WING_CODES = [
  "recreational-aviator-gold",
  "aviator-wings-basic-silver",
  "aviator-wings-basic-gold",
  "aviator-wings-senior",
  "aviator-wings-master",
] as const;

export type RequestableWingCode = (typeof REQUESTABLE_WING_CODES)[number];

export const AVIATOR_WING_REQUEST_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
] as const;

export type AviatorWingRequestStatus =
  (typeof AVIATOR_WING_REQUEST_STATUSES)[number];

export const WING_REQUEST_FILE_SLOTS = [
  "iacra",
  "testScore",
  "certificate",
  "logbook",
] as const;

export type WingRequestFileSlot = (typeof WING_REQUEST_FILE_SLOTS)[number];

export const AVIATOR_PREREQUISITE_WING_CODE = "aviator-wings-basic-gold";

export const WING_REQUEST_MAX_BYTES = 25 * 1024 * 1024;

export const WING_REQUEST_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type WingRequestMimeType =
  (typeof WING_REQUEST_ALLOWED_MIME_TYPES)[number];

export const WING_REQUEST_MIME_TO_EXT: Record<WingRequestMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type WingRequestFileMeta = {
  id: string;
  slot: Exclude<WingRequestFileSlot, "logbook"> | "logbook";
  storedFileName: string;
  originalFileName: string;
  mimeType: string;
  size: number;
};

export type WingRequestDocuments = {
  iacra: WingRequestFileMeta | null;
  testScore: WingRequestFileMeta | null;
  certificate: WingRequestFileMeta | null;
  logbooks: WingRequestFileMeta[];
};

export type RequestableWingOption = {
  code: RequestableWingCode;
  label: string;
  labelLines: [string, string?];
  imageSrc: string;
  imageAlt: string;
  studentOnly: boolean;
  aviatorPlus: boolean;
  seniorMaster: boolean;
  minHours: number | null;
  prerequisiteWingCode: RequestableWingCode | null;
  prerequisiteLabel: string;
  minimumRequirement: string;
  evidence: string[];
};

export const REQUESTABLE_WING_OPTIONS: readonly RequestableWingOption[] = [
  {
    code: "recreational-aviator-gold",
    label: "Recreational Pilot Wings",
    labelLines: ["Recreational", "Pilot Wings"],
    imageSrc: "/wings/request/recreational.png",
    imageAlt: "Recreational Pilot Wings",
    studentOnly: false,
    aviatorPlus: false,
    seniorMaster: false,
    minHours: null,
    prerequisiteWingCode: null,
    prerequisiteLabel: "None",
    minimumRequirement: "May be requested immediately",
    evidence: [
      "No additional documents are required for Recreational Pilot Wings.",
      "Remote Aircrew Wings are awarded automatically after membership approval.",
      "Name on this request must match the pilot profile.",
    ],
  },
  {
    code: "aviator-wings-basic-silver",
    label: "Student Aviator Wings",
    labelLines: ["Student Aviator", "Wings"],
    imageSrc: "/wings/request/student.png",
    imageAlt: "Student Aviator Wings",
    studentOnly: true,
    aviatorPlus: false,
    seniorMaster: false,
    minHours: null,
    prerequisiteWingCode: null,
    prerequisiteLabel: "None",
    minimumRequirement: "FTN + IACRA + passing Part 107 test score",
    evidence: [
      "FAA Tracking Number (FTN) is required.",
      "Upload IACRA profile proof and the passing Knowledge Test score form.",
      "EASA equivalent documents may substitute for FAA Part 107.",
    ],
  },
  {
    code: "aviator-wings-basic-gold",
    label: "Aviator Wings",
    labelLines: ["Aviator Wings"],
    imageSrc: "/wings/request/aviator.png",
    imageAlt: "Aviator Wings",
    studentOnly: false,
    aviatorPlus: true,
    seniorMaster: false,
    minHours: null,
    prerequisiteWingCode: null,
    prerequisiteLabel: "None",
    minimumRequirement: "Verified permanent Part 107 certificate",
    evidence: [
      "Permanent card only — temporary certificates are not accepted.",
      "Admin may verify this through the FAA Airmen Registry.",
      "EASA equivalent certificates are accepted.",
    ],
  },
  {
    code: "aviator-wings-senior",
    label: "Senior Aviator Wings",
    labelLines: ["Senior Aviator Wings"],
    imageSrc: "/wings/request/senior.png",
    imageAlt: "Senior Aviator Wings",
    studentOnly: false,
    aviatorPlus: true,
    seniorMaster: true,
    minHours: 500,
    prerequisiteWingCode: "aviator-wings-basic-gold",
    prerequisiteLabel: "Aviator Wings Awarded",
    minimumRequirement: "500 verified remote aircraft flight hours",
    evidence: [
      "Logbooks must match the pilot profile.",
      "Only hours accumulated while holding a Part 107 Certificate count.",
      "Multiple logs from multiple drones are allowed.",
    ],
  },
  {
    code: "aviator-wings-master",
    label: "Master Aviator Wings",
    labelLines: ["Master Aviator", "Wings"],
    imageSrc: "/wings/request/master.png",
    imageAlt: "Master Aviator Wings",
    studentOnly: false,
    aviatorPlus: true,
    seniorMaster: true,
    minHours: 1000,
    prerequisiteWingCode: "aviator-wings-basic-gold",
    prerequisiteLabel: "Aviator Wings Awarded",
    minimumRequirement: "1,000 verified remote aircraft flight hours",
    evidence: [
      "Logbooks must match the pilot profile.",
      "Only hours accumulated while holding a Part 107 Certificate count.",
      "Multiple logs from multiple drones are allowed.",
    ],
  },
];

export const WING_REQUEST_ELIGIBILITY = [
  "Recreational Pilot: no special requirements",
  "Student Aviator: FTN + IACRA + passing Part 107 test score",
  "Aviator: verified permanent Part 107 certificate",
  "Senior Aviator: must already hold Aviator Wings + 500 flight hours + logbooks",
  "Master Aviator: must already hold Aviator Wings + 1,000 flight hours + logbooks",
] as const;

export const WING_REQUEST_RULES = [
  "Name on records must match the pilot profile",
  "Records that appear manipulated, altered, manufactured, or illegible may be denied",
  "Only reputable digital, hardware-based, or legible handwritten logbooks are accepted",
  "FAA certificate may be verified through the official FAA Airmen Registry Search Tool",
  "Senior/Master records must include only hours earned while holding a Part 107 Certificate",
] as const;

export const WING_REQUEST_STEPS = [
  "Submit your wings request",
  "Administrator reviews your records",
  "Documentation and hours are verified",
  "Approved wings certificate is auto-generated with name/date and delivered to your profile and inbox",
] as const;

export function isRequestableWingCode(
  code: string,
): code is RequestableWingCode {
  return (REQUESTABLE_WING_CODES as readonly string[]).includes(code);
}

export function isAviatorWingRequestStatus(
  status: string,
): status is AviatorWingRequestStatus {
  return (AVIATOR_WING_REQUEST_STATUSES as readonly string[]).includes(status);
}

export function isWingRequestFileSlot(
  slot: string,
): slot is WingRequestFileSlot {
  return (WING_REQUEST_FILE_SLOTS as readonly string[]).includes(slot);
}

export function getRequestableWingOption(
  code: string,
): RequestableWingOption | null {
  return REQUESTABLE_WING_OPTIONS.find((option) => option.code === code) ?? null;
}

export function emptyWingRequestDocuments(): WingRequestDocuments {
  return {
    iacra: null,
    testScore: null,
    certificate: null,
    logbooks: [],
  };
}

export function parseWingRequestDocuments(raw: string | null | undefined): WingRequestDocuments {
  const empty = emptyWingRequestDocuments();
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<WingRequestDocuments>;
    return {
      iacra: parsed.iacra ?? null,
      testScore: parsed.testScore ?? null,
      certificate: parsed.certificate ?? null,
      logbooks: Array.isArray(parsed.logbooks) ? parsed.logbooks : [],
    };
  } catch {
    return empty;
  }
}

export function serializeWingRequestDocuments(
  documents: WingRequestDocuments,
): string {
  return JSON.stringify(documents);
}

export type WingRequestSubmitInput = {
  wingCode: string;
  legalName: string;
  ftn: string;
  totalHours: number | null;
  notes: string;
  confirmation: boolean;
  documents: WingRequestDocuments;
  awardedWingCodes: ReadonlySet<string>;
};

export function validateWingRequestSubmit(
  input: WingRequestSubmitInput,
): string | null {
  if (!isRequestableWingCode(input.wingCode)) {
    return "Select a valid wing type.";
  }

  const option = getRequestableWingOption(input.wingCode);
  if (!option) return "Select a valid wing type.";

  if (!input.legalName.trim()) {
    return "Pilot name is required.";
  }

  if (!input.confirmation) {
    return "Confirm that uploaded records are accurate, legible, and belong to you.";
  }

  if (option.studentOnly) {
    if (!input.ftn.trim()) {
      return "FAA Tracking Number (FTN) is required for Student Aviator Wings.";
    }
    if (!input.documents.iacra) {
      return "Upload IACRA profile proof for Student Aviator Wings.";
    }
    if (!input.documents.testScore) {
      return "Upload the Part 107 Knowledge Test score form for Student Aviator Wings.";
    }
  }

  if (option.aviatorPlus && !input.documents.certificate) {
    return "Upload a permanent Part 107 Remote Pilot Certificate (or EASA equivalent).";
  }

  if (option.seniorMaster) {
    if (
      input.totalHours == null ||
      !Number.isFinite(input.totalHours) ||
      input.totalHours < (option.minHours ?? 0)
    ) {
      return `Total remote flight hours must be at least ${option.minHours?.toLocaleString()} for ${option.label}.`;
    }
    if (input.documents.logbooks.length === 0) {
      return "Upload at least one logbook for Senior or Master Aviator Wings.";
    }
    if (
      option.prerequisiteWingCode &&
      !input.awardedWingCodes.has(option.prerequisiteWingCode)
    ) {
      return "Award Aviator Wings before requesting Senior or Master Aviator Wings.";
    }
  }

  return null;
}

export function isAllowedWingRequestMime(
  mime: string,
): mime is WingRequestMimeType {
  return (WING_REQUEST_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function validateWingRequestFileBuffer(
  buffer: Buffer,
  mime: string,
): { ok: true; mime: WingRequestMimeType } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > WING_REQUEST_MAX_BYTES) {
    return { ok: false, error: "File must be 25 MB or smaller." };
  }
  if (!isAllowedWingRequestMime(mime)) {
    return { ok: false, error: "Allowed types: PDF, JPEG, PNG, or WebP." };
  }
  return { ok: true, mime };
}
