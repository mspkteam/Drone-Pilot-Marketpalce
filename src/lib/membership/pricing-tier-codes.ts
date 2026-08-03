/** Maps DB tier codes (A1_STUDENT, …) to pricing card codes (A-1, …). */
export const TIER_CODE_TO_PRICING_PLAN_CODE: Record<string, string> = {
  A1_STUDENT: "A-1",
  A2_JUNIOR_FLIGHT_OFFICER: "A-2",
  A3_FLIGHT_OFFICER: "A-3",
  A4_SENIOR_FLIGHT_OFFICER: "A-4",
  A5_FIRST_OFFICER: "A-5",
  A6_CAPTAIN: "A-6",
  A7_SENIOR_CAPTAIN: "A-7",
  A8_MASTER_CAPTAIN: "A-8",
  A9_FLEET_CAPTAIN: "A-9",
  A10_COMMODORE: "A-10",
};

export const RECOMMENDED_PRICING_PLAN_CODE = "A-4";
