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

export function formatIsoDateForDisplay(value: string): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return value.trim();

  const { year, month, day } = parsed;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
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
