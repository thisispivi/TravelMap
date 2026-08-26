import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { CountryVisitStat } from "../../../lib/transport";
import { BarChartCountries } from "../../charts/BarChartCountries";

/**
 * Props for the CitiesPerCountryCard component.
 * @property {CountryVisitStat[]} data - Per-country city visit counts.
 */
export type CitiesPerCountryCardProps = {
  data: CountryVisitStat[];
};

/**
 * CitiesPerCountryCard component
 * A half-width panel charting how many cities were visited in each country.
 * @component
 * @param {CitiesPerCountryCardProps} props - The cities-per-country card props
 * @param {CountryVisitStat[]} props.data - Per-country city visit counts
 * @returns {ReactNode} The cities-per-country panel
 */
export function CitiesPerCountryCard({
  data,
}: CitiesPerCountryCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <section className="stats-panel stats-panel--half stats-block">
      <div className="stats-block__top">
        <h2>{t("stats.citiesPerCountry")}</h2>
      </div>
      <BarChartCountries data={data} />
    </section>
  );
}
