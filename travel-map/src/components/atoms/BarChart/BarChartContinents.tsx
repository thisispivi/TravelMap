import { lazy } from "react";
import useLanguage from "../../../hooks/language/language";
import "./BarChartContinents.scss";
import { Continent } from "../../../core";
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

export default function ContinentsBarChart({
  data,
  barColors = ["#79a14e", "#107895"],
  isDarkTheme = false,
}: ContinentsBarChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const filteredData = data.filter(
    (continent) => continent.cities > 0 || continent.countries > 0
  );

  const series = ["countries", "cities"].map((key) => ({
    name: t(`stats.${key}PerContinent`),
    data: filteredData.map((c) => c[key as "cities" | "countries"]),
  }));

  const maxValue =
    Math.max(...filteredData.map((c) => Math.max(c.cities, c.countries))) *
    1.05;

  const options = {
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        borderRadiusApplication: "end",
        barHeight: "15px",
      },
    },
    stroke: { width: 0 },
    xaxis: {
      categories: filteredData.map((continent) =>
        t(`continents.${continent.continent.replace(" ", "")}`)
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
          fontFamily: "Nunito",
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
      fontSize: "0.9em",
      fontFamily: "Nunito",
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
        return val === 0 ? "" : val;
      },
      style: {
        fontSize: "0.8em",
        fontFamily: "Nunito",
        fontWeight: 700,
        colors: ["#fff"],
      },
      offsetY: 1,
    },
    chart: { toolbar: { show: false } },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
  };

  return (
    <div className="continents-bar-chart">
      <ReactApexChart
        height={170}
        key={JSON.stringify({ series, options, isDarkTheme })}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
