"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildCalendarMonth,
  formatIsoDateForDisplay,
  parseIsoDate,
  todayIsoDate,
} from "@/lib/format/date";
import { cn } from "@/lib/utils";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type PostProjectDateFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  className?: string;
};

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.25 1.75V4M10.75 1.75V4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getInitialView(value: string): { year: number; month: number } {
  const parsed = parseIsoDate(value);
  if (parsed) return { year: parsed.year, month: parsed.month };

  const today = parseIsoDate(todayIsoDate());
  if (today) return { year: today.year, month: today.month };

  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

const DATE_PICKER_MIN_WIDTH = 18 * 16;
const DATE_PICKER_MAX_WIDTH = 500;

type PopupPosition = {
  top: number;
  left: number;
  width: number;
};

function getPopupPosition(trigger: HTMLButtonElement): PopupPosition {
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(
    Math.max(rect.width, DATE_PICKER_MIN_WIDTH),
    DATE_PICKER_MAX_WIDTH,
  );
  const left = Math.min(rect.left, window.innerWidth - width - 12);
  const estimatedHeight = 320;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openBelow =
    spaceBelow >= estimatedHeight || rect.top < estimatedHeight;

  return {
    left: Math.max(12, left),
    width,
    top: openBelow ? rect.bottom + 8 : rect.top - estimatedHeight - 8,
  };
}

export function PostProjectDateField({
  id,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  minDate = todayIsoDate(),
  className,
}: PostProjectDateFieldProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [view, setView] = useState(() => getInitialView(value));
  const today = todayIsoDate();

  function updatePopupPosition() {
    if (!triggerRef.current) return;
    setPopupPosition(getPopupPosition(triggerRef.current));
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePopupPosition();

    function handleLayoutChange() {
      updatePopupPosition();
    }

    window.addEventListener("resize", handleLayoutChange);
    window.addEventListener("scroll", handleLayoutChange, true);
    return () => {
      window.removeEventListener("resize", handleLayoutChange);
      window.removeEventListener("scroll", handleLayoutChange, true);
    };
  }, [open, view.month, view.year]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (value) {
      const parsed = parseIsoDate(value);
      if (parsed) {
        setView({ year: parsed.year, month: parsed.month });
      }
    }
  }, [value]);

  const displayValue = value ? formatIsoDateForDisplay(value) : "";
  const calendarDays = buildCalendarMonth(view.year, view.month);

  const popup =
    open && popupPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popupRef}
            className="client-post-project-date-popup"
            role="dialog"
            aria-label="Choose date"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
              width: popupPosition.width,
            }}
          >
            <div className="client-post-project-date-popup-header">
              <button
                type="button"
                className="client-post-project-date-nav"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              >
                ‹
              </button>
              <p className="client-post-project-date-month">
                {MONTH_LABELS[view.month - 1]} {view.year}
              </p>
              <button
                type="button"
                className="client-post-project-date-nav"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              >
                ›
              </button>
            </div>

            <div className="client-post-project-date-popup-body">
              <div className="client-post-project-date-weekdays" aria-hidden>
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label} className="client-post-project-date-weekday">
                    {label}
                  </span>
                ))}
              </div>

              <div className="client-post-project-date-grid">
                {calendarDays.map((cell) => {
                  const selected = cell.date === value;
                  const disabled = cell.date < minDate;
                  const isToday = cell.date === today;
                  return (
                    <button
                      key={cell.date}
                      type="button"
                      className={cn(
                        "client-post-project-date-day",
                        !cell.inMonth && "client-post-project-date-day--muted",
                        isToday && "client-post-project-date-day--today",
                        selected && "client-post-project-date-day--selected",
                        disabled && "client-post-project-date-day--disabled",
                      )}
                      disabled={disabled}
                      onClick={() => selectDate(cell.date)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  function shiftMonth(delta: number) {
    setView((current) => {
      let month = current.month + delta;
      let year = current.year;
      while (month < 1) {
        month += 12;
        year -= 1;
      }
      while (month > 12) {
        month -= 12;
        year += 1;
      }
      return { year, month };
    });
  }

  function selectDate(date: string) {
    if (date < minDate) return;
    onChange(date);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("client-post-project-date-field", className)}>
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        className={cn(
          "client-post-project-date-trigger",
          open && "client-post-project-date-trigger--open",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next && triggerRef.current) {
              setPopupPosition(getPopupPosition(triggerRef.current));
            }
            return next;
          });
        }}
      >
        <span
          className={cn(
            "client-post-project-date-value",
            !displayValue && "client-post-project-date-value--placeholder",
          )}
        >
          {displayValue || placeholder}
        </span>
        <span className="client-post-project-date-icon" aria-hidden>
          <CalendarIcon />
        </span>
      </button>

      {popup}
    </div>
  );
}
