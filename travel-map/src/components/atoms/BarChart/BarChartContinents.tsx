import { JSX, lazy } from "react";
import useLanguage from "@/hooks/language/language";
import "./BarChartContinents.scss";
import { Continent } from "@/core";
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
 * @param {Array<{ continent: Continent, cities: number, countries: number }>} props.data - The data to display
 * @param {string[]} [props.barColors=["#107895", "#79a14e"]] - The colors of the bars
 * @param {boolean} [props.isDarkTheme=false] - The theme of the chart
 * @returns {JSX.Element} - The continents bar chart
 */
export default function ContinentsBarChart({
  data,
  barColors = ["#107895", "#79a14e"],
  isDarkTheme = false,
}: ContinentsBarChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const filteredData = data.filter(
    (continent) => continent.cities > 0 || continent.countries > 0,
  );
  const incrementedData = filteredData.map((continent) => ({
    ...continent,
    cities: continent.cities + 1,
    countries: continent.countries + 1,
  }));

  const series = ["countries", "cities"].map((key) => ({
    name: t(`stats.${key}PerContinent`),
    data: incrementedData.map((c) => c[key as "cities" | "countries"]),
  }));

  const maxValue =
    Math.max(...incrementedData.map((c) => Math.max(c.cities, c.countries))) *
    1.05;

  const options = {
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 7,
        borderRadiusApplication: "end",
        barHeight: "17px",
        barMinWidth: 10,
      },
    },
    stroke: { width: 0 },
    xaxis: {
      categories: incrementedData.map((continent) =>
        t(
          `continents.${continent.continent.replace(" ", "_").toLocaleUpperCase()}`,
        ),
      ),
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
          fontFamily: "Urbanist",
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
      fontFamily: "Urbanist",
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
      formatter: function (val: number) {
        return val === 0 ? "" : (val - 1).toString();
      },
      style: {
        fontSize: "1em",
        fontFamily: "Urbanist",
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

  return (
    <div className="continents-bar-chart">
      <ReactApexChart
        height={230}
        key={JSON.stringify({ series, options, isDarkTheme })}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
