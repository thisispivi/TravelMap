import "./TimelineTransportRow.scss";

import { m } from "framer-motion";
import { JSX } from "react";

import {
  AirplaneIcon,
  BusIcon,
  CarIcon,
  ChevronRightIcon,
  FerryIcon,
  TrainIcon,
} from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { City, TransportMode } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatMileage } from "@/utils/format";
import {
  formatTripDetailDuration,
  TRIP_DETAIL_FERRY_COMPANY_NAMES,
  TRIP_DETAIL_FLIGHT_COMPANY_NAMES,
  TripDetailBusInfo,
  TripDetailCarInfo,
  TripDetailFerryInfo,
  TripDetailFlightInfo,
  TripDetailTrainInfo,
} from "@/utils/tripDetailTimeline";

interface TimelineTransportRowProps {
  mode: TransportMode;
  from: City;
  to: City;
  flightInfo?: TripDetailFlightInfo;
  ferryInfo?: TripDetailFerryInfo;
  busInfo?: TripDetailBusInfo;
  trainInfo?: TripDetailTrainInfo;
  carInfo?: TripDetailCarInfo;
  animDelay: number;
  transitCity?: City;
}

function TransportIcon({
  mode,
  className,
}: {
  mode: TransportMode;
  className?: string;
}): JSX.Element | null {
  if (mode === "ferry") return <FerryIcon className={className} />;
  if (mode === "plane") return <AirplaneIcon className={className} />;
  if (mode === "bus") return <BusIcon className={className} />;
  if (mode === "train") return <TrainIcon className={className} />;
  if (mode === "car") return <CarIcon className={className} />;
  return null;
}

export function TimelineTransportRow({
  mode,
  from,
  to,
  flightInfo,
  ferryInfo,
  busInfo,
  trainInfo,
  carInfo,
  animDelay,
  transitCity,
}: TimelineTransportRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);

  const transportInfo =
    flightInfo ?? ferryInfo ?? busInfo ?? trainInfo ?? carInfo;
  const companyName = flightInfo
    ? TRIP_DETAIL_FLIGHT_COMPANY_NAMES[flightInfo.company]
    : ferryInfo
      ? TRIP_DETAIL_FERRY_COMPANY_NAMES[ferryInfo.company]
      : null;

  const fromLabel = t(`cities.${from.name}`) || from.name;
  const toLabel = t(`cities.${to.name}`) || to.name;

  const metaText = transportInfo
    ? `${transportInfo.distanceKm > 0 ? `${formatMileage(transportInfo.distanceKm, lang)} km · ` : ""}~${formatTripDetailDuration(transportInfo.durationMinutes)}`
    : null;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className={`trip-detail__row trip-detail__row--transport trip-detail__row--transport-${mode}`}
      initial={{ opacity: 0, x: -8 }}
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      <div className="trip-detail__track">
        <span
          aria-hidden
          className={`trip-detail__transport-badge trip-detail__transport-badge--${mode}`}
        >
          <TransportIcon className="trip-detail__transport-icon" mode={mode} />
        </span>
      </div>

      <div className="trip-detail__transport-info">
        {transitCity ? (
          // Ghost card: from → to + flag + TRANSIT badge + company + meta all in one pill
          <span className="trip-detail__transit-card">
            <span className="trip-detail__transport-city-name">
              {fromLabel}
            </span>
            <ChevronRightIcon className="trip-detail__transport-arrow" />
            <span className="trip-detail__transport-city-name">{toLabel}</span>
            <CountryFlag
              className="trip-detail__transit-flag"
              countryId={transitCity.country.id}
            />
            <span className="trip-detail__transit-badge">
              {t("tripDetail.layover")}
            </span>
            {companyName ? (
              <span className="trip-detail__transport-company">
                {companyName}
              </span>
            ) : null}
            {flightInfo?.number ? (
              <span className="trip-detail__transport-extra">
                {flightInfo.number}
              </span>
            ) : null}
            {flightInfo?.class ? (
              <span className="trip-detail__transport-extra">
                {flightInfo.class}
              </span>
            ) : null}
            {metaText ? (
              <span className="trip-detail__transport-meta">{metaText}</span>
            ) : null}
          </span>
        ) : (
          // Normal layout: destination + company + meta in a flat wrapping row
          <>
            {mode === "plane" &&
            (flightInfo?.departure || flightInfo?.arrival) ? (
              <span className="trip-detail__transport-route">
                <span className="trip-detail__transport-code">
                  {flightInfo.departure ?? fromLabel}
                </span>
                <ChevronRightIcon className="trip-detail__transport-arrow" />
                <span className="trip-detail__transport-code">
                  {flightInfo.arrival ?? toLabel}
                </span>
                {flightInfo.arrival ? (
                  <span className="trip-detail__transport-city-hint">
                    {toLabel}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="trip-detail__transport-route">
                <span className="trip-detail__transport-city-name">
                  {fromLabel}
                </span>
                <ChevronRightIcon className="trip-detail__transport-arrow" />
                <span className="trip-detail__transport-city-name">
                  {toLabel}
                </span>
              </span>
            )}
            {companyName ? (
              <span className="trip-detail__transport-company">
                {companyName}
              </span>
            ) : null}
            {flightInfo?.number ? (
              <span className="trip-detail__transport-extra">
                {flightInfo.number}
              </span>
            ) : null}
            {flightInfo?.class ? (
              <span className="trip-detail__transport-extra">
                {flightInfo.class}
              </span>
            ) : null}
            {metaText ? (
              <span className="trip-detail__transport-meta">{metaText}</span>
            ) : null}
          </>
        )}
      </div>
    </m.div>
  );
}
