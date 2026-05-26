import { m } from "framer-motion";
import { JSX } from "react";

import { AirplaneIcon, FerryIcon } from "@/assets";
import { TransportMode } from "@/core";
import {
  formatTripDetailDuration,
  TRIP_DETAIL_FERRY_COMPANY_NAMES,
  TRIP_DETAIL_FLIGHT_COMPANY_NAMES,
  TripDetailFerryInfo,
  TripDetailFlightInfo,
} from "@/utils/tripDetailTimeline";

interface TripDetailTimelineTransportRowProps {
  mode: TransportMode;
  flightInfo?: TripDetailFlightInfo;
  ferryInfo?: TripDetailFerryInfo;
  animDelay: number;
}

function TripDetailTransportIcon({
  mode,
  className,
}: {
  mode: TransportMode;
  className?: string;
}): JSX.Element | null {
  if (mode === "ferry") return <FerryIcon className={className} />;
  if (mode === "plane") return <AirplaneIcon className={className} />;
  return null;
}

export function TripDetailTimelineTransportRow({
  mode,
  flightInfo,
  ferryInfo,
  animDelay,
}: TripDetailTimelineTransportRowProps): JSX.Element {
  const transportInfo = flightInfo ?? ferryInfo;
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
          <TripDetailTransportIcon
            className="trip-detail__transport-icon"
            mode={mode}
          />
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
