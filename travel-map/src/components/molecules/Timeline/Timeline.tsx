import "./Timeline.scss";

import { JSX, useMemo } from "react";

import { City, TransportMode, TripStop } from "@/core";
import {
  TRIP_DETAIL_FERRY_COMPANY_NAMES,
  TRIP_DETAIL_FLIGHT_COMPANY_NAMES,
  TripDetailTimelineItem,
} from "@/utils/tripDetailTimeline";

import { TimelineDayTripCard } from "./TimelineDayTripCard";
import { TimelineOriginNode } from "./TimelineOriginNode";
import { TimelineStayCard } from "./TimelineStayCard";
import { ExcursionItem, TimelineStayGroup } from "./TimelineStayGroup";
import {
  TimelineTransportConnector,
  TransportLeg,
} from "./TimelineTransportConnector";

interface TimelineProps {
  items: TripDetailTimelineItem[];
  showYear: boolean;
}

// ── Intermediate types (after transport-chain collapse) ──────
type IntermediateOrigin = { type: "origin"; city: City };
type IntermediateReturn = { type: "return"; city: City };
type IntermediateTransport = { type: "transport"; legs: TransportLeg[] };
type IntermediateStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
};
type IntermediateDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  parentCity: City | null;
};

type IntermediateItem =
  | IntermediateOrigin
  | IntermediateReturn
  | IntermediateTransport
  | IntermediateStay
  | IntermediateDayTrip;

// ── Display segment types ─────────────────────────────────────
type SegmentOrigin = { type: "origin"; city: City; key: string };
type SegmentReturn = { type: "return"; city: City; key: string };
type SegmentTransport = {
  type: "transport";
  legs: TransportLeg[];
  key: string;
};
type SegmentDayTrip = {
  type: "day-trip";
  city: City;
  stop: TripStop;
  travelIdx: number;
  isNested: boolean;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
  };
};
// Stay without excursions renders as a plain card; stay with excursions becomes a group.
type SegmentStay = {
  type: "stay";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  key: string;
};
type SegmentStayGroup = {
  type: "stay-group";
  city: City;
  stop: TripStop;
  nights: number;
  travelIdx: number;
  excursions: ExcursionItem[];
  key: string;
};

type DisplaySegment =
  | SegmentOrigin
  | SegmentReturn
  | SegmentTransport
  | SegmentStay
  | SegmentStayGroup
  | SegmentDayTrip;

// ── Pass 1: collapse consecutive transport+layover chains ────
function collapseTransportChains(
  items: TripDetailTimelineItem[],
): IntermediateItem[] {
  const result: IntermediateItem[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    if (item.kind === "transport") {
      const legs: TransportLeg[] = [];

      while (i < items.length && items[i].kind === "transport") {
        const leg = items[i] as Extract<
          TripDetailTimelineItem,
          { kind: "transport" }
        >;
        const info =
          leg.flightInfo ??
          leg.ferryInfo ??
          leg.busInfo ??
          leg.trainInfo ??
          leg.carInfo;
        const company = leg.flightInfo
          ? TRIP_DETAIL_FLIGHT_COMPANY_NAMES[leg.flightInfo.company]
          : leg.ferryInfo
            ? TRIP_DETAIL_FERRY_COMPANY_NAMES[leg.ferryInfo.company]
            : undefined;

        legs.push({
          mode: leg.mode,
          from: leg.from,
          to: leg.to,
          company,
          distanceKm: info?.distanceKm ?? 0,
          durationMinutes: info?.durationMinutes ?? 0,
          via: leg.ferryInfo?.via,
        });
        i++;

        // Consume a following layover to join the next leg
        const peek = items[i];
        if (
          peek?.kind === "base-stop" &&
          (peek as Extract<TripDetailTimelineItem, { kind: "base-stop" }>)
            .isLayover
        ) {
          i++;
        } else {
          break;
        }
      }

      result.push({ type: "transport", legs });
    } else if (item.kind === "base-stop") {
      if (!item.isLayover) {
        result.push({
          type: "stay",
          city: item.city,
          stop: item.stop,
          nights: item.nights,
          travelIdx: item.travelIdx,
        });
      }
      i++;
    } else if (item.kind === "day-trip") {
      result.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested: item.isNested,
        parentCity: item.parentCity,
      });
      i++;
    } else if (item.kind === "origin") {
      result.push({ type: "origin", city: item.city });
      i++;
    } else if (item.kind === "return") {
      result.push({ type: "return", city: item.city });
      i++;
    } else {
      i++;
    }
  }

  return result;
}

function buildDisplaySegments(
  items: TripDetailTimelineItem[],
): DisplaySegment[] {
  const intermediate = collapseTransportChains(items);
  const raw: (
    | SegmentOrigin
    | SegmentReturn
    | SegmentTransport
    | SegmentStay
    | SegmentDayTrip
  )[] = [];
  let pendingDayTripTransport: SegmentDayTrip["inboundTransport"];

  // Pass 1: flatten with transport suppression
  for (let i = 0; i < intermediate.length; i++) {
    const item = intermediate[i];

    if (item.type === "transport") {
      // Skip return transport from a day trip back to the parent base city
      const prev = i > 0 ? intermediate[i - 1] : null;
      if (prev?.type === "day-trip" && prev.parentCity) {
        const finalDest = item.legs[item.legs.length - 1].to;
        if (finalDest.name === prev.parentCity.name) continue;
      }

      // Suppress car/bus transport heading into a nested day trip; attach to the excursion row
      const next = i + 1 < intermediate.length ? intermediate[i + 1] : null;
      const leadsToNestedDayTrip =
        next?.type === "day-trip" && (next as IntermediateDayTrip).isNested;
      if (leadsToNestedDayTrip) {
        const lastLeg = item.legs[item.legs.length - 1];
        if (lastLeg.mode === "car" || lastLeg.mode === "bus") {
          pendingDayTripTransport = {
            mode: lastLeg.mode,
            distanceKm: lastLeg.distanceKm,
            durationMinutes: lastLeg.durationMinutes,
          };
          continue;
        }
      }

      raw.push({ type: "transport", legs: item.legs, key: `transport-${i}` });
    } else if (item.type === "stay") {
      pendingDayTripTransport = undefined;
      raw.push({
        type: "stay",
        city: item.city,
        stop: item.stop,
        nights: item.nights,
        travelIdx: item.travelIdx,
        key: `stay-${item.city.name}-${item.travelIdx}`,
      });
    } else if (item.type === "day-trip") {
      const inboundTransport = item.isNested
        ? pendingDayTripTransport
        : undefined;
      pendingDayTripTransport = undefined;
      raw.push({
        type: "day-trip",
        city: item.city,
        stop: item.stop,
        travelIdx: item.travelIdx,
        isNested: item.isNested,
        key: `day-trip-${item.city.name}-${item.travelIdx}`,
        inboundTransport,
      });
    } else if (item.type === "origin") {
      raw.push({ type: "origin", city: item.city, key: "origin" });
    } else if (item.type === "return") {
      raw.push({ type: "return", city: item.city, key: "return" });
    }
  }

  // Pass 2: merge each stay with immediately following nested day trips → stay-group
  const merged: DisplaySegment[] = [];
  let j = 0;
  while (j < raw.length) {
    const seg = raw[j];
    if (seg.type === "stay") {
      const excursions: ExcursionItem[] = [];
      let k = j + 1;
      while (
        k < raw.length &&
        raw[k].type === "day-trip" &&
        (raw[k] as SegmentDayTrip).isNested
      ) {
        const exc = raw[k] as SegmentDayTrip;
        excursions.push({
          city: exc.city,
          travelIdx: exc.travelIdx,
          stop: exc.stop,
          key: exc.key,
          inboundTransport: exc.inboundTransport,
        });
        k++;
      }
      if (excursions.length > 0) {
        merged.push({
          type: "stay-group",
          city: seg.city,
          stop: seg.stop,
          nights: seg.nights,
          travelIdx: seg.travelIdx,
          excursions,
          key: seg.key,
        });
        j = k;
      } else {
        merged.push(seg);
        j++;
      }
    } else {
      merged.push(seg);
      j++;
    }
  }

  return merged;
}

// ── Component ─────────────────────────────────────────────────
export function Timeline({ items, showYear }: TimelineProps): JSX.Element {
  const segments = useMemo(() => buildDisplaySegments(items), [items]);

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
