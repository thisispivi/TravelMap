import "./TimelineTransportRow.scss";

import { m } from "framer-motion";
import { JSX } from "react";

import { AirplaneIcon, BusIcon, CarIcon, FerryIcon, TrainIcon } from "@/assets";
import { TransportMode } from "@/core";
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
  flightInfo?: TripDetailFlightInfo;
  ferryInfo?: TripDetailFerryInfo;
  busInfo?: TripDetailBusInfo;
  trainInfo?: TripDetailTrainInfo;
  carInfo?: TripDetailCarInfo;
  animDelay: number;
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

/**
 * TimelineTransportRow component
 *
 * Renders a transport segment (flight, ferry, bus, train, or car) between
 * two stops on the timeline. Shows the transport icon badge, company name
 * when available, and a metadata line with distance and duration.
 * Flights additionally display flight number, class, and airport codes.
 *
 * @component
 *
 * @param {TimelineTransportRowProps} props
 * @param {TransportMode} props.mode - Type of transport
 * @param {TripDetailFlightInfo} [props.flightInfo] - Populated for plane segments
 * @param {TripDetailFerryInfo} [props.ferryInfo] - Populated for ferry segments
 * @param {TripDetailBusInfo} [props.busInfo] - Populated for bus segments
 * @param {TripDetailTrainInfo} [props.trainInfo] - Populated for train segments
 * @param {TripDetailCarInfo} [props.carInfo] - Populated for car segments
 * @param {number} props.animDelay - Framer Motion entrance delay in seconds
 * @returns {JSX.Element} The transport row
 */
export function TimelineTransportRow({
  mode,
  flightInfo,
  ferryInfo,
  busInfo,
  trainInfo,
  carInfo,
  animDelay,
}: TimelineTransportRowProps): JSX.Element {
  const transportInfo =
    flightInfo ?? ferryInfo ?? busInfo ?? trainInfo ?? carInfo;
  const companyName = flightInfo
    ? TRIP_DETAIL_FLIGHT_COMPANY_NAMES[flightInfo.company]
    : ferryInfo
      ? TRIP_DETAIL_FERRY_COMPANY_NAMES[ferryInfo.company]
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
      {transportInfo ? (
        <div className="trip-detail__transport-info">
          {companyName ? (
            <span className="trip-detail__transport-company">
              {companyName}
            </span>
          ) : null}
          <span className="trip-detail__transport-meta">
            {transportInfo.distanceKm.toLocaleString()} km · ~
            {formatTripDetailDuration(transportInfo.durationMinutes)}
          </span>
          {flightInfo &&
          (flightInfo.number ||
            flightInfo.class ||
            flightInfo.departure ||
            flightInfo.arrival) ? (
            <>
              <span className="trip-detail__transport-meta">·</span>
              <span className="trip-detail__transport-extra">
                {[
                  flightInfo.number,
                  flightInfo.class,
                  flightInfo.departure && flightInfo.arrival
                    ? `${flightInfo.departure} → ${flightInfo.arrival}`
                    : (flightInfo.departure ?? flightInfo.arrival),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </m.div>
  );
}
