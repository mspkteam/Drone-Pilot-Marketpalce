export const INSTRUCTOR_MEMBERSHIP_DISCOUNT_RATE = 0.2;
export const INSTRUCTOR_STUDENT_UNIFORM_DISCOUNT_RATE = 0.15;

export const INSTRUCTOR_AWARDABLE_WING_CODES = [
  "aviator-wings-basic-silver",
  "aviator-wings-basic-gold",
] as const;

export type InstructorAwardableWingCode =
  (typeof INSTRUCTOR_AWARDABLE_WING_CODES)[number];

export const INSTRUCTOR_WING_REQUEST_STATUSES = [
  "pending",
  "awarded",
  "needs_info",
] as const;

export type InstructorWingRequestStatus =
  (typeof INSTRUCTOR_WING_REQUEST_STATUSES)[number];

export const INSTRUCTOR_WING_LABELS: Record<InstructorAwardableWingCode, string> =
  {
    "aviator-wings-basic-gold": "Gold Basic Wings",
    "aviator-wings-basic-silver": "Silver Pilot Wings",
  };

export function isInstructorAwardableWingCode(
  code: string,
): code is InstructorAwardableWingCode {
  return (INSTRUCTOR_AWARDABLE_WING_CODES as readonly string[]).includes(code);
}

export function isInstructorWingRequestStatus(
  status: string,
): status is InstructorWingRequestStatus {
  return (INSTRUCTOR_WING_REQUEST_STATUSES as readonly string[]).includes(
    status,
  );
}

export function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

export function instructorMembershipDiscountUsd(baseFeeUsd: number): number {
  return roundUsd(baseFeeUsd * INSTRUCTOR_MEMBERSHIP_DISCOUNT_RATE);
}

export function studentUniformDiscountUsd(amount: number): number {
  return roundUsd(amount * INSTRUCTOR_STUDENT_UNIFORM_DISCOUNT_RATE);
}

export function normalizeInstructorDiscountCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function initialsFromDisplayName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const letters = parts
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "PI";
}

export function buildInstructorDiscountCode(
  displayName: string,
  uniqueSuffix?: string,
): string {
  const initials = initialsFromDisplayName(displayName);
  const base = `INSTRUCTOR-${initials}20`;
  if (!uniqueSuffix) return base;
  return `${base}-${uniqueSuffix.replace(/[^A-Z0-9]/gi, "").slice(-4).toUpperCase()}`;
}

export function isStudentUniformDiscountItem(input: {
  name: string;
  slug: string;
  requiredWingCode: string | null;
}): boolean {
  const haystack =
    `${input.name} ${input.slug} ${input.requiredWingCode ?? ""}`.toLowerCase();
  if (input.requiredWingCode && isInstructorAwardableWingCode(input.requiredWingCode)) {
    return true;
  }
  return haystack.includes("epaulette") || haystack.includes("wing");
}
