import { JSX } from "react";

import { useLanguage } from "@/hooks/language/language";
import { CountryVisitStat } from "@/utils/transport";

import { BarChartCountries } from "../../../atoms";
import { Card } from "../../../molecules/Cards/Card";

/**
 * Props for the CitiesPerCountryCard component.
 *
 * @property {CountryVisitStat[]} data - Per-country city visit counts.
 */
export type CitiesPerCountryCardProps = {
  data: CountryVisitStat[];
};

/**
 * CitiesPerCountryCard component
 *
 * Bento half-width card showing a bar chart of how many cities were visited
 * per country.
 *
 * @component
 *
 * @param {CitiesPerCountryCardProps} props
 * @returns {JSX.Element} The cities-per-country bento card
 */
export function CitiesPerCountryCard({
  data,
}: CitiesPerCountryCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.citiesPerCountry")}</h2>
      </div>
      <BarChartCountries data={data} />
    </Card>
  );
}
