import { JSX } from "react";

import { useLanguage } from "@/hooks/language/language";
import { CountryVisitStat } from "@/utils/transport";

import { BarChartCountries } from "../../../atoms";
import { Card } from "../../../molecules/Cards/Card";

/**
 * Props for the CitiesPerCountryCard component.
 *
 * @property {CountryVisitStat[]} data - Per-country city visit counts.
 * @property {number} [maxItems] - Cap the number of countries shown (useful when card height is constrained).
 * @property {string} [className] - Override the root Card className (e.g. when placed inside a stack panel).
 */
export type CitiesPerCountryCardProps = {
  data: CountryVisitStat[];
  maxItems?: number;
  className?: string;
};

/**
 * CitiesPerCountryCard component
 *
 * Bento card showing a bar chart of cities visited per country. Pass
 * `maxItems` to cap the list when the card shares vertical space with another
 * card (e.g. inside a stack panel). Pass `className` to override grid
 * positioning when used inside a stack panel.
 *
 * @component
 *
 * @param {CitiesPerCountryCardProps} props
 * @returns {JSX.Element} The cities-per-country bento card
 */
export function CitiesPerCountryCard({
  data,
  maxItems,
  className = "bento-card bento-card--half bento-detail card--box-shadow",
}: CitiesPerCountryCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const visibleData = maxItems !== undefined ? data.slice(0, maxItems) : data;

  return (
    <Card className={className}>
      <div className="bento-detail__top">
        <h2>{t("stats.citiesPerCountry")}</h2>
      </div>
      <BarChartCountries data={visibleData} />
    </Card>
  );
}
