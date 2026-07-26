import "./DonutChartTransports.scss";

import { Flight } from "@travelmap/core";
import { Ferry } from "@travelmap/core/classes/Ferry";
import { TravelType } from "@travelmap/core/typings/Travel";
import { lazy, ReactNode } from "react";

import { useLanguage } from "@/hooks/language/language";
import variables from "@/styles/_variables.module.scss";
const ReactApexChart = lazy(() => import("react-apexcharts"));

/**
 * Properties accepted by the TransportsDonutChart component.
 * @property {Flight[]} takenFlights - The taken flights
 * @property {Ferry[]} takenFerries - The taken ferries
 */
interface TransportsDonutChartProps {
  takenFlights: Flight[];
  takenFerries: Ferry[];
}

/**
 * TransportsDonutChart component
 * Shows the distribution of transport types across recorded journeys.
 * @component
 * @param {TransportsDonutChartProps} props - Component props.
 * @param {Flight[]} props.takenFlights - The user's taken flights.
 * @param {Ferry[]} props.takenFerries - The user's taken ferries.
 * @returns {ReactNode} The donut chart.
 */
export function TransportsDonutChart({
  takenFlights,
  takenFerries,
}: TransportsDonutChartProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const { numNationalFlights, numInternationalFlights, numIntercontinental } =
    takenFlights.reduce(
      (acc, flight) => {
        if (flight.travelType === TravelType.INTERCONTINENTAL)
          acc.numIntercontinental += 1;
        else if (flight.travelType === TravelType.INTERNATIONAL)
          acc.numInternationalFlights += 1;
        else if (flight.travelType === TravelType.NATIONAL)
          acc.numNationalFlights += 1;
        return acc;
      },
      {
        numNationalFlights: 0,
        numInternationalFlights: 0,
        numIntercontinental: 0,
      },
    );
  const numFerries = takenFerries.length;
  const totalTransports =
    numNationalFlights +
    numInternationalFlights +
    numIntercontinental +
    numFerries;
  const series = [
    numNationalFlights,
    numInternationalFlights,
    numIntercontinental,
    numFerries,
  ];
  const labels = [
    t("stats.national"),
    t("stats.international"),
    t("stats.intercontinental"),
    t("stats.ferries"),
  ];
  const enabledOnSeries = series.map((_, idx) => idx);
  const options: ApexCharts.ApexOptions = {
    chart: {
      animations: { enabled: false },
    },
    labels,
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "inherit",
      onItemClick: { toggleDataSeries: false },
      markers: { strokeWidth: 0, offsetX: -2 },
      itemMargin: { horizontal: 8 },
    },
    stroke: { show: false },
    tooltip: {
      enabled: false,
      style: {
        fontSize: "1em",
        fontFamily: "Urbanist, Arial, Helvetica, sans-serif",
      },
      cssClass: "apexcharts-tooltip",
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "67.5%",
          labels: {
            show: true,
            value: {
              show: true,
              fontSize: "1.2em",
              fontFamily: "inherit",
              fontWeight: 700,
              offsetY: 9,
            },
            total: {
              show: true,
              label: t("stats.total"),
              fontFamily: "inherit",
              fontWeight: 300,
              fontSize: "1em",
              formatter: function () {
                return `${totalTransports}`;
              },
              showAlways: true,
            },
            name: {
              offsetY: -2,
            },
          },
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        filter: {
          type: "none",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (_, opts?: ApexCharts.ApexFormatterOpts) {
        if (!opts) return "";
        const configuredSeries = opts.w.config.series;
        if (!Array.isArray(configuredSeries)) return "";
        const value = configuredSeries[opts.seriesIndex];
        return typeof value === "number" ? value : "";
      },
      dropShadow: { enabled: false },
      distributed: true,
      style: {
        fontSize: "1em",
        fontFamily: "inherit",
        fontWeight: 700,
        colors: [variables.darkButtonContent],
      },
      enabledOnSeries,
    },
    colors: ["#107895", "#c02e1d", "#79a14e", "#bb8e23"],
  };
  return (
    <div className="flights-donut-chart">
      <ReactApexChart
        height={240}
        options={options}
        series={series}
        type="donut"
      />
    </div>
  );
}
