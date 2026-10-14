/**
 * Sidebar "Rank progress" — progress through the current membership year
 * toward the next grade cycle (not profile-completion strength).
 *
 * A brand-new pilot on day 0 shows ~0%; profile fill does not inflate this bar.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeRankProgressPct(input: {
  currentPeriodStart?: string | Date | null;
  currentPeriodEnd?: string | Date | null;
  now?: Date;
}): number {
  const startRaw = input.currentPeriodStart;
  const endRaw = input.currentPeriodEnd;
  if (!startRaw || !endRaw) return 0;

  const start = startRaw instanceof Date ? startRaw : new Date(startRaw);
  const end = endRaw instanceof Date ? endRaw : new Date(endRaw);
  const now = input.now ?? new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const spanMs = end.getTime() - start.getTime();
  if (spanMs <= 0) return 0;

  const elapsedMs = now.getTime() - start.getTime();
  if (elapsedMs <= 0) return 0;

  // Floor to whole days so a brand-new account stays at 0% on day one.
  const elapsedDays = Math.floor(elapsedMs / MS_PER_DAY);
  const totalDays = Math.max(1, Math.round(spanMs / MS_PER_DAY));
  const pct = Math.round((elapsedDays / totalDays) * 100);
  return Math.min(100, Math.max(0, pct));
}
