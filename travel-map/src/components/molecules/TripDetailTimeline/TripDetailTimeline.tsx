import "./TripDetailTimeline.scss";

import { JSX } from "react";

import { TripDetailTimelineItem } from "@/utils/tripDetailTimeline";

import { TripDetailTimelineDayTripRow } from "./TripDetailTimelineDayTripRow";
import { TripDetailTimelineGhostRow } from "./TripDetailTimelineGhostRow";
import { TripDetailTimelineStopRow } from "./TripDetailTimelineStopRow";
import { TripDetailTimelineTransportRow } from "./TripDetailTimelineTransportRow";

interface TripDetailTimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

export function TripDetailTimeline({
  items,
  showYear,
}: TripDetailTimelineProps): JSX.Element {
  return (
    <div className="trip-detail__timeline">
      {items.map((item, rowIdx) => {
        const animDelay = 0.08 + rowIdx * 0.03;

        if (item.kind === "origin" || item.kind === "return") {
          return (
            <TripDetailTimelineGhostRow
              animDelay={animDelay}
              city={item.city}
              key={`${item.kind}-${item.city.name}`}
            />
          );
        }

        if (item.kind === "transport") {
          return (
            <TripDetailTimelineTransportRow
              animDelay={animDelay}
              ferryInfo={item.ferryInfo}
              flightInfo={item.flightInfo}
              key={`transport-${rowIdx}`}
              mode={item.mode}
            />
          );
        }

        if (item.kind === "base-stop") {
          return (
            <TripDetailTimelineStopRow
              animDelay={animDelay}
              city={item.city}
              isLayover={item.isLayover}
              key={`stop-${item.city.name}-${item.travelIdx}`}
              nights={item.nights}
              showYear={showYear}
              travelIdx={item.travelIdx}
            />
          );
        }

        if (item.kind === "day-trip") {
          return (
            <TripDetailTimelineDayTripRow
              animDelay={animDelay}
              city={item.city}
              isNested={item.isNested}
              key={`day-trip-${item.city.name}-${item.travelIdx}`}
              showYear={showYear}
              travelIdx={item.travelIdx}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
