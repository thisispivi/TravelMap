import "./BarChartContinents.scss";

import { ReactNode } from "react";

import { Continent } from "@/core";
import { useLanguage } from "@/hooks/language/language";

/**
 * Properties accepted by the ContinentsBarChart component.
 * @property {{ continent: Continent; cities: number; countries: number }[]} data - The data
 * @property {string[]} [barColors] - The bar colors
 * @property {boolean} [isDarkTheme] - Whether the dark theme is active
 */
interface ContinentsBarChartProps {
  data: {
    continent: Continent;
    cities: number;
    countries: number;
  }[];
  barColors?: string[];
  isDarkTheme?: boolean;
}

/**
 * Properties accepted by the BarRow component.
 * @property {number} value - The value
 * @property {number} maxVal - The max val
 * @property {string} color - The color
 * @property {string} label - The label
 */
interface BarRowProps {
  value: number;
  maxVal: number;
  color: string;
  label: string;
}

/**
 * BarRow component
 * Renders one proportional bar and its numeric value.
 * @component
 * @param {BarRowProps} props
 * @param {number} props.value - The value represented by the bar
 * @param {number} props.maxVal - The maximum value used for scaling
 * @param {string} props.color - The bar fill color
 * @param {string} props.label - The accessible value label
 * @returns {ReactNode} The proportional bar row
 */
function BarRow({ value, maxVal, color, label }: BarRowProps): ReactNode {
  const pct =
    maxVal > 0 && value > 0 ? (Math.sqrt(value) / Math.sqrt(maxVal)) * 100 : 0;
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
 * Custom horizontal bar chart showing countries and cities visited per continent.
 * Numbers are always displayed outside bars for clarity, even for very small values.
 * @component
 * @param {ContinentsBarChartProps} props - The continent chart props
 * @param {ContinentsBarChartProps["data"]} props.data - Continent statistics
 * @param {string[]} [props.barColors] - Bar palette; defaults to the chart palette
 * @param {boolean} [props.isDarkTheme=false] - Whether to use the dark theme
 * @returns {ReactNode} The continent bar chart
 */
export function ContinentsBarChart({
  data,
  barColors = ["#107895", "#79a14e"],
  isDarkTheme = false,
}: ContinentsBarChartProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const filtered = data.filter((c) => c.cities > 0 || c.countries > 0);
  const maxVal = Math.max(
    1,
    ...filtered.map((c) => Math.max(c.countries, c.cities)),
  );

  /**
   * Translates a continent identifier for the chart.
   * @param {Continent} continent - The continent to translate
   * @returns {string} The localized continent label
   */
  const continentLabel = (continent: Continent): string =>
    t(`continents.${continent.replace(/\s+/g, "_").toUpperCase()}`);
  return (
    <div
      className={`continents-bar-chart ${isDarkTheme ? "continents-bar-chart--dark" : "continents-bar-chart--light"}`}
    >
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
