import { Continent } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/hooks/language/language";

import { ContinentsBarChart } from "../../../atoms/BarChart/BarChartContinents";
import { Card } from "../../../molecules/Cards/Card";

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
 * @returns {ReactNode} The continents chart bento card
 */
export function ContinentsChartCard({
  data,
}: ContinentsChartCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail bento-continents-chart card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.coverage")}</h2>
        <ContinentsBarChart data={data} />
      </div>
    </Card>
  );
}
