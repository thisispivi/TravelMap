import { ReactNode } from "react";

import { TransportModeStat } from "../../../lib/transport";
import { BarChartTransportModes } from "../../charts/BarChartTransportModes";

/**
 * Props for the TransportModesCard component.
 * @property {TransportModeStat[]} data - Per-mode count and km stats.
 * @property {"count" | "km"} [metric] - Whether to display count or distance. Defaults to count.
 * @property {string} title - Card heading text.
 */
export type TransportModesCardProps = {
  data: TransportModeStat[];
  metric?: "count" | "km";
  title: string;
};

/**
 * TransportModesCard component
 * A half-width panel charting how far and how often each transport mode
 * carried the traveller.
 * @component
 * @param {TransportModesCardProps} props - The transport modes card props
 * @param {TransportModeStat[]} props.data - Per-mode journey and distance statistics
 * @param {"count" | "km"} [props.metric] - Metric used to size the bars
 * @param {string} props.title - Panel heading
 * @returns {ReactNode} The transport modes panel
 */
export function TransportModesCard({
  data,
  metric,
  title,
}: TransportModesCardProps): ReactNode {
  return (
    <section className="stats-panel stats-panel--half stats-block">
      <div className="stats-block__top">
        <h2>{title}</h2>
      </div>
      <BarChartTransportModes data={data} metric={metric} />
    </section>
  );
}
