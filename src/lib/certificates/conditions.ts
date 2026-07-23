/**
 * Auto-issue conditions for certificate templates.
 * Keep in sync with evaluateAndIssueCertificates in certificate.ts.
 */

export const CERTIFICATE_AUTO_RULES = [
  "manual_only",
  "grade_promotion_a1_a5",
  "grade_captain_a6",
  "wing_recreational",
  "wing_aviator",
  "hours_or_perfect_contracts_senior",
  "hours_or_perfect_contracts_master",
] as const;

export type CertificateAutoRule = (typeof CERTIFICATE_AUTO_RULES)[number];

export type CertificateConditionDefinition = {
  rule: CertificateAutoRule;
  label: string;
  description: string;
  selectable: boolean;
  defaultThreshold?: number;
  thresholdLabel?: string;
};

export const CERTIFICATE_CONDITION_CATALOG: CertificateConditionDefinition[] = [
  {
    rule: "manual_only",
    label: "Manual award only",
    description: "Admin issues this certificate to a specific pilot. No automatic grant.",
    selectable: false,
  },
  {
    rule: "grade_promotion_a1_a5",
    label: "Grade promotion (A-1–A-5)",
    description:
      "Issued when the pilot’s active grade is A-1 through A-5. One certificate per grade reached.",
    selectable: true,
  },
  {
    rule: "grade_captain_a6",
    label: "Promotion to Captain (A-6)",
    description: "Issued when the pilot reaches A-6 Captain.",
    selectable: true,
  },
  {
    rule: "wing_recreational",
    label: "Recreational / UAS wing earned",
    description:
      "Issued when the pilot has been awarded a recreational / UAS recognition wing.",
    selectable: true,
  },
  {
    rule: "wing_aviator",
    label: "Aviator / Remote Pilot wing earned",
    description:
      "Issued when the pilot has been awarded an Aviator / basic Remote Pilot wing.",
    selectable: true,
  },
  {
    rule: "hours_or_perfect_contracts_senior",
    label: "Senior milestone (500h or 5 perfect contracts)",
    description:
      "500 remote flight hours OR five completed RAS contracts with a 5★ client rating.",
    selectable: true,
    defaultThreshold: 500,
    thresholdLabel: "Minimum flight hours (OR use 5 perfect contracts)",
  },
  {
    rule: "hours_or_perfect_contracts_master",
    label: "Master milestone (1,000h or 10 perfect contracts)",
    description:
      "1,000 remote flight hours OR ten completed RAS contracts with a 5★ client rating.",
    selectable: true,
    defaultThreshold: 1000,
    thresholdLabel: "Minimum flight hours (OR use 10 perfect contracts)",
  },
];

export function isCertificateAutoRule(value: unknown): value is CertificateAutoRule {
  return (
    typeof value === "string" &&
    (CERTIFICATE_AUTO_RULES as readonly string[]).includes(value)
  );
}

export function getCertificateConditionLabel(rule: string | null | undefined): string {
  const found = CERTIFICATE_CONDITION_CATALOG.find((c) => c.rule === rule);
  return found?.label ?? "Manual / admin issue";
}

/** Grade codes treated as A-1…A-5 for Certificate of Promotion. */
export const PROMOTION_GRADE_CODES = [
  "A1_STUDENT",
  "A2_JUNIOR_FLIGHT_OFFICER",
  "A3_FLIGHT_OFFICER",
  "A4_SENIOR_FLIGHT_OFFICER",
  "A5_FIRST_OFFICER",
] as const;

export const GRADE_DISPLAY_TITLES: Record<string, string> = {
  A1_STUDENT: "Student",
  A2_JUNIOR_FLIGHT_OFFICER: "Junior Flight Officer",
  A3_FLIGHT_OFFICER: "Flight Officer",
  A4_SENIOR_FLIGHT_OFFICER: "Senior Flight Officer",
  A5_FIRST_OFFICER: "First Officer",
  A6_CAPTAIN: "CAPTAIN",
};
