import "./BarChartContinents.scss";

import { JSX, useMemo } from "react";

import { Continent } from "@/core";
import { useLanguage } from "@/hooks/language/language";

interface ContinentsBarChartProps {
  data: {
    continent: Continent;
    cities: number;
    countries: number;
  }[];
  barColors?: string[];
  isDarkTheme?: boolean;
}

interface BarRowProps {
  value: number;
  maxVal: number;
  color: string;
  label: string;
}

function BarRow({ value, maxVal, color, label }: BarRowProps): JSX.Element {
  const pct =
    maxVal > 0 ? Math.max((value / maxVal) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div className="continents-bar-chart__bar-row">
      <div className="continents-bar-chart__bar-track">
        <div
          className="continents-bar-chart__bar-fill"
          style={{ width: `${pct}%`, background: color }}
          title={`${label}: ${value}`}
        />
      </div>
      <span className="continents-bar-chart__bar-value">
        {value > 0 ? value : "—"}
      </span>
    </div>
  );
}

/**
 * ContinentsBarChart component
 *
 * Custom horizontal bar chart showing countries and cities visited per continent.
 * Numbers are always displayed outside bars for clarity, even for very small values.
 *
 * @component
 */
export function ContinentsBarChart({
  data,
  barColors = ["#107895", "#79a14e"],
  isDarkTheme = false,
}: ContinentsBarChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const filtered = useMemo(
    () => data.filter((c) => c.cities > 0 || c.countries > 0),
    [data],
  );

  const maxVal = useMemo(
    () => Math.max(1, ...filtered.map((c) => Math.max(c.countries, c.cities))),
    [filtered],
  );

  const continentLabel = (continent: Continent) =>
    t(`continents.${continent.replace(/\s+/g, "_").toUpperCase()}`);

  return (
    <div
      className={`continents-bar-chart ${isDarkTheme ? "continents-bar-chart--dark" : "continents-bar-chart--light"}`}
    >
      {/* Legend */}
      <div className="continents-bar-chart__legend">
        <span className="continents-bar-chart__legend-item">
          <span
            className="continents-bar-chart__legend-dot"
            style={{ background: barColors[0] }}
          />
          {t("stats.countriesPerContinent")}
        </span>
        <span className="continents-bar-chart__legend-item">
          <span
            className="continents-bar-chart__legend-dot"
            style={{ background: barColors[1] }}
          />
          {t("stats.citiesPerContinent")}
        </span>
      </div>

      {/* Rows */}
      <div className="continents-bar-chart__rows">
        {filtered.map((d) => (
          <div className="continents-bar-chart__row" key={d.continent}>
            <span className="continents-bar-chart__label">
              {continentLabel(d.continent)}
            </span>
            <div className="continents-bar-chart__bars">
              <BarRow
                color={barColors[0]}
                label={t("stats.countriesPerContinent")}
                maxVal={maxVal}
                value={d.countries}
              />
              <BarRow
                color={barColors[1]}
                label={t("stats.citiesPerContinent")}
                maxVal={maxVal}
                value={d.cities}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
