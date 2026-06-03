import type { WingAutoRule, WingCategory } from "@/types/wing";

export function getWingCategoryLabel(category: WingCategory): string {
  const labels: Record<WingCategory, string> = {
    milestone: "Milestone",
    trust: "Trust",
    community: "Community",
  };
  return labels[category] ?? category;
}

export function getWingAutoRuleLabel(rule: WingAutoRule | null): string {
  if (!rule) return "None";
  const labels: Record<WingAutoRule, string> = {
    manual_only: "Manual award only",
    first_completed_booking: "First completed booking",
    completed_bookings_count: "Completed bookings (count)",
    five_star_reviews_count: "5-star reviews received (count)",
    approved_verification: "Approved verification (type)",
    has_certificate: "Has platform certificate",
    profile_approved: "Profile approved by admin",
  };
  return labels[rule] ?? rule;
}
