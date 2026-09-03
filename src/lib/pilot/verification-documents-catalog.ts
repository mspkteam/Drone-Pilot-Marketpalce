import type { VerificationDto, VerificationType } from "@/types/verification";

export type PilotDocumentUiStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "missing"
  | "optional";

export type PilotVerificationDocumentDef = {
  catalogId: string;
  title: string;
  description: string;
  apiType: VerificationType;
  optional?: boolean;
  /** Shown on public/profile license lists when approved. */
  showOnProfile?: boolean;
  mockAdminNote?: string;
};

/**
 * Verification upload catalog (pilot Verification tab).
 * License-class docs appear on the profile when approved.
 */
export const PILOT_VERIFICATION_DOCUMENTS: readonly PilotVerificationDocumentDef[] =
  [
    {
      catalogId: "government_id",
      title: "Government ID",
      description: "Passport or driver's license (front + back).",
      apiType: "identity",
      showOnProfile: false,
    },
    {
      catalogId: "faa_part_107",
      title: "FAA Part 107",
      description: "FAA Part 107 Remote Pilot Certificate.",
      apiType: "license",
      showOnProfile: true,
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
      description: "EASA Class C1 remote pilot credential.",
      apiType: "other",
      showOnProfile: true,
    },
    {
      catalogId: "easa_c2",
      title: "EASA C-2 Class",
      description: "EASA Class C2 remote pilot credential.",
      apiType: "other",
      showOnProfile: true,
    },
    {
      catalogId: "easa_c3",
      title: "EASA C-3 Class",
      description: "EASA Class C3 remote pilot credential.",
      apiType: "other",
      showOnProfile: true,
    },
    {
      catalogId: "easa_sts",
      title: "EASA STS Class",
      description: "EASA Specific category STS credential.",
      apiType: "other",
      showOnProfile: true,
    },
    {
      catalogId: "easa_lpc",
      title: "EASA LPC Class",
      description: "EASA Light UAS Pilot Certificate (LPC).",
      apiType: "other",
      showOnProfile: true,
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
};

export function catalogTag(catalogId: string): string {
  return `${CATALOG_TAG_PREFIX}${catalogId}]`;
}

export function matchesCatalog(
  verification: VerificationDto,
  catalogId: string,
  apiType: VerificationType,
): boolean {
  if (verification.type !== apiType) return false;

  if (catalogId === "government_id" && apiType === "identity") return true;
  if (catalogId === "faa_part_107" && apiType === "license") {
    // Legacy uploads used generic license type without a catalog tag.
    if (!verification.notes?.includes(CATALOG_TAG_PREFIX)) return true;
    return (
      verification.notes.includes(catalogTag(catalogId)) ||
      (LEGACY_CATALOG_ALIASES[catalogId] ?? []).some((legacy) =>
        verification.notes!.includes(catalogTag(legacy)),
      )
    );
  }
  if (catalogId === "insurance" && apiType === "insurance") return true;

  if (apiType === "other" || apiType === "license") {
    if (verification.notes?.includes(catalogTag(catalogId))) return true;
    return (LEGACY_CATALOG_ALIASES[catalogId] ?? []).some((legacy) =>
      verification.notes?.includes(catalogTag(legacy)),
    );
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

/** UI fallback matching screenshot when inbox is empty. */
export function mockVerificationDocumentCards(): PilotVerificationDocumentCard[] {
  const statuses: PilotDocumentUiStatus[] = [
    "approved",
    "approved",
    "pending",
    "rejected",
    "missing",
    "optional",
    "missing",
    "missing",
    "optional",
    "optional",
    "optional",
  ];

  return PILOT_VERIFICATION_DOCUMENTS.map((doc, index) => ({
    ...doc,
    verification: null,
    uiStatus: statuses[index] ?? (doc.optional ? "optional" : "missing"),
    adminNote:
      statuses[index] === "rejected" ? doc.mockAdminNote ?? null : null,
  }));
}

export function computeVerificationProgress(
  cards: PilotVerificationDocumentCard[],
): {
  pendingActionCount: number;
  completePct: number;
  pendingActionLabel: string;
} {
  const required = cards.filter((c) => !c.optional);
  const pendingActionCount = required.filter(
    (c) => c.uiStatus === "rejected" || c.uiStatus === "missing",
  ).length;

  const score = required.reduce((sum, card) => {
    if (card.uiStatus === "approved") return sum + 1;
    if (card.uiStatus === "pending") return sum + 0.5;
    return sum;
  }, 0);

  const completePct =
    required.length === 0 ? 0 : Math.round((score / required.length) * 100);

  return {
    pendingActionCount,
    completePct,
    pendingActionLabel: `${pendingActionCount} OF ${cards.length} DOCUMENTS PENDING ACTION`,
  };
}
