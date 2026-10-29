import "./YearPills.scss";

import { m } from "framer-motion";
import { KeyboardEvent, ReactNode, useEffect, useRef } from "react";

import { classNames } from "@/shared/lib/classNames";
import { radioTarget } from "@/shared/lib/keyboard";
import { panelSpring } from "@/shared/lib/motion";

/**
 * One year a pill can select.
 * @property {number} year - The year, which is also the pill's value
 * @property {string} [label] - Printed instead of the year, such as `≤ 2022`
 * @property {string} [ariaLabel] - Read instead of the label, when the label is a symbol
 * @property {number} [count] - How many things it holds, printed beside it
 */
interface YearOption {
  year: number;
  label?: string;
  ariaLabel?: string;
  count?: number;
}

/**
 * The widths a row of year pills has to fit, in pixels.
 * @property {number} available - The row's inner width
 * @property {number} single - One year's pill
 * @property {number} folded - A `≤ year` pill, the widest
 * @property {number} gap - The space between two pills
 */
export interface PillWidths {
  available: number;
  single: number;
  folded: number;
  gap: number;
}

/**
 * Reads a computed CSS length as a number of pixels.
 * @param {string} length - A computed value such as `12px`
 * @returns {number} The pixels, or 0 for anything unparseable such as `normal`
 */
function px(length: string): number {
  return Number.parseFloat(length) || 0;
}

/**
 * Measures a row of pills as it is drawn: its inner width, the gap between
 * pills, and how wide a year and a `≤ year` pill are in the pills' own font
 * and padding. Pills use tabular figures, so `0000` is as wide as any year.
 * @param {HTMLElement} row - The row
 * @param {CanvasRenderingContext2D} canvas - A context to measure text with
 * @returns {PillWidths | undefined} The widths, once the row holds a pill
 */
function measureRow(
  row: HTMLElement,
  canvas: CanvasRenderingContext2D,
): PillWidths | undefined {
  const pill = row.firstElementChild;
  if (!(pill instanceof HTMLElement)) return undefined;
  const rowStyle = getComputedStyle(row);
  const pillStyle = getComputedStyle(pill);
  canvas.font = `${pillStyle.fontWeight} ${pillStyle.fontSize} ${pillStyle.fontFamily}`;
  /* One pixel of slack per pill absorbs sub-pixel rounding in the layout. */
  const padding = px(pillStyle.paddingLeft) + px(pillStyle.paddingRight) + 1;
  return {
    available:
      row.clientWidth - px(rowStyle.paddingLeft) - px(rowStyle.paddingRight),
    folded: Math.ceil(canvas.measureText("≤ 0000").width) + padding,
    gap: px(rowStyle.columnGap),
    single: Math.ceil(canvas.measureText("0000").width) + padding,
  };
}

/**
 * Properties accepted by the YearPills component.
 * @property {string} id - Unique per row on screen; scopes the sliding highlight
 * @property {YearOption[]} years - The years, in the order they are shown
 * @property {number} value - The selected year
 * @property {(year: number) => void} onChange - Selects a year
 * @property {string} label - The accessible name of the row
 * @property {(widths: PillWidths) => void} [onMeasure] - Told the row's widths whenever they change, for an owner that fits the pills to the room
 */
interface YearPillsProps {
  id: string;
  years: YearOption[];
  value: number;
  onChange: (year: number) => void;
  label: string;
  onMeasure?: (widths: PillWidths) => void;
}

/**
 * YearPills component
 * A row of years, each with its count when one is given, scrolling sideways
 * when it outgrows its room. The highlight slides to the chosen year, and the
 * row scrolls to centre the chosen pill so it is never left off the edge.
 * Arrow keys move between years, as in any radio group.
 * @component
 * @param {YearPillsProps} props - The row props
 * @param {string} props.id - Unique per row on screen
 * @param {YearOption[]} props.years - The years, in order
 * @param {number} props.value - The selected year
 * @param {(year: number) => void} props.onChange - Selects a year
 * @param {string} props.label - The accessible name of the row
 * @param {(widths: PillWidths) => void} [props.onMeasure] - Told the row's widths whenever they change
 * @returns {ReactNode} The year pills
 */
export function YearPills({
  id,
  years,
  value,
  onChange,
  label,
  onMeasure,
}: YearPillsProps): ReactNode {
  const rowRef = useRef<HTMLDivElement>(null);
  const onMeasureRef = useRef(onMeasure);

  useEffect(() => {
    onMeasureRef.current = onMeasure;
  });

  useEffect(() => {
    const row = rowRef.current;
    const canvas = document.createElement("canvas").getContext("2d");
    if (!row || !canvas) return;
    let isActive = true;

    /**
     * Reports the row's widths whenever its size or the font changes.
     * @returns {void}
     */
    const measure = (): void => {
      const widths = isActive ? measureRow(row, canvas) : undefined;
      if (widths) onMeasureRef.current?.(widths);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    /* Until the web font arrives, the fallback's narrower figures undercount. */
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      isActive = false;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, []);

  /**
   * Selects a year and scrolls the row, and only the row, to centre its pill.
   * `scrollIntoView` would also scroll any ancestor, such as a lowered sheet.
   * @param {number} index - The year's position in the row
   * @returns {HTMLElement | undefined} The pill, for the caller to focus
   */
  const select = (index: number): HTMLElement | undefined => {
    const row = rowRef.current;
    const pill = row?.children[index];
    const option = years[index];
    if (!row || !(pill instanceof HTMLElement) || !option) return undefined;
    row.scrollTo({
      behavior: "smooth",
      left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2,
    });
    onChange(option.year);
    return pill;
  };

  /**
   * Moves the selection with the arrow, Home and End keys, as a radio group
   * does; only the selected pill is a tab stop.
   * @param {KeyboardEvent<HTMLDivElement>} event - The key press
   * @returns {void}
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = radioTarget(
      event,
      years.findIndex(({ year }) => year === value),
      years.length,
    );
    if (target === undefined) return;
    event.preventDefault();
    select(target)?.focus();
  };

  return (
    <div
      aria-label={label}
      className="year-pills"
      onKeyDown={handleKeyDown}
      ref={rowRef}
      role="radiogroup"
    >
      {years.map(({ year, label: text, ariaLabel, count }, index) => {
        const isActive = year === value;
        return (
          <button
            aria-checked={isActive}
            aria-label={ariaLabel}
            className={classNames(
              "year-pills__pill",
              isActive && "year-pills__pill--active",
            )}
            key={year}
            onClick={() => select(index)}
            role="radio"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {isActive ? (
              <m.span
                className="year-pills__indicator"
                layoutId={`year-pills-${id}`}
                transition={panelSpring}
              />
            ) : null}
            <span className="year-pills__year">{text ?? year}</span>
            {count === undefined ? null : (
              <span className="year-pills__count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
