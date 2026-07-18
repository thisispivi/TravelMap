import "./StatTile.scss";

import { ComponentType, ReactNode, SVGProps } from "react";

import { classNames } from "@/utils/className";

import { Card } from "../../molecules/Cards/Card";

/** An SVG icon component accepting standard SVG props plus an optional className. */
type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

/**
 * Props for the StatTile component.
 *
 * @property {SvgIcon} icon - SVG icon component to render.
 * @property {string} label - Descriptive label shown below the value.
 * @property {string | number} value - The primary statistic to display.
 * @property {string} [suffix] - Optional text appended after the value (e.g. `"d"`, `"/ 195"`).
 * @property {string} [className] - Additional BEM modifier or utility class names.
 */
export type StatTileProps = {
  icon: SvgIcon;
  label: string;
  value: string | number;
  suffix?: string;
  className?: string;
};

/**
 * StatTile component
 *
 * A compact bento stat tile that displays an icon, a label, a primary value,
 * and an optional suffix. Used inside the stats bento grid for single-metric
 * summary cards.
 *
 * @component
 *
 * @param {StatTileProps} props
 * @param {SvgIcon} props.icon - SVG icon component to render
 * @param {string} props.label - Descriptive label below the value
 * @param {string | number} props.value - The primary statistic to display
 * @param {string} [props.suffix] - Optional text appended after the value
 * @param {string} [props.className] - Additional class names
 * @returns {ReactNode} The stat tile
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  className = "",
}: StatTileProps): ReactNode {
  return (
    <Card className={classNames("bento-stat card--box-shadow", className)}>
      <Icon className="bento-stat__icon" />
      <p className="bento-stat__label">{label}</p>
      <div className="bento-stat__value">
        <b>{value}</b>
        {suffix ? <span className="bento-stat__suffix">{suffix}</span> : null}
      </div>
    </Card>
  );
}
