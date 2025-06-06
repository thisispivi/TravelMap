import { JSX, lazy } from "react";
import useLanguage from "@/hooks/language/language";
import "./BarChartPopulation.scss";
import { City } from "@/core";
import { filter, pipe, sortBy } from "remeda";
const ReactApexChart = lazy(() => import("react-apexcharts"));

interface PopulationsBarChartProps {
  data: City[];
  barColors?: string[];
  isDarkTheme?: boolean;
  numToShow?: number;
}

/**
 * PopulationBarChart component
 *
 * The populations bar chart component is used to display the number of cities and countries per population.
 *
 * @component
 *
 * @param {PopulationsBarChartProps} props - The props of the component
 * @param {Array<{ population: Population, cities: number, countries: number }>} props.data - The data to display
 * @param {string[]} [props.barColors=["#107895", "#79a14e"]] - The colors of the bars
 * @param {boolean} [props.isDarkTheme=false] - The theme of the chart
 * @returns {JSX.Element} - The populations bar chart
 */
export default function PopulationBarChart({
  data,
  barColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A1",
    "#FF8C33",
    "#8C33FF",
    "#33FFF5",
    "#F5FF33",
    "#FF3333",
    "#33FF8C",
  ],
  isDarkTheme = false,
  numToShow = 10,
}: PopulationsBarChartProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);

  const topCities = pipe(
    data,
    filter((city) => city.population !== undefined),
    sortBy((city) => -city.population!),
  ).slice(0, numToShow);

  const series = [{ data: topCities.map((city) => city.population!) }];
  const categories = topCities.map((city) => city.getName(t));

  const maxValue = Math.max(...topCities.map((city) => city.population!)) * 1.5;

  const options = {
    chart: {
      animations: { enabled: false },
      toolbar: { show: false },
    },
    series,
    plotOptions: {
      bar: {
        borderRadius: 7,
        borderRadiusApplication: "end",
        barHeight: "14em",
        distributed: true,
        horizontal: true,
        dataLabels: { position: "top" },
      },
    },
    stroke: { width: 0 },
    colors: barColors,
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val === 0 ? "" : val.toLocaleString(currLanguage);
      },
      style: {
        fontSize: "0.9em",
        fontFamily: "Urbanist",
        colors: ["#fff"],
      },
      offsetY: 1,
      offsetX: 44,
    },
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
          fontFamily: "Urbanist",
          fontWeight: 700,
        },
        offsetY: 3,
      },
    },
    tooltip: { enabled: false },
    grid: { show: false },
    legend: {
      menu: { show: false },
      show: false,
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <div className="populations-bar-chart">
      <ReactApexChart
        height={420}
        key={JSON.stringify({ series, options, isDarkTheme })}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
