import "./BarChartContinents.scss";
import { ApexOptions } from "apexcharts";
import { Continent } from "@/core";
import { JSX, lazy, useMemo } from "react";
import { useLanguage } from "@/hooks/language/language";
const ReactApexChart = lazy(() => import("react-apexcharts"));

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
 * ContinentsBarChart component
 *
 * The continents bar chart component is used to display the number of cities and countries per continent.
 *
 * @component
 *
 * @param {ContinentsBarChartProps} props - The props of the component
 * @param {Array<{ continent: Continent, cities: number, countries: number }>} props.data - Continent stats.
 * @param {string[]} [props.barColors=["#107895", "#79a14e"]] - Bar colors.
 * @param {boolean} [props.isDarkTheme=false] - Current theme.
 * @returns {JSX.Element} - The continents bar chart.
 */
export function ContinentsBarChart({
  data,
  barColors = ["#107895", "#79a14e"],
  isDarkTheme = false,
}: ContinentsBarChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const { categories, series, maxValue, rawMatrix } = useMemo(() => {
    const filtered = data.filter((c) => c.cities > 0 || c.countries > 0);

    const categories = filtered.map((c) =>
      t(`continents.${c.continent.replace(/\s+/g, "_").toUpperCase()}`),
    );

    const rawCountries = filtered.map((c) => c.countries);
    const rawCities = filtered.map((c) => c.cities);

    // Keep tiny bars visible even when one metric is 0 (other metric > 0).
    const MIN_BAR = 1;
    const renderCountries = rawCountries.map((v) => (v === 0 ? MIN_BAR : v));
    const renderCities = rawCities.map((v) => (v === 0 ? MIN_BAR : v));

    const series = [
      { name: t("stats.countriesPerContinent"), data: renderCountries },
      { name: t("stats.citiesPerContinent"), data: renderCities },
    ];

    const maxRaw = Math.max(0, ...rawCountries, ...rawCities);
    const maxValue = Math.max(maxRaw, MIN_BAR) * 1.05;

    return {
      categories,
      series,
      maxValue,
      rawMatrix: [rawCountries, rawCities] as const,
    };
  }, [data, t]);

  const options: ApexOptions = useMemo(() => {
    return {
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 7,
          borderRadiusApplication: "end",
          barHeight: "18px",
          barMinWidth: 10,
        },
      },
      stroke: { width: 0 },
      xaxis: {
        categories,
        labels: { show: false },
        tickAmount: 0,
        axisTicks: { show: false },
        max: maxValue,
        min: 0,
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "0.9em",
            fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
            fontWeight: 700,
          },
        },
      },
      tooltip: { enabled: false },
      grid: { show: false },
      fill: { opacity: 1, colors: barColors },
      legend: {
        position: "top",
        horizontalAlign: "center",
        fontSize: "1em",
        fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
        fontWeight: 400,
        menu: { show: false },
        onItemClick: { toggleDataSeries: false },
        onItemHover: { highlightDataSeries: false },
        offsetY: 13,
        markers: {
          shape: "circle",
          strokeWidth: 0,
          strokeColors: "transparent",
          offsetX: -3,
          offsetY: -0.25,
          fillColors: barColors,
          size: 6.5,
        },
        itemMargin: { horizontal: 8 },
      },
      dataLabels: {
        enabled: true,
        formatter: function (_val, opts) {
          const raw = rawMatrix?.[opts.seriesIndex]?.[opts.dataPointIndex] ?? 0;
          return raw === 0 ? "" : String(raw);
        },
        style: {
          fontSize: "0.9em",
          fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
          colors: ["#fff"],
        },
        offsetY: 2,
      },
      chart: { toolbar: { show: false }, animations: { enabled: false } },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
    };
  }, [barColors, categories, maxValue, rawMatrix]);

  return (
    <div className="continents-bar-chart">
      <ReactApexChart
        height={250}
        key={`${isDarkTheme ? "dark" : "light"}`}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
