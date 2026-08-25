import "./TripTimeline.scss";

import { City } from "@travelmap/core";
import { useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

import {
  buildDisplaySegments,
  DisplaySegment,
  TripDetailTimelineItem,
} from "../../lib/tripDetailTimeline";
import { TimelineDayTripCard } from "./TripTimelineDayTripCard";
import { TimelineOriginNode } from "./TripTimelineOriginNode";
import { TimelineStayCard } from "./TripTimelineStayCard";
import { TimelineStayGroup } from "./TripTimelineStayGroup";
import { TimelineTransportConnector } from "./TripTimelineTransportConnector";

const ROW_STAGGER_STEP_S = 0.03;
/* A month-long trip runs to dozens of rows, and staggering all of them would
   leave the reader waiting on an animation instead of on the itinerary. */
const ROW_STAGGER_MAX_S = 0.36;

/**
 * Properties accepted by the Timeline component.
 * @property {TripDetailTimelineItem[]} items - The items
 * @property {boolean} showYear - The show year
 */
interface TripTimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

/**
 * Names the place a segment puts the reader in, or nothing for the segments
 * that only describe movement.
 * @param {DisplaySegment | undefined} segment - The segment to read
 * @returns {City | null} The city the segment stands at
 */
function getSegmentCity(segment: DisplaySegment | undefined): City | null {
  if (!segment) return null;
  return segment.type === "transport" ? null : segment.city;
}

/**
 * TripTimeline component
 * Renders the vertical step-by-step route timeline inside a trip detail panel.
 * Collapses transport chains, groups nested day trips under their parent stays,
 * and delegates each segment type to a dedicated sub-component.
 * @component
 * @param {TripTimelineProps} props - The timeline props
 * @param {TripDetailTimelineItem[]} props.items - Flat timeline items from buildTripDetailTimelineItems
 * @param {boolean} props.showYear - Whether to include the year in date labels
 * @returns {ReactNode} The route timeline
 */
export function TripTimeline({
  items,
  showYear,
}: TripTimelineProps): ReactNode {
  const prefersReducedMotion = useReducedMotion();
  const segments = buildDisplaySegments(items);
  return (
    <div className="trip-detail__timeline">
      {segments.map((seg, idx) => {
        const animDelay = prefersReducedMotion
          ? 0
          : Math.min(0.08 + idx * ROW_STAGGER_STEP_S, ROW_STAGGER_MAX_S);
        if (seg.type === "origin" || seg.type === "return") {
          return (
            <TimelineOriginNode
              animDelay={animDelay}
              city={seg.city}
              key={seg.key}
            />
          );
        }
        if (seg.type === "transport") {
          /*
           * The cards on either side of a connector normally name the places it
           * joins, so repeating them is noise — but back-to-back connectors and
           * multi-leg chains have no such neighbour to lean on.
           */
          const arrivesWhereExpected =
            getSegmentCity(segments[idx - 1])?.name === seg.legs[0].from.name &&
            getSegmentCity(segments[idx + 1])?.name ===
              seg.legs[seg.legs.length - 1].to.name;

          return (
            <TimelineTransportConnector
              animDelay={animDelay}
              key={seg.key}
              legs={seg.legs}
              showEndpoints={seg.legs.length > 1 || !arrivesWhereExpected}
            />
          );
        }
        if (seg.type === "stay") {
          return (
            <TimelineStayCard
              animDelay={animDelay}
              city={seg.city}
              key={seg.key}
              nights={seg.nights}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }
        if (seg.type === "stay-group") {
          return (
            <TimelineStayGroup
              animDelay={animDelay}
              city={seg.city}
              excursions={seg.excursions}
              key={seg.key}
              nights={seg.nights}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }
        if (seg.type === "day-trip") {
          return (
            <TimelineDayTripCard
              animDelay={animDelay}
              city={seg.city}
              inboundTransport={seg.inboundTransport}
              isNested={seg.isNested}
              key={seg.key}
              showYear={showYear}
              stop={seg.stop}
              travelIdx={seg.travelIdx}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
