import "./BarChartTransportModes.scss";

import { ReactNode } from "react";

import { TransportMode } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { classNames } from "@/utils/className";
import { formatMileage } from "@/utils/format";
import { TransportModeStat } from "@/utils/transport";

import { TransportModeIcon } from "../TransportModeIcon/TransportModeIcon";
const transportModeColors: Record<string, string> = {
  plane: "#a855f7",
  ferry: "#0ea5e9",
  train: "#f59e0b",
  bus: "#22c55e",
  car: "#ef4444",
  taxi: "#eab308",
  walk: "#14b8a6",
};
const FILL_MODES = new Set(["taxi"]);
interface BarChartTransportModesProps {
  data: TransportModeStat[];
  metric?: "count" | "km";
}
/**
 * BarChartTransportModes component
 *
 * Horizontal bar chart showing transport mode usage, colored by mode.
 * `metric="count"` (default) sizes bars by trip count; `metric="km"` by distance.
 *
 * @component
 * @param {BarChartTransportModesProps} props
 * @param {TransportModeStat[]} props.data - Transport stats to display.
 * @param {"count"|"km"} [props.metric="count"] - Which value drives bar width.
 */
export function BarChartTransportModes({
  data,
  metric = "count",
}: BarChartTransportModesProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const visibleData = metric === "km" ? data.filter((d) => d.km > 0) : data;
  const maxValue = (() => {
    if (metric === "km") return Math.max(1, ...visibleData.map((d) => d.km));
    return Math.max(1, ...visibleData.map((d) => d.count));
  })();
  return (
    <div className="transport-bar-chart">
      {visibleData.map(({ mode, count, km }) => {
        const color = transportModeColors[mode] ?? "#888";
        const value = metric === "km" ? km : count;
        const pct = (value / maxValue) * 100;
        const isFill = FILL_MODES.has(mode);
        return (
          <div className="transport-bar-chart__row" key={mode}>
            <div className="transport-bar-chart__icon-wrap" style={{ color }}>
              <TransportModeIcon
                className={classNames(
                  "transport-bar-chart__icon",
                  isFill && "transport-bar-chart__icon--fill",
                )}
                mode={mode as TransportMode}
              />
            </div>
            <div className="transport-bar-chart__bar-track">
              <div
                className="transport-bar-chart__bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            {metric === "km" ? (
              <span className="transport-bar-chart__count transport-bar-chart__count--km">
                {formatMileage(km, currLanguage)} km
              </span>
            ) : (
              <>
                <span className="transport-bar-chart__count">{count}</span>
                {km > 0 ? (
                  <span className="transport-bar-chart__km">
                    {formatMileage(km, currLanguage)} km
                  </span>
                ) : null}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
