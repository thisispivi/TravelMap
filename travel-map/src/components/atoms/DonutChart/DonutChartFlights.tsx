import { lazy, JSX } from "react";
import { Flight } from "../../../core/classes/Flight";
import useLanguage from "../../../hooks/language/language";
import variables from "../../../styles/_variables.module.scss";
import "./DonutChartFlights.scss";
const ReactApexChart = lazy(() => import("react-apexcharts"));

interface FlightsDonutChartProps {
  takenFlights: Flight[];
}

/**
 * Donut chart showing the distribution of the user's flights by type.
 * @param {FlightsDonutChartProps} takenFlights - The user's taken flights.
 * @returns {JSX.Element} The donut chart.
 */
export default function FlightsDonutChart({
  takenFlights,
}: FlightsDonutChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const numNationalFlights = takenFlights.filter(
    (flight) => flight.isNational,
  ).length;
  const numInternationalFlights = takenFlights.filter(
    (flight) => flight.isInternational,
  ).length;
  const numIntercontinentalFlights = takenFlights.filter(
    (flight) => flight.isIntercontinental,
  ).length;
  const totalFlights =
    numNationalFlights + numInternationalFlights + numIntercontinentalFlights;

  const series = [
    numNationalFlights,
    numInternationalFlights,
    numIntercontinentalFlights,
  ];

  const options = {
    labels: [
      t("stats.national"),
      t("stats.international"),
      t("stats.intercontinental"),
    ],
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
      enabled: true,
      style: {
        fontSize: "1em",
        fontFamily: "Manrope",
        fontWeight: 700,
        colors: [variables.darkButtonContent],
      },
      cssClass: "apexcharts-tooltip",
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "72.5%",
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
                return `${totalFlights}`;
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
      formatter: function (_, { seriesIndex, w }) {
        return w.config.series[seriesIndex];
      },
      dropShadow: { enabled: false },
      distributed: true,
      style: {
        fontSize: "1em",
        fontFamily: "inherit",
        fontWeight: 700,
        colors: [variables.darkButtonContent],
      },
      enabledOnSeries: [0, 1, 2],
    },
    colors: ["#107895", "#c02e1d", "#79a14e"],
  } as ApexCharts.ApexOptions;

  return (
    <div className="flights-donut-chart">
      <ReactApexChart
        height={270}
        options={options}
        series={series}
        type="donut"
      />
    </div>
  );
}
