import "./BarChartCountries.scss";

import { JSX, useMemo } from "react";

import { useLanguage } from "@/hooks/language/language";
import { CountryVisitStat } from "@/utils/transport";

import { CountryFlag } from "../CountryFlag/CountryFlag";

interface BarChartCountriesProps {
  data: CountryVisitStat[];
}

/**
 * BarChartCountries component
 *
 * Horizontal bar chart showing the number of cities visited per country,
 * sorted by city count descending. Each row shows the country flag,
 * translated country name, a proportional bar, and the city count.
 *
 * @component
 * @param {BarChartCountriesProps} props
 * @param {CountryVisitStat[]} props.data - Country stats sorted by cities descending.
 */
export function BarChartCountries({
  data,
}: BarChartCountriesProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const maxCities = useMemo(
    () => Math.max(1, ...data.map((d) => d.cities)),
    [data],
  );

  return (
    <div className="countries-bar-chart">
      {data.map(({ countryId, cities }) => (
        <div className="countries-bar-chart__row" key={countryId}>
          <CountryFlag
            className="countries-bar-chart__flag"
            countryId={countryId}
          />
          <span className="countries-bar-chart__name">
            {t(`countries.${countryId}`)}
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
