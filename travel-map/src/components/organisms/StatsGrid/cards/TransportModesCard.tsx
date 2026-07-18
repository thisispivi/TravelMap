import "./TransportModesCard.scss";

import { ReactNode } from "react";

import { TransportModeStat } from "@/utils/transport";

import { BarChartTransportModes } from "../../../atoms/BarChart/BarChartTransportModes";
import { Card } from "../../../molecules/Cards/Card";

/**
 * Props for the TransportModesCard component.
 *
 * @property {TransportModeStat[]} data - Per-mode count and km stats.
 * @property {"count" | "km"} [metric] - Whether to display count or distance. Defaults to count.
 * @property {string} title - Card heading text.
 * @property {string} [className] - Override the root Card className (e.g. when placed inside a stack panel).
 */
export type TransportModesCardProps = {
  data: TransportModeStat[];
  metric?: "count" | "km";
  title: string;
  className?: string;
};

/**
 * TransportModesCard component
 *
 * Bento card displaying a bar chart of transport modes by count or distance.
 * The default className positions it as a standalone half-width bento card;
 * pass `className` to override when placing it inside a stack panel.
 *
 * @component
 *
 * @param {TransportModesCardProps} props
 * @returns {ReactNode} The transport modes bento card
 */
export function TransportModesCard({
  data,
  metric,
  title,
  className = "bento-card bento-card--half bento-detail card--box-shadow",
}: TransportModesCardProps): ReactNode {
  return (
    <Card className={className}>
      <div className="bento-detail__top">
        <h2>{title}</h2>
      </div>
      <BarChartTransportModes data={data} metric={metric} />
    </Card>
  );
}
