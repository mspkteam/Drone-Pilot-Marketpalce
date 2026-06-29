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
  mockAdminNote?: string;
};

export const PILOT_VERIFICATION_DOCUMENTS: readonly PilotVerificationDocumentDef[] =
  [
    {
      catalogId: "government_id",
      title: "Government ID",
      description: "Passport or driver's license (front + back).",
      apiType: "identity",
    },
    {
      catalogId: "faa_license",
      title: "FAA Part 107 License",
      description: "Or EASA equivalent certification.",
      apiType: "license",
    },
    {
      catalogId: "drone_registration",
      title: "Drone Registration",
      description: "Aircraft registration cert.",
      apiType: "other",
    },
    {
      catalogId: "insurance",
      title: "Insurance Certificate",
      description: "Min. $1M liability coverage.",
      apiType: "insurance",
      mockAdminNote:
        "Coverage amount unreadable. Please re-upload a clearer copy.",
    },
    {
      catalogId: "business_registration",
      title: "Business Registration",
      description: "If operating under a company.",
      apiType: "other",
    },
    {
      catalogId: "additional_certifications",
      title: "Additional Certifications",
      description: "BVLOS, night ops, thermal, etc.",
      apiType: "other",
      optional: true,
    },
  ] as const;

export type PilotVerificationDocumentCard = PilotVerificationDocumentDef & {
  uiStatus: PilotDocumentUiStatus;
  verification: VerificationDto | null;
  adminNote: string | null;
};

const CATALOG_TAG_PREFIX = "[catalog:";

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
  if (catalogId === "faa_license" && apiType === "license") return true;
  if (catalogId === "insurance" && apiType === "insurance") return true;
  if (apiType === "other") {
    return verification.notes?.includes(catalogTag(catalogId)) ?? false;
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
    const match = verifications.find((v) => matchesCatalog(v, doc.catalogId, doc.apiType));
    return {
      ...doc,
      verification: match ?? null,
      uiStatus: mapVerificationStatus(match?.status ?? null, Boolean(doc.optional)),
      adminNote: match?.rejectionReason ?? null,
    };
  });
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
