import type { WingAutoRule, WingCategory } from "@/types/wing";
import { getWingConditionDefinition } from "@/lib/wings/conditions";

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
  return getWingConditionDefinition(rule)?.label ?? rule;
}
