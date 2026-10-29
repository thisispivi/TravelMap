import "./YearPills.scss";

import { m } from "framer-motion";
import { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";
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
 * Properties accepted by the YearPills component.
 * @property {string} id - Unique per row on screen; scopes the sliding highlight
 * @property {YearOption[]} years - The years, in the order they are shown
 * @property {number} value - The selected year
 * @property {(year: number) => void} onChange - Selects a year
 * @property {string} label - The accessible name of the row
 */
interface YearPillsProps {
  id: string;
  years: YearOption[];
  value: number;
  onChange: (year: number) => void;
  label: string;
}

/**
 * YearPills component
 * A row of years, each with its count when one is given, scrolling sideways
 * when it outgrows its room. The highlight slides to the chosen year, and the chosen pill scrolls
 * into view so it is never left off the edge.
 * @component
 * @param {YearPillsProps} props - The row props
 * @param {string} props.id - Unique per row on screen
 * @param {YearOption[]} props.years - The years, in order
 * @param {number} props.value - The selected year
 * @param {(year: number) => void} props.onChange - Selects a year
 * @param {string} props.label - The accessible name of the row
 * @returns {ReactNode} The year pills
 */
export function YearPills({
  id,
  years,
  value,
  onChange,
  label,
}: YearPillsProps): ReactNode {
  return (
    <div aria-label={label} className="year-pills" role="radiogroup">
      {years.map(({ year, label: text, ariaLabel, count }) => {
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
            onClick={(event) => {
              event.currentTarget.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
              });
              onChange(year);
            }}
            role="radio"
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
