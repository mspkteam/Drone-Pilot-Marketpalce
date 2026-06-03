export function formatJobBudget(
  budgetMin: number | null,
  budgetMax: number | null,
  currency: string,
): string | null {
  if (budgetMin != null && budgetMax != null) {
    return `${currency} ${budgetMin.toLocaleString()}–${budgetMax.toLocaleString()}`;
  }
  if (budgetMin != null) {
    return `From ${currency} ${budgetMin.toLocaleString()}`;
  }
  if (budgetMax != null) {
    return `Up to ${currency} ${budgetMax.toLocaleString()}`;
  }
  return null;
}
