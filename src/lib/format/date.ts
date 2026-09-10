export function isoDateFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseIsoDate(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

const US_DATE_LONG: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

const US_DATE_SHORT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const US_DATETIME: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const iso = parseIsoDate(value);
  if (iso) return new Date(iso.year, iso.month - 1, iso.day);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** US display: "September 7, 2026" */
export function formatDisplayDate(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toValidDate(value);
  if (!date) {
    if (typeof value === "string" && value.trim() && !toValidDate(value)) {
      return value.trim();
    }
    return fallback;
  }
  return date.toLocaleDateString("en-US", US_DATE_LONG);
}

/** US compact: "Sep 7, 2026" */
export function formatDisplayDateShort(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-US", US_DATE_SHORT);
}

/** US datetime: "Sep 7, 2026, 3:45 PM" */
export function formatDisplayDateTime(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toValidDate(value);
  if (!date) return fallback;
  return date.toLocaleString("en-US", US_DATETIME);
}

/** ISO calendar date → US long form (replaces former DD/MM/YYYY). */
export function formatIsoDateForDisplay(value: string): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return value.trim();
  return formatDisplayDate(
    new Date(parsed.year, parsed.month - 1, parsed.day),
    value.trim(),
  );
}

export function todayIsoDate(): string {
  const now = new Date();
  return isoDateFromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
};

export function buildCalendarMonth(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month - 1, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - startOffset + 1;
    if (dayIndex < 1) {
      const day = prevMonthDays + dayIndex;
      const calendarMonth = month === 1 ? 12 : month - 1;
      const calendarYear = month === 1 ? year - 1 : year;
      cells.push({
        date: isoDateFromParts(calendarYear, calendarMonth, day),
        day,
        inMonth: false,
      });
    } else if (dayIndex > daysInMonth) {
      const day = dayIndex - daysInMonth;
      const calendarMonth = month === 12 ? 1 : month + 1;
      const calendarYear = month === 12 ? year + 1 : year;
      cells.push({
        date: isoDateFromParts(calendarYear, calendarMonth, day),
        day,
        inMonth: false,
      });
    } else {
      cells.push({
        date: isoDateFromParts(year, month, dayIndex),
        day: dayIndex,
        inMonth: true,
      });
    }
  }

  return cells;
}
