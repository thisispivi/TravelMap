import { lazy, JSX, useMemo } from "react";
import { Flight } from "@/core";
import useLanguage from "@/hooks/language/language";
import variables from "@/styles/_variables.module.scss";
import "./DonutChartTransports.scss";
import { TravelType } from "@/core/typings/Travel";
import { Ferry } from "@/core/classes/Ferry";
const ReactApexChart = lazy(() => import("react-apexcharts"));

interface TransportsDonutChartProps {
  takenFlights: Flight[];
  takenFerries: Ferry[];
}

/**
 * Donut chart showing the distribution of the transport types of taken transports.
 * @param {TransportsDonutChartProps} props - Component props.
 * @param {Flight[]} props.takenFlights - The user's taken flights.
 * @param {Ferry[]} props.takenFerries - The user's taken ferries.
 * @returns {JSX.Element} The donut chart.
 */
export default function TransportsDonutChart({
  takenFlights,
  takenFerries,
}: TransportsDonutChartProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const { numNationalFlights, numInternationalFlights, numIntercontinental } =
    useMemo(() => {
      return takenFlights.reduce(
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
        }
      );
    }, [takenFlights]);

  const numFerries = useMemo(() => takenFerries.length, [takenFerries]);

  const totalTransports =
    numNationalFlights +
    numInternationalFlights +
    numIntercontinental +
    numFerries;

  const series = useMemo(() => {
    return [
      numNationalFlights,
      numInternationalFlights,
      numIntercontinental,
      numFerries,
    ];
  }, [
    numNationalFlights,
    numInternationalFlights,
    numIntercontinental,
    numFerries,
  ]);

  const labels = useMemo(() => {
    return [
      t("stats.national"),
      t("stats.international"),
      t("stats.intercontinental"),
      t("stats.ferries"),
    ];
  }, [t]);

  const enabledOnSeries = useMemo(() => {
    return series.map((_, idx) => idx);
  }, [series]);

  const options = useMemo(() => {
    return {
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
          fontWeight: 700,
          colors: [variables.darkButtonContent],
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
        enabledOnSeries,
      },
      colors: ["#107895", "#c02e1d", "#79a14e", "#bb8e23"],
    } as ApexCharts.ApexOptions;
  }, [enabledOnSeries, labels, t, totalTransports]);

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
