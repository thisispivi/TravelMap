import "./Timeline.scss";

import { JSX } from "react";

import { TripDetailTimelineItem } from "@/utils/tripDetailTimeline";

import { TimelineDayTripRow } from "./TimelineDayTripRow";
import { TimelineGhostRow } from "./TimelineGhostRow";
import { TimelineStopRow } from "./TimelineStopRow";
import { TimelineTransportRow } from "./TimelineTransportRow";

interface TimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

/**
 * Timeline component
 *
 * Renders the vertical trip timeline — a sequence of rows representing the
 * origin city, transport segments, city stops, day-trips, and the return city.
 * Each row type gets its own sub-component; animation delays stagger from
 * the top so the list animates in progressively.
 *
 * @component
 *
 * @param {TimelineProps} props
 * @param {TripDetailTimelineItem[]} props.items - Ordered list of timeline items built by `buildTripDetailTimelineItems`
 * @param {boolean} props.showYear - Whether date ranges include the year (true for multi-year trips)
 * @returns {JSX.Element} The rendered timeline list
 */
export function Timeline({ items, showYear }: TimelineProps): JSX.Element {
  return (
    <div className="trip-detail__timeline">
      {items.map((item, rowIdx) => {
        const animDelay = 0.08 + rowIdx * 0.03;

        if (item.kind === "origin" || item.kind === "return") {
          return (
            <TimelineGhostRow
              animDelay={animDelay}
              city={item.city}
              key={`${item.kind}-${item.city.name}`}
            />
          );
        }

        if (item.kind === "transport") {
          return (
            <TimelineTransportRow
              animDelay={animDelay}
              busInfo={item.busInfo}
              carInfo={item.carInfo}
              ferryInfo={item.ferryInfo}
              flightInfo={item.flightInfo}
              key={`transport-${rowIdx}`}
              mode={item.mode}
              trainInfo={item.trainInfo}
            />
          );
        }

        if (item.kind === "base-stop") {
          return (
            <TimelineStopRow
              animDelay={animDelay}
              city={item.city}
              isLayover={item.isLayover}
              key={`stop-${item.city.name}-${item.travelIdx}`}
              nights={item.nights}
              showYear={showYear}
              stop={item.stop}
              travelIdx={item.travelIdx}
            />
          );
        }

        if (item.kind === "day-trip") {
          return (
            <TimelineDayTripRow
              animDelay={animDelay}
              city={item.city}
              isNested={item.isNested}
              key={`day-trip-${item.city.name}-${item.travelIdx}`}
              showYear={showYear}
              stop={item.stop}
              travelIdx={item.travelIdx}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
