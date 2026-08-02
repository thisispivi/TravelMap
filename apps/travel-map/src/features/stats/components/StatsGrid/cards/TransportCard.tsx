import "./TransportCard.scss";

import { City, Ferry, Flight } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { parameters } from "@/shared/lib/parameters";

import { Card } from "../../Card/Card";
import { TransportsDonutChart } from "../../charts/DonutChartTransports";
import { TimezoneRow } from "../../rows/RowTimezone";
import { TransportRow } from "../../rows/RowTransport";

/**
 * Props for the TransportCard component.
 * @property {Flight[]} takenFlights - All flights taken.
 * @property {Ferry[]} takenFerries - All ferries taken.
 * @property {Flight} [maxFlight] - Longest flight taken, when at least one flight was taken.
 * @property {Flight} [minFlight] - Shortest flight taken, when at least one flight was taken.
 * @property {Ferry} [maxFerry] - Longest ferry taken, when at least one ferry was taken.
 * @property {Ferry} [minFerry] - Shortest ferry taken, when at least one ferry was taken.
 * @property {City} [cityBiggestTimezoneJump] - City with the biggest timezone jump from home.
 * @property {{ sDate?: Date; eDate?: Date }} [cityBiggestTimezoneJumpTravel] - Travel dates for the timezone jump city.
 */
export type TransportCardProps = {
  takenFlights: Flight[];
  takenFerries: Ferry[];
  maxFlight?: Flight;
  minFlight?: Flight;
  maxFerry?: Ferry;
  minFerry?: Ferry;
  cityBiggestTimezoneJump?: City;
  cityBiggestTimezoneJumpTravel?: { sDate?: Date; eDate?: Date };
};

/**
 * TransportCard component
 * Bento full-width card showing a transport donut chart alongside detail rows
 * for longest/shortest flight and ferry, and the biggest timezone jump.
 * @component
 * @param {TransportCardProps} props
 * @param {Flight[]} props.takenFlights - All recorded flights
 * @param {Ferry[]} props.takenFerries - All recorded ferry crossings
 * @param {Flight} [props.maxFlight] - The longest recorded flight
 * @param {Flight} [props.minFlight] - The shortest recorded flight
 * @param {Ferry} [props.maxFerry] - The longest recorded ferry crossing
 * @param {Ferry} [props.minFerry] - The shortest recorded ferry crossing
 * @param {City} [props.cityBiggestTimezoneJump] - City with the largest timezone jump
 * @param {{ sDate?: Date; eDate?: Date }} [props.cityBiggestTimezoneJumpTravel] - Dates for the largest timezone jump
 * @returns {ReactNode} The transport bento card
 */
export function TransportCard({
  takenFlights,
  takenFerries,
  maxFlight,
  minFlight,
  maxFerry,
  minFerry,
  cityBiggestTimezoneJump,
  cityBiggestTimezoneJumpTravel,
}: TransportCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--full bento-detail bento-transport card--box-shadow">
      <div className="bento-transport__inner">
        <div className="bento-transport__chart">
          <h2>{t("stats.transport")}</h2>
          <TransportsDonutChart
            takenFerries={takenFerries}
            takenFlights={takenFlights}
          />
        </div>
        <div className="bento-transport__rows bento-detail__rows">
          {maxFlight && minFlight ? (
            <>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.longestFlight")}
                </p>
                <TransportRow transport={maxFlight} />
              </div>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.shortestFlight")}
                </p>
                <TransportRow transport={minFlight} />
              </div>
            </>
          ) : null}
          {maxFerry && minFerry ? (
            <>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.longestFerry")}
                </p>
                <TransportRow transport={maxFerry} />
              </div>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.shortestFerry")}
                </p>
                <TransportRow transport={minFerry} />
              </div>
            </>
          ) : null}
          {cityBiggestTimezoneJump ? (
            <div className="bento-detail__row">
              <p className="bento-detail__row-label">
                {t("stats.biggestTimezoneJump")}
              </p>
              <TimezoneRow
                eCity={cityBiggestTimezoneJump}
                eDate={cityBiggestTimezoneJumpTravel?.eDate}
                sCity={parameters.homeCity ?? cityBiggestTimezoneJump}
                sDate={cityBiggestTimezoneJumpTravel?.sDate}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
