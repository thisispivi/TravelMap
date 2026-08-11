import "./BarChartCountries.scss";

import { ReactNode } from "react";

import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CountryVisitStat } from "../../lib/transport";

/**
 * Properties accepted by the BarChartCountries component.
 * @property {CountryVisitStat[]} data - The data
 */
interface BarChartCountriesProps {
  data: CountryVisitStat[];
}

/**
 * BarChartCountries component
 * Horizontal bar chart showing the number of cities visited per country,
 * sorted by city count descending. Each row shows the country flag, its
 * authored name for the active locale, a proportional bar, and the city count.
 * @component
 * @param {BarChartCountriesProps} props
 * @param {CountryVisitStat[]} props.data - Country stats sorted by cities descending.
 * @returns {ReactNode} The countries bar chart
 */
export function BarChartCountries({ data }: BarChartCountriesProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const maxCities = Math.max(1, ...data.map((d) => d.cities));
  return (
    <div className="countries-bar-chart">
      {data.map(({ country, cities }) => (
        <div className="countries-bar-chart__row" key={country.id}>
          <CountryFlag
            className="countries-bar-chart__flag"
            countryId={country.id}
          />
          <span className="countries-bar-chart__name">
            {country.getLocalizedName(currLanguage)}
          </span>
          <div className="countries-bar-chart__bar-track">
            <div
              className="countries-bar-chart__bar-fill"
              style={{ width: `${(cities / maxCities) * 100}%` }}
            />
          </div>
          <span className="countries-bar-chart__count">{cities}</span>
        </div>
      ))}
    </div>
  );
}
