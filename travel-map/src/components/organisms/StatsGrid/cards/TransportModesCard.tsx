import "./TransportModesCard.scss";

import { JSX } from "react";

import { TransportModeStat } from "@/utils/transport";

import { BarChartTransportModes } from "../../../atoms";
import { Card } from "../../../molecules/Cards/Card";

/**
 * Props for the TransportModesCard component.
 *
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
 *
 * Bento half-width card displaying a bar chart of transport modes, either by
 * count or by distance. Reused for both "Transport Modes" and "Distance by Mode"
 * bento cards.
 *
 * @component
 *
 * @param {TransportModesCardProps} props
 * @returns {JSX.Element} The transport modes bento card
 */
export function TransportModesCard({
  data,
  metric,
  title,
}: TransportModesCardProps): JSX.Element {
  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{title}</h2>
      </div>
      <BarChartTransportModes data={data} metric={metric} />
    </Card>
  );
}
