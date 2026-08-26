import "./StatFigure.scss";

import { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";

/**
 * Props for the StatFigure component.
 * @property {string} label - What the figure counts.
 * @property {string | number} value - The figure itself.
 * @property {string} [suffix] - Trailing qualifier such as a unit or a total.
 * @property {string} [className] - Additional BEM modifier class names.
 */
export type StatFigureProps = {
  label: string;
  value: string | number;
  suffix?: string;
  className?: string;
};

/**
 * StatFigure component
 * A single headline number on the statistics sheet. The figure carries the
 * hierarchy and the label sits under it, so a column of these reads as a table
 * of results rather than as a row of tiles.
 * @component
 * @param {StatFigureProps} props - The stat figure props
 * @param {string} props.label - What the figure counts
 * @param {string | number} props.value - The figure itself
 * @param {string} [props.suffix] - Trailing qualifier such as a unit or a total
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The stat figure
 */
export function StatFigure({
  label,
  value,
  suffix,
  className = "",
}: StatFigureProps): ReactNode {
  return (
    <div className={classNames("stats-figure", className)}>
      <p className="stats-figure__value figure">
        {value}
        {suffix ? <span className="stats-figure__suffix">{suffix}</span> : null}
      </p>
      <p className="stats-figure__label">{label}</p>
    </div>
  );
}
