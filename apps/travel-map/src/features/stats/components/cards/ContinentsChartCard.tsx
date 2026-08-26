import { Continent } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { ContinentsBarChart } from "../charts/BarChartContinents";

/**
 * Props for the ContinentsChartCard component.
 * @property {{ continent: Continent; countries: number; cities: number }[]} data - Per-continent city/country counts.
 */
export type ContinentsChartCardProps = {
  data: { continent: Continent; countries: number; cities: number }[];
};

/**
 * ContinentsChartCard component
 * Bento half-width card showing a bar chart of cities and countries visited
 * broken down by continent.
 * @component
 * @param {ContinentsChartCardProps} props
 * @param {{ continent: Continent; countries: number; cities: number }[]} props.data - Per-continent visit counts
 * @returns {ReactNode} The continents chart panel
 */
export function ContinentsChartCard({
  data,
}: ContinentsChartCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <section className="stats-panel stats-panel--half stats-block stats-continents-chart">
      <div className="stats-block__top">
        <h2>{t("stats.coverage")}</h2>
        <ContinentsBarChart data={data} />
      </div>
    </section>
  );
}
