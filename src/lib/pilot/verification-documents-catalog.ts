import type { VerificationDto, VerificationType } from "@/types/verification";

export type PilotDocumentUiStatus =
  | "approved"
  | "pending"
  | "amendments_required"
  | "rejected"
  | "missing"
  | "optional";

export type PilotLicensePath = "faa" | "easa";

export type PilotVerificationDocumentDef = {
  catalogId: string;
  title: string;
  description: string;
  apiType: VerificationType;
  optional?: boolean;
  /** Shown on public/profile license lists when approved. */
  showOnProfile?: boolean;
  /** Which license path shows this card. Omit = always visible. */
  licensePath?: PilotLicensePath;
  mockAdminNote?: string;
};

/**
 * Verification upload catalog (pilot Verification tab).
 * A-4+ unlock requires: Government ID (front + back), pilot certificate
 * (FAA Part 107 OR any EASA), and aircraft registration.
 */
export const PILOT_VERIFICATION_DOCUMENTS: readonly PilotVerificationDocumentDef[] =
  [
    {
      catalogId: "government_id_front",
      title: "Government ID — Front",
      description: "Front of passport or driver’s license.",
      apiType: "identity",
      showOnProfile: false,
    },
    {
      catalogId: "government_id_back",
      title: "Government ID — Back",
      description: "Back of passport or driver’s license.",
      apiType: "identity",
      showOnProfile: false,
    },
    {
      catalogId: "faa_part_107",
      title: "FAA Part 107",
      description: "FAA Part 107 Remote Pilot Certificate.",
      apiType: "license",
      showOnProfile: true,
      licensePath: "faa",
    },
    {
      catalogId: "faa_aircraft_registration",
      title: "FAA Aircraft Registration",
      description: "FAA aircraft / drone registration certificate.",
      apiType: "other",
      showOnProfile: true,
    },
    {
      catalogId: "easa_c1",
      title: "EASA C-1 Class",
      description: "EASA Class C1 remote pilot credential. Upload any one EASA credential for the EASA path.",
      apiType: "other",
      optional: true,
      showOnProfile: true,
      licensePath: "easa",
    },
    {
      catalogId: "easa_c2",
      title: "EASA C-2 Class",
      description: "EASA Class C2 remote pilot credential.",
      apiType: "other",
      optional: true,
      showOnProfile: true,
      licensePath: "easa",
    },
    {
      catalogId: "easa_c3",
      title: "EASA C-3 Class",
      description: "EASA Class C3 remote pilot credential.",
      apiType: "other",
      optional: true,
      showOnProfile: true,
      licensePath: "easa",
    },
    {
      catalogId: "easa_sts",
      title: "EASA STS Class",
      description: "EASA Specific category STS credential.",
      apiType: "other",
      optional: true,
      showOnProfile: true,
      licensePath: "easa",
    },
    {
      catalogId: "easa_lpc",
      title: "EASA LPC Class",
      description: "EASA Light UAS Pilot Certificate (LPC).",
      apiType: "other",
      optional: true,
      showOnProfile: true,
      licensePath: "easa",
    },
    {
      catalogId: "insurance",
      title: "Insurance Certificate",
      description: "Min. $1M liability coverage.",
      apiType: "insurance",
      optional: true,
      showOnProfile: true,
      mockAdminNote:
        "Coverage amount unreadable. Please re-upload a clearer copy.",
    },
    {
      catalogId: "business_registration",
      title: "Business Registration",
      description: "If operating under a company.",
      apiType: "other",
      optional: true,
      showOnProfile: true,
    },
    {
      catalogId: "additional_certifications",
      title: "Additional Certifications",
      description: "BVLOS, night ops, thermal, etc.",
      apiType: "other",
      optional: true,
      showOnProfile: false,
    },
  ] as const;

export type PilotVerificationDocumentCard = PilotVerificationDocumentDef & {
  uiStatus: PilotDocumentUiStatus;
  verification: VerificationDto | null;
  adminNote: string | null;
};

const CATALOG_TAG_PREFIX = "[catalog:";

/** Legacy catalog ids remapped after client naming updates. */
const LEGACY_CATALOG_ALIASES: Record<string, string[]> = {
  faa_part_107: ["faa_license"],
  faa_aircraft_registration: ["drone_registration"],
  government_id_front: ["government_id"],
};

export const EASA_CATALOG_IDS = [
  "easa_c1",
  "easa_c2",
  "easa_c3",
  "easa_sts",
  "easa_lpc",
] as const;

export const LICENSE_PATH_STORAGE_KEY = "ras-pilot-license-path";

export function catalogTag(catalogId: string): string {
  return `${CATALOG_TAG_PREFIX}${catalogId}]`;
}

export function catalogIdFromNotes(
  notes: string | null | undefined,
): string | null {
  if (!notes) return null;
  const match = notes.match(/\[catalog:([^\]]+)\]/);
  return match?.[1]?.trim() || null;
}

export function isLicensePath(value: string | null | undefined): value is PilotLicensePath {
  return value === "faa" || value === "easa";
}

export function isCatalogVisibleForPath(
  doc: PilotVerificationDocumentDef,
  path: PilotLicensePath,
): boolean {
  if (!doc.licensePath) return true;
  return doc.licensePath === path;
}

export function matchesCatalog(
  verification: VerificationDto,
  catalogId: string,
  apiType: VerificationType,
): boolean {
  if (verification.type !== apiType) return false;

  const aliases = LEGACY_CATALOG_ALIASES[catalogId] ?? [];
  const tagged =
    verification.notes?.includes(catalogTag(catalogId)) ||
    aliases.some((legacy) => verification.notes?.includes(catalogTag(legacy)));

  if (apiType === "identity") {
    if (tagged) return true;
    // Legacy untagged identity uploads count as the front side only.
    if (
      catalogId === "government_id_front" &&
      !verification.notes?.includes(CATALOG_TAG_PREFIX)
    ) {
      return true;
    }
    return false;
  }

  if (catalogId === "faa_part_107" && apiType === "license") {
    if (!verification.notes?.includes(CATALOG_TAG_PREFIX)) return true;
    return Boolean(tagged);
  }
  if (catalogId === "insurance" && apiType === "insurance") return true;

  if (apiType === "other" || apiType === "license") {
    return Boolean(tagged);
  }
  return false;
}

function mapVerificationStatus(
  status: VerificationDto["status"] | null,
  optional: boolean,
): PilotDocumentUiStatus {
  if (!status) return optional ? "optional" : "missing";
  switch (status) {
    case "approved":
      return "approved";
    case "pending":
      return "pending";
    case "amendments_required":
      return "amendments_required";
    case "rejected":
    case "expired":
      return "rejected";
    default:
      return optional ? "optional" : "missing";
  }
}

export function mapVerificationsToDocumentCards(
  verifications: VerificationDto[],
): PilotVerificationDocumentCard[] {
  return PILOT_VERIFICATION_DOCUMENTS.map((doc) => {
    const match = verifications.find((v) =>
      matchesCatalog(v, doc.catalogId, doc.apiType),
    );
    return {
      ...doc,
      verification: match ?? null,
      uiStatus: mapVerificationStatus(
        match?.status ?? null,
        Boolean(doc.optional),
      ),
      adminNote: match?.rejectionReason ?? null,
    };
  });
}

/** Approved license/credential titles for profile & public display. */
export function approvedProfileCredentials(
  verifications: VerificationDto[],
): Array<{ catalogId: string; title: string }> {
  return mapVerificationsToDocumentCards(verifications)
    .filter((card) => card.showOnProfile && card.uiStatus === "approved")
    .map((card) => ({ catalogId: card.catalogId, title: card.title }));
}

export function approvedProfileLicenseLabels(
  verifications: VerificationDto[],
): string[] {
  return approvedProfileCredentials(verifications).map((c) => c.title);
}

function unitStatus(status: PilotDocumentUiStatus | undefined): PilotDocumentUiStatus {
  return status ?? "missing";
}

function isUnitSatisfied(status: PilotDocumentUiStatus): boolean {
  return status === "approved" || status === "pending";
}

function isUnitPendingAction(status: PilotDocumentUiStatus): boolean {
  return (
    status === "missing" ||
    status === "rejected" ||
    status === "amendments_required"
  );
}

function easaGroupStatus(
  cards: PilotVerificationDocumentCard[],
): PilotDocumentUiStatus {
  const easa = cards.filter((c) =>
    (EASA_CATALOG_IDS as readonly string[]).includes(c.catalogId),
  );
  if (easa.some((c) => c.uiStatus === "approved")) return "approved";
  if (easa.some((c) => c.uiStatus === "pending")) return "pending";
  if (easa.some((c) => c.uiStatus === "amendments_required")) {
    return "amendments_required";
  }
  if (easa.some((c) => c.uiStatus === "rejected")) return "rejected";
  return "missing";
}

/**
 * A-4+ progress uses only: ID front, ID back, aircraft registration,
 * and pilot certificate (FAA Part 107 XOR any EASA credential).
 */
export function computeVerificationProgress(
  cards: PilotVerificationDocumentCard[],
  licensePath: PilotLicensePath = "faa",
): {
  pendingActionCount: number;
  completePct: number;
  pendingActionLabel: string;
  requiredUnitCount: number;
} {
  const byId = new Map(cards.map((c) => [c.catalogId, c]));
  const pilotCertStatus =
    licensePath === "faa"
      ? unitStatus(byId.get("faa_part_107")?.uiStatus)
      : easaGroupStatus(cards);

  const requiredStatuses: PilotDocumentUiStatus[] = [
    unitStatus(byId.get("government_id_front")?.uiStatus),
    unitStatus(byId.get("government_id_back")?.uiStatus),
    unitStatus(byId.get("faa_aircraft_registration")?.uiStatus),
    pilotCertStatus,
  ];

  const pendingActionCount = requiredStatuses.filter(isUnitPendingAction).length;
  const score = requiredStatuses.reduce((sum, status) => {
    if (status === "approved") return sum + 1;
    if (status === "pending") return sum + 0.5;
    return sum;
  }, 0);
  const requiredUnitCount = requiredStatuses.length;
  const completePct = Math.round((score / requiredUnitCount) * 100);

  return {
    pendingActionCount,
    completePct,
    pendingActionLabel: `${pendingActionCount} OF ${requiredUnitCount} REQUIRED DOCUMENTS PENDING ACTION`,
    requiredUnitCount,
  };
}

/** UI fallback matching screenshot when inbox is empty. */
export function mockVerificationDocumentCards(): PilotVerificationDocumentCard[] {
  return PILOT_VERIFICATION_DOCUMENTS.map((doc) => ({
    ...doc,
    verification: null,
    uiStatus: doc.optional ? "optional" : "missing",
    adminNote: null,
  }));
}
