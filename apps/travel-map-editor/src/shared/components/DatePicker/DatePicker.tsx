import "./DatePicker.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { useAnchoredMenu } from "@travelmap/ui/hooks/useAnchoredMenu";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { menuVariants } from "@travelmap/ui/lib/motion";
import { remToPx } from "@travelmap/ui/lib/rem";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAY_COUNT = 7;
const CALENDAR_CELLS = 42;
const PANEL_WIDTH_REM = 17.5;
const CHOICES_PER_VIEW = 12;

/** Which grid the calendar panel is showing. */
type CalendarView = "days" | "months" | "years";

/** How many months the arrows move in each view: a month, a year, a page of years. */
const VIEW_STEP_MONTHS: Record<CalendarView, number> = {
  days: 1,
  months: 12,
  years: 12 * CHOICES_PER_VIEW,
};

/** Short weekday names for the calendar's header row. */
const WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: "short" });

/** The chosen date as the field shows it. */
const VALUE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

/** The month above the calendar grid. */
const MONTH_FORMAT = new Intl.DateTimeFormat(undefined, { month: "long" });

/** A month in the grid of months. */
const SHORT_MONTH_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "short",
});

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
  /* A known Sunday provides a stable base for weekday ordering. */
  return Array.from({ length: WEEKDAY_COUNT }, (_unused, index) =>
    WEEKDAY_FORMAT.format(new Date(2024, 0, 7 + ((firstDay + index) % 7))),
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
  /* Intl uses 1-7, while the calendar grid uses JavaScript's 0-6 range. */
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
 * One month or year offered in place of the days.
 * @property {number} value - The month index or the year
 * @property {string} label - What the cell prints
 * @property {boolean} isSelected - Whether it holds the chosen date
 * @property {boolean} isCurrent - Whether it holds today
 */
interface CalendarChoice {
  value: number;
  label: string;
  isSelected: boolean;
  isCurrent: boolean;
}

/**
 * Properties accepted by the ChoiceGrid component.
 * @property {CalendarChoice[]} choices - The months or years to offer
 * @property {(value: number) => void} onChoose - Picks one
 */
interface ChoiceGridProps {
  choices: CalendarChoice[];
  onChoose: (value: number) => void;
}

/**
 * ChoiceGrid component
 * The months of a year or a page of years, drawn in the same room as the days
 * so the panel keeps its size while switching views.
 * @component
 * @param {ChoiceGridProps} props - The grid props
 * @param {CalendarChoice[]} props.choices - The months or years to offer
 * @param {(value: number) => void} props.onChoose - Picks one
 * @returns {ReactNode} The grid
 */
function ChoiceGrid({ choices, onChoose }: ChoiceGridProps): ReactNode {
  return (
    <div className="date-picker__choices">
      {choices.map(({ value, label, isSelected, isCurrent }) => (
        <button
          className={classNames(
            "date-picker__day",
            isSelected && "date-picker__day--selected",
            isCurrent && "date-picker__day--today",
          )}
          key={value}
          onClick={() => onChoose(value)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Properties accepted by the Calendar component.
 * @property {string} datePart - The chosen YYYY-MM-DD, empty when there is none
 * @property {number} firstDay - The locale's first weekday
 * @property {(iso: string) => void} onPick - Chooses a day
 * @property {Date | null} selected - The chosen date
 * @property {string} today - Today as YYYY-MM-DD
 */
interface CalendarProps {
  datePart: string;
  firstDay: number;
  onPick: (iso: string) => void;
  selected: Date | null;
  today: string;
}

/**
 * Calendar component
 * The days of one month, with the month and the year in its header opening a
 * grid of them, so an old date is a few presses away rather than dozens of
 * steps of the arrows. It exists only while the panel is open, so it always
 * opens on the days of the chosen date.
 * @component
 * @param {CalendarProps} props - The calendar props
 * @param {string} props.datePart - The chosen YYYY-MM-DD
 * @param {number} props.firstDay - The locale's first weekday
 * @param {(iso: string) => void} props.onPick - Chooses a day
 * @param {Date | null} props.selected - The chosen date
 * @param {string} props.today - Today as YYYY-MM-DD
 * @returns {ReactNode} The calendar
 */
function Calendar({
  datePart,
  firstDay,
  onPick,
  selected,
  today,
}: CalendarProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [month, setMonth] = useState(() => selected ?? new Date());
  const [view, setView] = useState<CalendarView>("days");
  const now = new Date();
  const year = month.getFullYear();
  const firstYear = year - (year % CHOICES_PER_VIEW);
  const yearRange = `${firstYear}–${firstYear + CHOICES_PER_VIEW - 1}`;

  /**
   * Moves the visible month.
   * @param {number} delta - Months to move by
   * @returns {void}
   */
  function shiftMonth(delta: number): void {
    setMonth(new Date(year, month.getMonth() + delta, 1));
  }

  /**
   * Opens a grid of months or years, or returns to the days from it.
   * @param {CalendarView} next - The grid the header button stands for
   * @returns {void}
   */
  function toggleView(next: CalendarView): void {
    setView(view === next ? "days" : next);
  }

  /**
   * Shows a chosen month and year, and returns to its days.
   * @param {number} nextYear - The year to show
   * @param {number} nextMonth - The month index to show
   * @returns {void}
   */
  function showMonth(nextYear: number, nextMonth: number): void {
    setMonth(new Date(nextYear, nextMonth, 1));
    setView("days");
  }

  return (
    <>
      <div className="date-picker__header">
        <button
          aria-label={t(`datePicker.previous.${view}`)}
          className="date-picker__nav"
          onClick={() => shiftMonth(-VIEW_STEP_MONTHS[view])}
          type="button"
        >
          ‹
        </button>
        <span className="date-picker__heading">
          <button
            aria-label={t("datePicker.chooseMonth")}
            aria-pressed={view === "months"}
            className={classNames(
              "date-picker__month",
              view === "months" && "date-picker__month--active",
            )}
            onClick={() => toggleView("months")}
            type="button"
          >
            {MONTH_FORMAT.format(month)}
          </button>
          <button
            aria-label={t("datePicker.chooseYear")}
            aria-pressed={view === "years"}
            className={classNames(
              "date-picker__month",
              view === "years" && "date-picker__month--active",
            )}
            onClick={() => toggleView("years")}
            type="button"
          >
            {view === "years" ? yearRange : year}
          </button>
        </span>
        <button
          aria-label={t(`datePicker.next.${view}`)}
          className="date-picker__nav"
          onClick={() => shiftMonth(VIEW_STEP_MONTHS[view])}
          type="button"
        >
          ›
        </button>
      </div>
      {view === "months" ? (
        <ChoiceGrid
          choices={Array.from(
            { length: CHOICES_PER_VIEW },
            (_unused, index) => ({
              isCurrent: year === now.getFullYear() && index === now.getMonth(),
              isSelected:
                year === selected?.getFullYear() &&
                index === selected.getMonth(),
              label: SHORT_MONTH_FORMAT.format(new Date(2024, index, 1)),
              value: index,
            }),
          )}
          onChoose={(index) => showMonth(year, index)}
        />
      ) : null}
      {view === "years" ? (
        <ChoiceGrid
          choices={Array.from(
            { length: CHOICES_PER_VIEW },
            (_unused, index) => ({
              isCurrent: firstYear + index === now.getFullYear(),
              isSelected: firstYear + index === selected?.getFullYear(),
              label: String(firstYear + index),
              value: firstYear + index,
            }),
          )}
          onChoose={(chosen) => showMonth(chosen, month.getMonth())}
        />
      ) : null}
      {view === "days" ? (
        <>
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
                    onPick(iso);
                  }}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </>
  );
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
  const { container, position } = useAnchoredMenu(
    controlRef,
    isOpen,
    remToPx(PANEL_WIDTH_REM),
  );
  const firstDay = firstDayOfWeek();
  const today = toLocalDate(new Date());

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

  const formattedValue = selected ? VALUE_FORMAT.format(selected) : "";
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
                  maxHeight: position.maxHeight,
                  left: position.left,
                  top: position.placement === "top" ? undefined : position.top,
                  bottom:
                    position.placement === "top"
                      ? window.innerHeight - position.top
                      : undefined,
                  width: position.width,
                }}
                variants={menuVariants}
              >
                <Calendar
                  datePart={datePart}
                  firstDay={firstDay}
                  onPick={(iso) => {
                    emit(iso, timePart);
                    setIsOpen(false);
                  }}
                  selected={selected}
                  today={today}
                />
                <div className="date-picker__footer">
                  <Button
                    className="date-picker__today"
                    onClick={() => {
                      emit(today, timePart);
                      setIsOpen(false);
                    }}
                  >
                    {t("datePicker.today")}
                  </Button>
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
        container,
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
