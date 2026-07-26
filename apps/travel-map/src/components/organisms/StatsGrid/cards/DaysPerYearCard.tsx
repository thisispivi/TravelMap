import { Trip } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/hooks/language/language";

import { BarChartYears } from "../../../atoms/BarChart/BarChartYears";
import { Card } from "../../../molecules/Cards/Card";

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
 * @returns {ReactNode} The days-per-year bento card
 */
export function DaysPerYearCard({ trips }: DaysPerYearCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail bento-days-year card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.daysPerYear")}</h2>
        <BarChartYears trips={trips} />
      </div>
    </Card>
  );
}
