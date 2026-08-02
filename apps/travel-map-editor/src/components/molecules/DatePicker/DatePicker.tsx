import "./DatePicker.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  ANCHORED_PANEL_VARIANTS,
  useAnchoredMenu,
} from "../../../hooks/anchoredMenu";

const WEEKDAY_COUNT = 7;
const CALENDAR_CELLS = 42;

/**
 * Splits an authored value into its date and time halves.
 * @param {string} [value] - A YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 * @returns {[string, string]} The date and time parts
 */
function splitValue(value?: string): [string, string] {
  const [datePart = "", timePart = ""] = (value ?? "").split("T");
  return [datePart, timePart];
}

/**
 * Formats a date as the local YYYY-MM-DD the dataset stores. Built by hand
 * rather than through toISOString, which would shift the day for anyone east
 * or west of UTC.
 * @param {Date} date - The date to format
 * @returns {string} The local calendar date
 */
function toLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Lists the weekday initials in the viewer's locale, starting on their first
 * day of the week.
 * @param {number} firstDay - The locale's first weekday, 0 for Sunday
 * @returns {string[]} Short weekday labels
 */
function weekdayLabels(firstDay: number): string[] {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  // 2024-01-07 was a Sunday, giving a stable base for weekday ordering.
  return Array.from({ length: WEEKDAY_COUNT }, (_unused, index) =>
    formatter.format(new Date(2024, 0, 7 + ((firstDay + index) % 7))),
  );
}

/**
 * Resolves the locale's first day of the week, defaulting to Monday where the
 * platform cannot say.
 * @returns {number} The first weekday, 0 for Sunday
 */
function firstDayOfWeek(): number {
  const locale = new Intl.Locale(navigator.language);
  const info = (
    locale as Intl.Locale & { getWeekInfo?: () => { firstDay: number } }
  ).getWeekInfo?.();
  // getWeekInfo reports 1-7 with 7 for Sunday; the calendar grid wants 0-6.
  return info ? info.firstDay % 7 : 1;
}

/**
 * Builds the 6x7 grid of days covering a month, including the padding days
 * from its neighbours.
 * @param {Date} month - Any date within the month to render
 * @param {number} firstDay - The locale's first weekday
 * @returns {Date[]} The grid cells, in order
 */
function monthGrid(month: Date, firstDay: number): Date[] {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (start.getDay() - firstDay + WEEKDAY_COUNT) % WEEKDAY_COUNT;
  start.setDate(start.getDate() - offset);

  return Array.from({ length: CALENDAR_CELLS }, (_unused, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

/**
 * DatePicker component
 * A calendar field. The native date input is replaced because its rendering
 * cannot be themed, and a trip's dates are compared side by side often enough
 * that a real calendar reads faster than three spinboxes. Time is optional and
 * only exists to order several stops within one calendar day.
 * @component
 * @param {DatePickerProps} props
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {(value: string | undefined) => void} props.onChange - Value change callback
 * @param {boolean} [props.withTime=true] - Whether a time-of-day can be set
 * @param {string} [props.value] - Current YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 * @returns {ReactNode} The date field
 */
export function DatePicker({
  hint,
  label,
  onChange,
  value,
  withTime = true,
}: DatePickerProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const controlRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [datePart, timePart] = splitValue(value);
  const selected = datePart ? new Date(`${datePart}T00:00:00`) : null;
  const [month, setMonth] = useState(() => selected ?? new Date());
  const position = useAnchoredMenu(controlRef, isOpen);
  const firstDay = firstDayOfWeek();
  const today = toLocalDate(new Date());

  // A calendar that stays open after a click elsewhere feels stuck, and Escape
  // is the expected way out of any popup.
  useEffect(() => {
    if (!isOpen) return;

    /**
     * Closes the calendar when the interaction lands outside it.
     * @param {PointerEvent} event - The originating pointer event
     * @returns {void}
     */
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Node;
      if (
        controlRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    }

    /**
     * Closes the calendar on Escape.
     * @param {KeyboardEvent} event - The originating keyboard event
     * @returns {void}
     */
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /**
   * Recombines the date and time parts into one authored value.
   * @param {string} nextDate - Date portion
   * @param {string} nextTime - Time portion
   * @returns {void}
   */
  function emit(nextDate: string, nextTime: string): void {
    if (!nextDate) {
      onChange(undefined);
      return;
    }
    onChange(
      nextTime && nextTime !== "00:00" ? `${nextDate}T${nextTime}` : nextDate,
    );
  }

  /**
   * Moves the visible month.
   * @param {number} delta - Months to move by
   * @returns {void}
   */
  function shiftMonth(delta: number): void {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }
  const formattedValue = selected
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        selected,
      )
    : "";
  return (
    <div className="editor-field date-picker">
      <span className="editor-field__label">{label}</span>
      <div className="date-picker__control" ref={controlRef}>
        <button
          aria-expanded={isOpen}
          aria-label={`${label}${formattedValue ? `, ${formattedValue}` : ""}`}
          className={classNames(
            "editor-field__control",
            "date-picker__trigger",
            !formattedValue && "date-picker__trigger--empty",
          )}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="date-picker__icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            viewBox="0 0 24 24"
          >
            <rect height="16" rx="2.5" width="18" x="3" y="5" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          <span className="date-picker__value">
            {formattedValue || t("datePicker.pickADate")}
          </span>
          {timePart ? (
            <span className="date-picker__time-badge">{timePart}</span>
          ) : null}
        </button>
        {datePart ? (
          <button
            aria-label={t("datePicker.clear", { label })}
            className="date-picker__clear"
            onClick={() => onChange(undefined)}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>
      {createPortal(
        <LazyMotion features={domAnimation}>
          <AnimatePresence>
            {isOpen && position ? (
              <m.div
                animate="animate"
                className="date-picker__panel"
                exit="exit"
                initial="initial"
                ref={panelRef}
                style={{
                  left: position.left,
                  top: position.placement === "top" ? undefined : position.top,
                  bottom:
                    position.placement === "top"
                      ? window.innerHeight - position.top
                      : undefined,
                }}
                variants={ANCHORED_PANEL_VARIANTS}
              >
                <div className="date-picker__header">
                  <button
                    aria-label={t("datePicker.previousMonth")}
                    className="date-picker__nav"
                    onClick={() => shiftMonth(-1)}
                    type="button"
                  >
                    ‹
                  </button>
                  <span className="date-picker__month">
                    {new Intl.DateTimeFormat(undefined, {
                      month: "long",
                      year: "numeric",
                    }).format(month)}
                  </span>
                  <button
                    aria-label={t("datePicker.nextMonth")}
                    className="date-picker__nav"
                    onClick={() => shiftMonth(1)}
                    type="button"
                  >
                    ›
                  </button>
                </div>
                <div className="date-picker__weekdays">
                  {weekdayLabels(firstDay).map((weekday) => (
                    <span className="date-picker__weekday" key={weekday}>
                      {weekday}
                    </span>
                  ))}
                </div>
                <div className="date-picker__grid">
                  {monthGrid(month, firstDay).map((date) => {
                    const iso = toLocalDate(date);
                    return (
                      <button
                        className={classNames(
                          "date-picker__day",
                          date.getMonth() !== month.getMonth() &&
                            "date-picker__day--outside",
                          iso === datePart && "date-picker__day--selected",
                          iso === today && "date-picker__day--today",
                        )}
                        key={iso}
                        onClick={() => {
                          emit(iso, timePart);
                          setIsOpen(false);
                        }}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="date-picker__footer">
                  <button
                    className="editor-button date-picker__today"
                    onClick={() => {
                      emit(today, timePart);
                      setMonth(new Date());
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    {t("datePicker.today")}
                  </button>
                  {withTime ? (
                    <label className="date-picker__time">
                      <span>{t("datePicker.time")}</span>
                      <input
                        className="editor-field__control"
                        disabled={!datePart}
                        onChange={(event) => emit(datePart, event.target.value)}
                        type="time"
                        value={timePart}
                      />
                    </label>
                  ) : null}
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>
        </LazyMotion>,
        document.body,
      )}
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </div>
  );
}

/**
 * Props for DatePicker.
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(value: string | undefined) => void} onChange - Value change callback
 * @property {string} [value] - Current YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 * @property {boolean} [withTime] - Whether a time-of-day can be set, defaulting to true
 */
interface DatePickerProps {
  hint?: string;
  label: string;
  onChange: (value: string | undefined) => void;
  value?: string;
  withTime?: boolean;
}
