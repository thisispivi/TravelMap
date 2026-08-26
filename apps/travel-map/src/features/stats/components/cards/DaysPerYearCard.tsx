import { Trip } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BarChartYears } from "../charts/BarChartYears";

/**
 * Props for the DaysPerYearCard component.
 * @property {Trip[]} trips - All visited trips, used to derive days abroad per year.
 */
export type DaysPerYearCardProps = {
  trips: Trip[];
};

/**
 * DaysPerYearCard component
 * Bento half-width card showing a bar chart of days abroad per calendar year.
 * @component
 * @param {DaysPerYearCardProps} props
 * @param {Trip[]} props.trips - Trips used to calculate days abroad
 * @returns {ReactNode} The days-per-year panel
 */
export function DaysPerYearCard({ trips }: DaysPerYearCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <section className="stats-panel stats-panel--full stats-block stats-days-year">
      <div className="stats-block__top">
        <h2>{t("stats.daysPerYear")}</h2>
        <BarChartYears trips={trips} />
      </div>
    </section>
  );
}
