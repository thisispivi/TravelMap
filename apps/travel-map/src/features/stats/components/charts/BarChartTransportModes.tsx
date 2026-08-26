import "./BarChartTransportModes.scss";

import { TransportMode } from "@travelmap/core";
import { ReactNode } from "react";

import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatDistance } from "@/shared/lib/format";
import variables from "@/styles/_variables.module.scss";

import { chartPalette } from "../../lib/chartPalette";
import { TransportModeStat } from "../../lib/transport";
const transportModeColors: Record<string, string> = {
  plane: variables.transportPlane,
  ferry: variables.transportFerry,
  train: variables.transportTrain,
  bus: variables.transportBus,
  car: variables.transportCar,
  taxi: variables.transportTaxi,
  walk: variables.transportWalk,
};

/**
 * Properties accepted by the BarChartTransportModes component.
 * @property {TransportModeStat[]} data - The data
 * @property {"count" | "km"} [metric] - The metric
 */
interface BarChartTransportModesProps {
  data: TransportModeStat[];
  metric?: "count" | "km";
}

/**
 * BarChartTransportModes component
 * Horizontal bar chart showing transport mode usage, colored by mode.
 * `metric="count"` (default) sizes bars by trip count; `metric="km"` by distance.
 * @component
 * @param {BarChartTransportModesProps} props
 * @param {TransportModeStat[]} props.data - Transport stats to display.
 * @param {"count"|"km"} [props.metric="count"] - Which value drives bar width.
 * @returns {ReactNode} The transport modes bar chart
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
        const color = transportModeColors[mode] ?? chartPalette.secondary;
        const value = metric === "km" ? km : count;
        const pct = (value / maxValue) * 100;
        return (
          <div className="transport-bar-chart__row" key={mode}>
            <div className="transport-bar-chart__icon-wrap" style={{ color }}>
              <TransportModeIcon
                className="transport-bar-chart__icon"
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
                {formatDistance(km, currLanguage)}
              </span>
            ) : (
              <>
                <span className="transport-bar-chart__count">{count}</span>
                {km > 0 ? (
                  <span className="transport-bar-chart__km">
                    {formatDistance(km, currLanguage)}
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
