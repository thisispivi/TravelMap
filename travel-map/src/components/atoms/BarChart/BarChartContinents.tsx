import { JSX, lazy, useMemo } from "react";
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
 * @param {Array<{ continent: Continent, cities: number, countries: number }>} props.data - Continent stats.
 * @param {string[]} [props.barColors=["#107895", "#79a14e"]] - Bar colors.
 * @param {boolean} [props.isDarkTheme=false] - Current theme.
 * @returns {JSX.Element} - The continents bar chart.
 */
export default function ContinentsBarChart({
  data,
  barColors = ["#107895", "#79a14e"],
  isDarkTheme = false,
}: ContinentsBarChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const incrementedData = useMemo(() => {
    const filteredData = data.filter(
      (continent) => continent.cities > 0 || continent.countries > 0,
    );

    return filteredData.map((continent) => ({
      ...continent,
      cities: continent.cities + 1,
      countries: continent.countries + 1,
    }));
  }, [data]);

  const series = useMemo(() => {
    return ["countries", "cities"].map((key) => ({
      name: t(`stats.${key}PerContinent`),
      data: incrementedData.map((c) => c[key as "cities" | "countries"]),
    }));
  }, [incrementedData, t]);

  const maxValue = useMemo(() => {
    const maxRaw = incrementedData.reduce(
      (acc, c) => Math.max(acc, c.cities, c.countries),
      0,
    );
    return maxRaw * 1.05;
  }, [incrementedData]);

  const categories = useMemo(() => {
    return incrementedData.map((continent) =>
      t(
        `continents.${continent.continent.replace(" ", "_").toLocaleUpperCase()}`,
      ),
    );
  }, [incrementedData, t]);

  const options = useMemo(() => {
    return {
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
  }, [barColors, categories, maxValue]);

  return (
    <div className="continents-bar-chart">
      <ReactApexChart
        height={230}
        key={`${isDarkTheme ? "dark" : "light"}`}
        options={options}
        series={series}
        type="bar"
      />
    </div>
  );
}
