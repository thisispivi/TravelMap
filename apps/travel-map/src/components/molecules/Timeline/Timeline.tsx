import "./Timeline.scss";

import { ReactNode } from "react";

import {
  buildDisplaySegments,
  TripDetailTimelineItem,
} from "@/utils/tripDetailTimeline";

import { TimelineDayTripCard } from "./TimelineDayTripCard";
import { TimelineOriginNode } from "./TimelineOriginNode";
import { TimelineStayCard } from "./TimelineStayCard";
import { TimelineStayGroup } from "./TimelineStayGroup";
import { TimelineTransportConnector } from "./TimelineTransportConnector";

/**
 * Properties accepted by the Timeline component.
 * @property {TripDetailTimelineItem[]} items - The items
 * @property {boolean} showYear - The show year
 */
interface TimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

/**
 * Timeline component
 * Renders the vertical step-by-step route timeline inside a trip detail panel.
 * Collapses transport chains, groups nested day trips under their parent stays,
 * and delegates each segment type to a dedicated sub-component.
 * @component
 * @param {TimelineProps} props - The timeline props
 * @param {TripDetailTimelineItem[]} props.items - Flat timeline items from buildTripDetailTimelineItems
 * @param {boolean} props.showYear - Whether to include the year in date labels
 * @returns {ReactNode} The route timeline
 */
export function Timeline({ items, showYear }: TimelineProps): ReactNode {
  const segments = buildDisplaySegments(items);
  return (
    <div className="trip-detail__timeline">
      {segments.map((seg, idx) => {
        const animDelay = 0.08 + idx * 0.03;
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
          return (
            <TimelineTransportConnector
              animDelay={animDelay}
              key={seg.key}
              legs={seg.legs}
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
