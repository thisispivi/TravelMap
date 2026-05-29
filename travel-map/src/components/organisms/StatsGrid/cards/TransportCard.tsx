import "./TransportCard.scss";

import { JSX } from "react";

import { City, Ferry, Flight } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { parameters } from "@/utils/parameters";

import { TransportsDonutChart } from "../../../atoms";
import { Card } from "../../../molecules/Cards/Card";
import { TimezoneRow } from "../../../molecules/Row/RowTimezone";
import { TransportRow } from "../../../molecules/Row/RowTransport";

/**
 * Props for the TransportCard component.
 *
 * @property {Flight[]} takenFlights - All flights taken.
 * @property {Ferry[]} takenFerries - All ferries taken.
 * @property {Flight} maxFlight - Longest flight taken.
 * @property {Flight} minFlight - Shortest flight taken.
 * @property {Ferry} maxFerry - Longest ferry taken.
 * @property {Ferry} minFerry - Shortest ferry taken.
 * @property {City} [cityBiggestTimezoneJump] - City with the biggest timezone jump from home.
 * @property {{ sDate?: Date; eDate?: Date }} [cityBiggestTimezoneJumpTravel] - Travel dates for the timezone jump city.
 */
export type TransportCardProps = {
  takenFlights: Flight[];
  takenFerries: Ferry[];
  maxFlight: Flight;
  minFlight: Flight;
  maxFerry: Ferry;
  minFerry: Ferry;
  cityBiggestTimezoneJump?: City;
  cityBiggestTimezoneJumpTravel?: { sDate?: Date; eDate?: Date };
};

/**
 * TransportCard component
 *
 * Bento full-width card showing a transport donut chart alongside detail rows
 * for longest/shortest flight and ferry, and the biggest timezone jump.
 *
 * @component
 *
 * @param {TransportCardProps} props
 * @returns {JSX.Element} The transport bento card
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
}: TransportCardProps): JSX.Element {
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
          <div className="bento-detail__row">
            <p className="bento-detail__row-label">{t("stats.longestFerry")}</p>
            <TransportRow transport={maxFerry} />
          </div>
          <div className="bento-detail__row">
            <p className="bento-detail__row-label">
              {t("stats.shortestFerry")}
            </p>
            <TransportRow transport={minFerry} />
          </div>
          {cityBiggestTimezoneJump ? (
            <div className="bento-detail__row">
              <p className="bento-detail__row-label">
                {t("stats.biggestTimezoneJump")}
              </p>
              <TimezoneRow
                eCity={cityBiggestTimezoneJump}
                eDate={cityBiggestTimezoneJumpTravel?.eDate}
                sCity={parameters.birthCity}
                sDate={cityBiggestTimezoneJumpTravel?.sDate}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
