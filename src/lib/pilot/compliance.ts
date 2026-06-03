export const COMPLIANCE_CHECKLIST_ITEMS = [
  {
    id: "valid_license",
    label:
      "I hold a valid remote pilot / drone operator license where required for my operations.",
  },
  {
    id: "insurance",
    label:
      "I maintain applicable insurance for commercial drone operations when required.",
  },
  {
    id: "airspace_rules",
    label:
      "I will comply with local airspace, FAA, and other applicable regulatory requirements.",
  },
  {
    id: "accurate_info",
    label: "The license and profile information I provide is accurate and up to date.",
  },
] as const;

export type ComplianceItemId = (typeof COMPLIANCE_CHECKLIST_ITEMS)[number]["id"];

export function validateComplianceAcknowledgments(
  acknowledged: string[],
): boolean {
  const required = COMPLIANCE_CHECKLIST_ITEMS.map((i) => i.id);
  return required.every((id) => acknowledged.includes(id));
}
