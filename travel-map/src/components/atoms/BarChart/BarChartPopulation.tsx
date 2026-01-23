import "./BarChartPopulation.scss";
import { City } from "@/core";
import { JSX, lazy, useMemo } from "react";
import { filter, pipe, sortBy } from "remeda";
import { useLanguage } from "@/hooks/language/language";
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
 * Horizontal bar chart showing the top N cities by population.
 *
 * @component
 *
 * @param {PopulationsBarChartProps} props - The props of the component
 * @param {City[]} props.data - Cities to display (population must be set).
 * @param {string[]} [props.barColors] - Colors used for the distributed bars.
 * @param {boolean} [props.isDarkTheme=false] - Current theme.
 * @param {number} [props.numToShow=10] - How many cities to show.
 * @returns {JSX.Element} - The population bar chart.
 */
export function PopulationBarChart({
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

  const topCities = useMemo(() => {
    return pipe(
      data,
      filter((city) => city.population !== undefined),
      sortBy((city) => -city.population!),
    ).slice(0, numToShow);
  }, [data, numToShow]);

  const series = useMemo(() => {
    return [{ data: topCities.map((city) => city.population!) }];
  }, [topCities]);

  const categories = useMemo(() => {
    return topCities.map((city) => city.getName(t));
  }, [topCities, t]);

  const maxValue = useMemo(() => {
    const maxPopulation = topCities.reduce(
      (acc, city) => Math.max(acc, city.population ?? 0),
      0,
    );
    return maxPopulation * 1.5;
  }, [topCities]);

  const options = useMemo(() => {
    return {
      chart: {
        animations: { enabled: false },
        toolbar: { show: false },
      },
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
          fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
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
            fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
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
  }, [barColors, categories, currLanguage, maxValue]);

  return (
    <div className="populations-bar-chart">
      <ReactApexChart
        height={420}
        key={`${currLanguage}-${isDarkTheme ? "dark" : "light"}`}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
